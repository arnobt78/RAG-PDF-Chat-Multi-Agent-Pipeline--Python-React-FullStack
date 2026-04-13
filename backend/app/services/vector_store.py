"""
Vector Store Service

Manages FAISS vector store for document embeddings and retrieval.
Supports multiple embedding providers with fallback.
"""

from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

from ..config import get_settings, get_default_provider, AI_PROVIDERS


class VectorStoreService:
    """
    Service for managing vector store operations.
    
    Handles:
    - Creating embeddings from documents
    - Building and querying FAISS index
    - Similarity search for retrieval
    
    Usage:
        service = VectorStoreService()
        service.create_from_documents(chunks)
        results = service.similarity_search("query", k=4)
    """
    
    def __init__(self):
        """Initialize the vector store service."""
        self.settings = get_settings()
        self.vectorstore: Optional[FAISS] = None
        self.embeddings = self._create_embeddings()
    
    def _create_embeddings(self) -> OpenAIEmbeddings:
        """
        Create embeddings model using available provider.
        
        Returns:
            Configured OpenAIEmbeddings instance
        """
        # Get provider with embedding support
        provider = get_default_provider()
        
        # Find a provider with embedding model
        embedding_model = provider.embedding_model
        if not embedding_model:
            # Fall back to OpenRouter which supports embeddings
            provider = AI_PROVIDERS.get("openrouter", provider)
            embedding_model = provider.embedding_model or "openai/text-embedding-3-small"
        
        return OpenAIEmbeddings(
            base_url=provider.base_url,
            model=embedding_model,
            api_key=provider.api_key or self.settings.openai_api_key,
        )
    
    def create_from_documents(self, documents: List[Document]) -> int:
        """
        Create vector store from document chunks.
        
        Args:
            documents: List of document chunks to embed
            
        Returns:
            Number of documents indexed
        """
        self.vectorstore = FAISS.from_documents(
            documents,
            self.embeddings
        )
        return len(documents)
    
    def similarity_search(
        self,
        query: str,
        k: Optional[int] = None
    ) -> List[Document]:
        """
        Search for similar documents.
        
        Args:
            query: Search query text
            k: Number of results to return (default from settings)
            
        Returns:
            List of most similar documents
            
        Raises:
            ValueError: If vector store not initialized
        """
        if self.vectorstore is None:
            raise ValueError("Vector store not initialized. Upload a PDF first.")
        
        k = k or self.settings.retrieval_k
        return self.vectorstore.similarity_search(query, k=k)
    
    def get_retriever(self, k: Optional[int] = None):
        """
        Get a retriever for use in chains.
        
        Args:
            k: Number of documents to retrieve
            
        Returns:
            Configured retriever
        """
        if self.vectorstore is None:
            raise ValueError("Vector store not initialized. Upload a PDF first.")
        
        k = k or self.settings.retrieval_k
        return self.vectorstore.as_retriever(
            search_kwargs={"k": k}
        )
    
    @property
    def is_ready(self) -> bool:
        """Check if vector store is ready for queries."""
        return self.vectorstore is not None
    
    def clear(self) -> None:
        """Clear the current vector store."""
        self.vectorstore = None
