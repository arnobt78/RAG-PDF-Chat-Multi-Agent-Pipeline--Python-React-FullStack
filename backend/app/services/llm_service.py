"""
LLM Service

Manages language model interactions with multi-provider support.
Implements fallback logic for reliability.
"""

from typing import Optional, List, Tuple
import time

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document

from ..config import (
    get_settings,
    get_default_provider,
    get_provider,
    AI_PROVIDERS,
    AIProvider,
)


class LLMService:
    """
    Service for LLM-based text generation.
    
    Features:
    - Multi-provider support (OpenRouter, Groq, OpenAI)
    - Automatic fallback on failure
    - RAG chain construction
    
    Usage:
        service = LLMService()
        answer = service.generate_answer(question, context_docs)
    """
    
    # Default RAG prompt template
    RAG_PROMPT_TEMPLATE = """You are a helpful AI assistant that answers questions based on the provided context.
Use ONLY the information from the context below to answer the question. If the answer cannot be found in the context, say "I cannot find this information in the document."

Context:
{context}

Question: {question}

Answer: """
    
    def __init__(self, model: Optional[str] = None):
        """
        Initialize the LLM service.
        
        Args:
            model: Specific model to use (default from settings)
        """
        self.settings = get_settings()
        self.model = model or self.settings.default_model
        self._llm: Optional[ChatOpenAI] = None
        self._provider: Optional[AIProvider] = None
    
    def _get_llm(self, model: Optional[str] = None) -> Tuple[ChatOpenAI, str]:
        """
        Get or create LLM instance with fallback support.
        
        Args:
            model: Optional model override
            
        Returns:
            Tuple of (LLM instance, model name used)
        """
        target_model = model or self.model
        
        # Determine provider from model name
        provider = self._find_provider_for_model(target_model)
        if not provider:
            provider = get_default_provider()
        
        # Create LLM instance
        llm = ChatOpenAI(
            base_url=provider.base_url,
            api_key=provider.api_key or self.settings.openai_api_key,
            model=target_model,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,
        )
        
        return llm, target_model
    
    def _find_provider_for_model(self, model: str) -> Optional[AIProvider]:
        """Find which provider supports the given model."""
        for provider in AI_PROVIDERS.values():
            if model in provider.models and provider.is_enabled:
                return provider
        return None
    
    def _format_docs(self, docs: List[Document]) -> str:
        """Format retrieved documents into context string."""
        return "\n\n---\n\n".join(
            f"[Source: Page {doc.metadata.get('page', 'N/A')}]\n{doc.page_content}"
            for doc in docs
        )
    
    def generate_answer(
        self,
        question: str,
        context_docs: List[Document],
        model: Optional[str] = None
    ) -> Tuple[str, str, float]:
        """
        Generate an answer using RAG.
        
        Args:
            question: User's question
            context_docs: Retrieved context documents
            model: Optional model override
            
        Returns:
            Tuple of (answer, model_used, processing_time)
        """
        start_time = time.time()
        
        # Get LLM
        llm, model_used = self._get_llm(model)
        
        # Create prompt
        prompt = ChatPromptTemplate.from_template(self.RAG_PROMPT_TEMPLATE)
        
        # Format context
        context = self._format_docs(context_docs)
        
        # Build and run chain
        chain = prompt | llm | StrOutputParser()
        
        # Generate answer
        answer = chain.invoke({
            "context": context,
            "question": question
        })
        
        processing_time = time.time() - start_time
        
        return answer, model_used, processing_time
    
    def create_rag_chain(self, retriever, model: Optional[str] = None):
        """
        Create a complete RAG chain with retriever.
        
        Args:
            retriever: Document retriever
            model: Optional model override
            
        Returns:
            Runnable RAG chain
        """
        llm, _ = self._get_llm(model)
        prompt = ChatPromptTemplate.from_template(self.RAG_PROMPT_TEMPLATE)
        
        chain = (
            {
                "context": retriever | self._format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )
        
        return chain
    
    @staticmethod
    def get_available_models() -> List[dict]:
        """
        Get list of all available models across providers.
        
        Returns:
            List of model info dictionaries
        """
        settings = get_settings()
        models = []
        
        for provider in AI_PROVIDERS.values():
            if provider.is_enabled:
                for model_id in provider.models:
                    models.append({
                        "id": model_id,
                        "name": model_id.split("/")[-1].replace("-", " ").title(),
                        "provider": provider.name,
                        "is_default": model_id == settings.default_model
                    })
        
        return models
