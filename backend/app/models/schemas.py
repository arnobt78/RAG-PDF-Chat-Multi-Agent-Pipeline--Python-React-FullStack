"""
Pydantic Schemas

Request and response models for the API.
These ensure type safety and automatic validation.

FastAPI uses these models to build OpenAPI ``components.schemas`` — compare with ``/docs`` while learning.
"""


from pydantic import BaseModel, Field

# ============================================================================
# Request Models
# ============================================================================

class QuestionRequest(BaseModel):
    """
    Request body for asking questions about a PDF.
    
    Attributes:
        question: The user's question about the document
        model: Optional model override (uses default if not specified)
        include_sources: Whether to include source chunks in response
    """
    question: str = Field(..., min_length=1, max_length=2000)
    model: str | None = None
    include_sources: bool = False


# ============================================================================
# Response Models
# ============================================================================

class AnswerResponse(BaseModel):
    """
    Response containing the AI-generated answer.
    
    Attributes:
        answer: The generated answer text
        model_used: Which model generated the response
        sources: Optional list of source chunks used
        processing_time: Time taken to generate response
    """
    answer: str
    model_used: str | None = None
    sources: list[str] | None = None
    processing_time: float | None = None


class UploadResponse(BaseModel):
    """
    Response after PDF upload and processing.
    
    Attributes:
        message: Success message
        chunks_created: Number of text chunks created
        file_name: Name of uploaded file
    """
    message: str
    chunks_created: int
    file_name: str | None = None


class StatusResponse(BaseModel):
    """
    System status response.
    
    Attributes:
        status: Current status (running, error, etc.)
        message: Human-readable status message
        pdf_loaded: Whether a PDF is currently loaded
        model: Currently configured model
    """
    status: str = "running"
    message: str
    pdf_loaded: bool = False
    model: str | None = None


class ModelInfo(BaseModel):
    """
    Information about an available AI model.
    
    Attributes:
        id: Model identifier
        name: Human-readable name
        provider: Which provider serves this model
        is_default: Whether this is the default model
    """
    id: str
    name: str
    provider: str
    is_default: bool = False


class ModelsResponse(BaseModel):
    """
    Response listing available models.
    
    Attributes:
        models: List of available models
        default_model: Current default model ID
    """
    models: list[ModelInfo]
    default_model: str


class ErrorResponse(BaseModel):
    """
    Standard error response.
    
    Attributes:
        detail: Error message
        error_code: Optional error code for programmatic handling
    """
    detail: str
    error_code: str | None = None


class AgentStepInfo(BaseModel):
    """
    Information about an agent pipeline step.
    
    Used for debugging and transparency about RAG process.
    
    Attributes:
        agent: Name of the agent
        input_summary: Summary of input data
        output_summary: Summary of output data
        duration_ms: Processing time in milliseconds
    """
    agent: str
    input_summary: str
    output_summary: str
    duration_ms: float
