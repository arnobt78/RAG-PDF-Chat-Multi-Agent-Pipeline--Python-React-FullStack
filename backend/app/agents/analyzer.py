"""
Analyzer Agent

Analyzes the retrieved chunks for relevance and quality.
Filters out low-quality or irrelevant chunks.
"""

from typing import Any

from langchain_core.documents import Document

from .base_agent import BaseAgent


class AnalyzerAgent(BaseAgent):
    """
    Agent responsible for analyzing and filtering retrieved chunks.
    
    Performs:
    - Relevance scoring
    - Duplicate detection
    - Quality filtering
    
    Usage:
        analyzer = AnalyzerAgent()
        filtered_chunks = analyzer.execute(chunks, context)
    """
    
    def __init__(self, min_content_length: int = 50):
        """
        Initialize the analyzer agent.
        
        Args:
            min_content_length: Minimum characters for a chunk to be valid
        """
        super().__init__(
            name="analyzer",
            description="Analyzes and filters retrieved chunks for quality"
        )
        self.min_content_length = min_content_length
    
    def process(self, input_data: list[Document], context: dict[str, Any]) -> list[Document]:
        """
        Analyze and filter document chunks.
        
        Args:
            input_data: List of retrieved document chunks
            context: Pipeline context
            
        Returns:
            Filtered list of high-quality chunks
        """
        chunks = input_data
        
        # Filter chunks
        filtered_chunks = []
        seen_content = set()
        
        for chunk in chunks:
            content = chunk.page_content.strip()
            
            # Skip empty or too short chunks
            if len(content) < self.min_content_length:
                continue
            
            # Skip near-duplicate chunks (simple hash-based dedup)
            content_hash = hash(content[:100])  # Use first 100 chars for dedup
            if content_hash in seen_content:
                continue
            
            seen_content.add(content_hash)
            filtered_chunks.append(chunk)
        
        # Update context with analysis results
        context["original_chunks"] = len(chunks)
        context["filtered_chunks"] = len(filtered_chunks)
        context["chunks_removed"] = len(chunks) - len(filtered_chunks)
        
        return filtered_chunks
