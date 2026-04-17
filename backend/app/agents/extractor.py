"""
Extractor Agent

Retrieves relevant document chunks from the vector store
based on the user's question.
"""

from typing import Any

from langchain_core.documents import Document

from ..services.vector_store import VectorStoreService
from .base_agent import BaseAgent


class ExtractorAgent(BaseAgent):
    """
    Agent responsible for extracting relevant chunks from vector store.
    
    This is typically the first agent in the pipeline.
    It takes a question and returns the most relevant document chunks.
    
    Usage:
        extractor = ExtractorAgent(vector_service)
        result = extractor.execute(question, context)
    """
    
    def __init__(self, vector_service: VectorStoreService, k: int = 4):
        """
        Initialize the extractor agent.
        
        Args:
            vector_service: Vector store service instance
            k: Number of chunks to retrieve
        """
        super().__init__(
            name="extractor",
            description="Retrieves relevant document chunks from vector store"
        )
        self.vector_service = vector_service
        self.k = k
    
    def process(self, input_data: str, context: dict[str, Any]) -> list[Document]:
        """
        Extract relevant chunks for the question.
        
        Args:
            input_data: The user's question
            context: Pipeline context (may contain k override)
            
        Returns:
            List of relevant document chunks
        """
        question = input_data
        k = context.get("retrieval_k", self.k)  # pipeline may override k per request
        
        # Embed the question with the *same* embedding model as the index, then FAISS nearest neighbors.
        chunks = self.vector_service.similarity_search(question, k=k)
        
        # Store metadata in context for later agents
        context["retrieved_chunks"] = len(chunks)
        context["chunk_sources"] = [
            chunk.metadata.get("page", "N/A") for chunk in chunks
        ]
        
        return chunks
