"""
LLM Service

Manages language model interactions with multi-provider support.
Implements ordered failover logic across OpenRouter, Groq, Gemini,
Hugging Face, and direct OpenAI for maximum reliability.

``generate_answer`` builds a small LCEL chain (prompt | llm | parser) each call;
``get_available_models`` aggregates static model lists from providers that have keys.
"""

import logging
import time
from typing import Any, cast

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

from ..config import (
    AI_PROVIDERS,
    PROVIDER_PRIORITY,
    AIProvider,
    get_default_provider,
    get_settings,
    provider_has_credentials,
)

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for LLM-based text generation.

    Features:
    - Multi-provider support (OpenRouter, Groq, OpenAI, Gemini, HuggingFace)
    - Automatic ordered failover on provider failure
    - RAG chain construction

    Usage:
        service = LLMService()
        answer, model, time_s = service.generate_answer(question, docs)
    """

    RAG_PROMPT_TEMPLATE = """You are a helpful AI assistant that answers questions based on the provided context.
Use ONLY the information from the context below to answer the question. If the answer cannot be found in the context, say "I cannot find this information in the document."

Context:
{context}

Question: {question}

Answer: """

    def __init__(self, model: str | None = None):
        self.settings = get_settings()
        self.model = model or self.settings.default_model

    # ------------------------------------------------------------------
    # Provider / LLM helpers
    # ------------------------------------------------------------------

    def _resolve_llm_api_key(self, provider: AIProvider) -> Any:
        s = self.settings
        if provider.name == "openrouter":
            return provider.api_key or s.openrouter_api_key
        if provider.name == "openai":
            return provider.api_key or s.openai_direct_api_key
        if provider.name == "groq":
            return provider.api_key or s.groq_api_key
        if provider.name == "gemini":
            return provider.api_key or s.google_api_key
        if provider.name == "huggingface":
            return provider.api_key or s.hf_api_key
        return provider.api_key

    def _build_llm(self, provider: AIProvider, model_id: str) -> ChatOpenAI:
        """Create a ChatOpenAI instance pointing at the given provider."""
        base_url = (
            self.settings.openrouter_api_base
            if provider.name == "openrouter"
            else provider.base_url
        )
        return ChatOpenAI(
            base_url=base_url,
            api_key=cast(Any, self._resolve_llm_api_key(provider)),
            model=model_id,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,  # pyright: ignore[reportCallIssue]
        )

    def _find_provider_for_model(self, model: str) -> AIProvider | None:
        """Find which provider supports the given model."""
        for provider in AI_PROVIDERS.values():
            if model in provider.models and provider_has_credentials(provider):
                return provider
        return None

    def _get_llm(self, model: str | None = None) -> tuple[ChatOpenAI, str]:
        """Get LLM instance for the requested model."""
        target_model = model or self.model
        provider = self._find_provider_for_model(target_model)
        if not provider:
            provider = get_default_provider()
        return self._build_llm(provider, target_model), target_model

    # ------------------------------------------------------------------
    # Failover-aware generation
    # ------------------------------------------------------------------

    def _llm_attempt_sequence(self, preferred_model: str | None) -> list[tuple[AIProvider, str]]:
        """Ordered (provider, model_id) tries: selected provider first, then all credentialed models."""
        seen: set[tuple[str, str]] = set()
        seq: list[tuple[AIProvider, str]] = []

        def add(p: AIProvider, mid: str) -> None:
            if not provider_has_credentials(p) or mid not in p.models:
                return
            key = (p.name, mid)
            if key in seen:
                return
            seen.add(key)
            seq.append((p, mid))

        if preferred_model:
            pref_p = self._find_provider_for_model(preferred_model)
            if pref_p and preferred_model in pref_p.models:
                add(pref_p, preferred_model)
                for mid in pref_p.models:
                    if mid != preferred_model:
                        add(pref_p, mid)

        for name in PROVIDER_PRIORITY:
            p = AI_PROVIDERS.get(name)
            if not p:
                continue
            for mid in p.models:
                add(p, mid)

        return seq

    def _generate_with_failover(
        self,
        question: str,
        context: str,
        preferred_model: str | None = None,
    ) -> tuple[str, str]:
        """
        Try the preferred model first, then every other credentialed model in priority order.
        Returns (answer, model_used).
        """
        prompt = ChatPromptTemplate.from_template(self.RAG_PROMPT_TEMPLATE)
        payload = {"context": context, "question": question}

        for provider, model_id in self._llm_attempt_sequence(preferred_model):
            try:
                llm = self._build_llm(provider, model_id)
                chain = prompt | llm | StrOutputParser()
                answer = chain.invoke(payload)
                logger.info("LLM succeeded: %s / %s", provider.name, model_id)
                return answer, model_id
            except Exception as exc:
                logger.warning("LLM %s/%s failed: %s", provider.name, model_id, exc)

        raise RuntimeError("All AI providers failed. Check your API keys and try again.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @staticmethod
    def _format_docs(docs: list[Document]) -> str:
        """Format retrieved documents into context string."""
        return "\n\n---\n\n".join(
            f"[Source: Page {doc.metadata.get('page', 'N/A')}]\n{doc.page_content}"
            for doc in docs
        )

    def generate_answer(
        self,
        question: str,
        context_docs: list[Document],
        model: str | None = None,
    ) -> tuple[str, str, float]:
        """
        Generate an answer using RAG with automatic failover.

        Returns:
            Tuple of (answer, model_used, processing_time_seconds)
        """
        start_time = time.time()
        context = self._format_docs(context_docs)
        answer, model_used = self._generate_with_failover(question, context, model or self.model)
        processing_time = time.time() - start_time
        return answer, model_used, processing_time

    def create_rag_chain(self, retriever, model: str | None = None):
        """Create a complete RAG chain with retriever."""
        llm, _ = self._get_llm(model)
        prompt = ChatPromptTemplate.from_template(self.RAG_PROMPT_TEMPLATE)
        chain = (
            {
                "context": retriever | self._format_docs,
                "question": RunnablePassthrough(),
            }
            | prompt
            | llm
            | StrOutputParser()
        )
        return chain

    @staticmethod
    def get_available_models() -> list[dict]:
        """Get list of all available models across enabled providers."""
        settings = get_settings()
        models = []
        for provider in AI_PROVIDERS.values():
            if provider_has_credentials(provider):
                for model_id in provider.models:
                    models.append({
                        "id": model_id,
                        "name": model_id.split("/")[-1].replace("-", " ").title(),
                        "provider": provider.name,
                        "is_default": model_id == settings.default_model,
                    })
        return models
