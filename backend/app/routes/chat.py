"""
Chat Routes

Endpoints for asking questions and getting AI-generated answers.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..models import QuestionRequest, AnswerResponse
from ..services.vector_store import VectorStoreService
from ..services.llm_service import LLMService
from ..agents.pipeline import AgentPipeline
from .upload import get_vector_service

router = APIRouter(tags=["Chat"])

# Global LLM service
_llm_service: LLMService = None
_pipeline: AgentPipeline = None


def get_llm_service() -> LLMService:
    """Dependency to get LLM service."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def get_pipeline(
    vector_service: VectorStoreService = Depends(get_vector_service),
    llm_service: LLMService = Depends(get_llm_service)
) -> AgentPipeline:
    """Dependency to get agent pipeline."""
    return AgentPipeline(vector_service, llm_service)


def set_llm_service(llm_service: LLMService):
    """Set global LLM service from main app."""
    global _llm_service
    _llm_service = llm_service


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(
    request: QuestionRequest,
    vector_service: VectorStoreService = Depends(get_vector_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    """
    Ask a question about the uploaded PDF.
    
    Uses the full 7-agent RAG pipeline:
    1. Extractor      – Retrieves relevant chunks
    2. Analyzer        – Filters low-quality / duplicates
    3. Preprocessor    – Cleans & normalizes text
    4. Optimizer       – Reorders / trims to token budget
    5. Synthesizer     – Generates answer via LLM
    6. Validator       – Quality-checks the answer
    7. Assembler       – Packages structured output
    
    Args:
        request: Question and optional settings
        
    Returns:
        AnswerResponse with AI-generated answer
        
    Raises:
        HTTPException: If no PDF loaded or processing fails
    """
    # Check if PDF is loaded
    if not vector_service.is_ready:
        raise HTTPException(
            status_code=400,
            detail="No PDF has been loaded. Please upload a PDF first."
        )
    
    try:
        # Create and run pipeline
        pipeline = AgentPipeline(vector_service, llm_service)
        result = pipeline.run(
            question=request.question,
            model=request.model,
            include_sources=request.include_sources
        )
        
        if not result.success:
            raise HTTPException(
                status_code=500,
                detail=result.error or "Failed to generate answer"
            )
        
        # Build response – Assembler already packages sources when requested
        return AnswerResponse(
            answer=result.answer or "",
            model_used=result.model_used,
            processing_time=result.processing_time,
            sources=result.sources,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )
