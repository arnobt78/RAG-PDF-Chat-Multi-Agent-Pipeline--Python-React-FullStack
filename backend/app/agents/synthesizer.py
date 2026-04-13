"""
Synthesizer Agent

Generates the final answer using the LLM based on
the filtered context and question.
"""

from typing import Any

from langchain_core.documents import Document

from ..services.llm_service import LLMService
from .base_agent import BaseAgent


class SynthesizerAgent(BaseAgent):
    """
    Agent responsible for generating answers using LLM.
    
    Takes filtered context chunks and the original question,
    then uses the LLM to generate a comprehensive answer.
    
    Usage:
        synthesizer = SynthesizerAgent(llm_service)
        answer = synthesizer.execute((question, chunks), context)
    """
    
    def __init__(self, llm_service: LLMService):
        """
        Initialize the synthesizer agent.
        
        Args:
            llm_service: LLM service instance
        """
        super().__init__(
            name="synthesizer",
            description="Generates answers using LLM"
        )
        self.llm_service = llm_service
    
    def process(
        self,
        input_data: tuple[str, list[Document]],
        context: dict[str, Any]
    ) -> str:
        """
        Generate answer from question and context.
        
        Args:
            input_data: Tuple of (question, filtered_chunks)
            context: Pipeline context (may contain model override)
            
        Returns:
            Generated answer string
        """
        question, chunks = input_data
        model = context.get("model")
        
        # Generate answer
        answer, model_used, processing_time = self.llm_service.generate_answer(
            question=question,
            context_docs=chunks,
            model=model
        )
        
        # Store metadata in context
        context["model_used"] = model_used
        context["llm_processing_time"] = processing_time
        context["answer_length"] = len(answer)
        
        return answer
