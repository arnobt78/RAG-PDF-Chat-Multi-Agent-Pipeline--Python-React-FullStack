"""
LLM Service

Manages language model interactions with multi-provider support.
Implements ordered failover logic across OpenRouter, Groq, Gemini,
Hugging Face, and direct OpenAI for maximum reliability.
"""

import logging
from typing import Any, List, Optional, Tuple, cast
import time

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

from ..config import (
    get_settings,
    get_default_provider,
    get_fallback_chain,
    AI_PROVIDERS,
    AIProvider,
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

    def __init__(self, model: Optional[str] = None):
        self.settings = get_settings()
        self.model = model or self.settings.default_model

    # ------------------------------------------------------------------
    # Provider / LLM helpers
    # ------------------------------------------------------------------

    def _build_llm(self, provider: AIProvider, model_id: str) -> ChatOpenAI:
        """Create a ChatOpenAI instance pointing at the given provider."""
        return ChatOpenAI(
            base_url=provider.base_url,
            api_key=cast(Any, provider.api_key or self.settings.openai_api_key),
            model=model_id,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,  # pyright: ignore[reportCallIssue]
        )

    def _find_provider_for_model(self, model: str) -> Optional[AIProvider]:
        """Find which provider supports the given model."""
        for provider in AI_PROVIDERS.values():
            if model in provider.models and provider.is_enabled:
                return provider
        return None

    def _get_llm(self, model: Optional[str] = None) -> Tuple[ChatOpenAI, str]:
        """Get LLM instance for the requested model."""
        target_model = model or self.model
        provider = self._find_provider_for_model(target_model)
        if not provider:
            provider = get_default_provider()
        return self._build_llm(provider, target_model), target_model

    # ------------------------------------------------------------------
    # Failover-aware generation
    # ------------------------------------------------------------------

    def _generate_with_failover(
        self,
        question: str,
        context: str,
        preferred_model: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Try the preferred model first, then walk the fallback chain.
        Returns (answer, model_used).
        """
        prompt = ChatPromptTemplate.from_template(self.RAG_PROMPT_TEMPLATE)
        payload = {"context": context, "question": question}

        # Attempt 1: preferred model
        if preferred_model:
            provider = self._find_provider_for_model(preferred_model)
            if provider:
                try:
                    llm = self._build_llm(provider, preferred_model)
                    chain = prompt | llm | StrOutputParser()
                    answer = chain.invoke(payload)
                    return answer, preferred_model
                except Exception as exc:
                    logger.warning("Primary model %s failed: %s", preferred_model, exc)

        # Attempt 2+: ordered fallback across providers
        for provider in get_fallback_chain():
            fallback_model = provider.models[0] if provider.models else None
            if not fallback_model:
                continue
            try:
                llm = self._build_llm(provider, fallback_model)
                chain = prompt | llm | StrOutputParser()
                answer = chain.invoke(payload)
                logger.info("Fallback succeeded: %s / %s", provider.name, fallback_model)
                return answer, fallback_model
            except Exception as exc:
                logger.warning("Fallback %s/%s failed: %s", provider.name, fallback_model, exc)

        raise RuntimeError("All AI providers failed. Check your API keys and try again.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @staticmethod
    def _format_docs(docs: List[Document]) -> str:
        """Format retrieved documents into context string."""
        return "\n\n---\n\n".join(
            f"[Source: Page {doc.metadata.get('page', 'N/A')}]\n{doc.page_content}"
            for doc in docs
        )

    def generate_answer(
        self,
        question: str,
        context_docs: List[Document],
        model: Optional[str] = None,
    ) -> Tuple[str, str, float]:
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

    def create_rag_chain(self, retriever, model: Optional[str] = None):
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
    def get_available_models() -> List[dict]:
        """Get list of all available models across enabled providers."""
        settings = get_settings()
        models = []
        for provider in AI_PROVIDERS.values():
            if provider.is_enabled:
                for model_id in provider.models:
                    models.append({
                        "id": model_id,
                        "name": model_id.split("/")[-1].replace("-", " ").title(),
                        "provider": provider.name,
                        "is_default": model_id == settings.default_model,
                    })
        return models
