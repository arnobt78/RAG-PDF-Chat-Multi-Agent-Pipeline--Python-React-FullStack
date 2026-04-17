"""
Health Check Routes

Endpoints for system health, status monitoring, and pipeline info.

These routes intentionally do **not** require ``X-Chat-Session-Id`` so load
balancers, Docker HEALTHCHECK, and the model dropdown can call them freely.
"""


from fastapi import APIRouter

from ..config import get_settings
from ..models import ModelInfo, ModelsResponse, StatusResponse
from ..services.llm_service import LLMService

router = APIRouter(tags=["Health"])


@router.get("/", response_model=StatusResponse)
async def root():
    """
    Root endpoint - basic health check.
    
    Returns simple status to confirm API is running.
    """
    return StatusResponse(
        status="running",
        message="RAG PDF Chat API is ready"
    )


@router.get("/health", response_model=StatusResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns detailed health status including configuration.
    """
    settings = get_settings()
    return StatusResponse(
        status="healthy",
        message="All systems operational",
        model=settings.default_model
    )


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """
    List available AI models.
    
    Returns all models available across configured providers.
    """
    settings = get_settings()
    models = LLMService.get_available_models()
    
    model_infos = [
        ModelInfo(
            id=m["id"],
            name=m["name"],
            provider=m["provider"],
            is_default=m["is_default"]
        )
        for m in models
    ]
    
    return ModelsResponse(
        models=model_infos,
        default_model=settings.default_model
    )


@router.get("/pipeline-info")
async def pipeline_info():
    """
    Describe the 7-agent RAG pipeline stages.

    Useful for frontend visualization and documentation.
    """
    stages: list[dict] = [
        {
            "order": 1,
            "name": "Extractor",
            "description": "Retrieves relevant document chunks from the FAISS vector store via similarity search.",
        },
        {
            "order": 2,
            "name": "Analyzer",
            "description": "Filters duplicates and low-quality chunks; scores remaining chunks for relevance.",
        },
        {
            "order": 3,
            "name": "Preprocessor",
            "description": "Normalizes unicode, collapses whitespace, and trims excessively long chunks.",
        },
        {
            "order": 4,
            "name": "Optimizer",
            "description": "Reorders chunks by relevance and trims combined context to fit the token budget.",
        },
        {
            "order": 5,
            "name": "Synthesizer",
            "description": "Generates a comprehensive answer using the selected LLM and optimized context.",
        },
        {
            "order": 6,
            "name": "Validator",
            "description": "Quality-checks length, coherence, and uncertainty markers in the answer.",
        },
        {
            "order": 7,
            "name": "Assembler",
            "description": "Packages answer with source citations, model info, and pipeline telemetry.",
        },
    ]
    return {"pipeline": stages, "total_agents": len(stages)}
