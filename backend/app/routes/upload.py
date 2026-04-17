"""
Upload Routes

Endpoints for PDF upload and processing.

Learning notes:
    - ``require_session_id`` validates the ``X-Chat-Session-Id`` header (UUID v4).
      Without it, the API cannot know which on-disk FAISS folder to use.
    - ``check_upload_rate_limit`` protects expensive embedding + index work.
    - ``GET /status`` shares the same session dependency so the UI can poll readiness.
"""


from typing import Annotated

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile

from ..config import get_settings
from ..models import StatusResponse, UploadResponse
from ..services.ip_rate_limit import check_upload_rate_limit
from ..services.pdf_processor import PDFProcessor
from ..services.session_vector_registry import SessionVectorRegistry, is_valid_session_id
from ..services.vector_store import VectorStoreService

router = APIRouter(tags=["Upload"])

# Global services (initialized in main.py and injected)
_pdf_processor: PDFProcessor | None = None
_vector_registry: SessionVectorRegistry | None = None


def get_pdf_processor() -> PDFProcessor:
    """Dependency to get PDF processor."""
    global _pdf_processor
    if _pdf_processor is None:
        _pdf_processor = PDFProcessor()
    return _pdf_processor


def get_vector_registry() -> SessionVectorRegistry:
    global _vector_registry
    if _vector_registry is None:
        raise RuntimeError("SessionVectorRegistry not initialized")
    return _vector_registry


def require_session_id(
    x_chat_session_id: Annotated[str | None, Header()] = None,
) -> str:
    """Anonymous browser session (UUID). No auth — isolates FAISS per tab/device."""
    sid = (x_chat_session_id or "").strip()
    if not sid or not is_valid_session_id(sid):
        raise HTTPException(
            status_code=400,
            detail="Missing or invalid X-Chat-Session-Id header (send a UUID v4).",
        )
    return sid


def get_vector_service(
    session_id: Annotated[str, Depends(require_session_id)],
) -> VectorStoreService:
    # Registry returns a cached VectorStoreService or constructs + loads from disk for this UUID.
    return get_vector_registry().get_or_create(session_id)


def set_services(pdf_processor: PDFProcessor, vector_registry: SessionVectorRegistry):
    """Set global services from main app."""
    global _pdf_processor, _vector_registry
    _pdf_processor = pdf_processor
    _vector_registry = vector_registry


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    _: None = Depends(check_upload_rate_limit),
    pdf_processor: PDFProcessor = Depends(get_pdf_processor),
    vector_service: VectorStoreService = Depends(get_vector_service),
):
    """
    Upload and process a PDF file.

    The PDF is:
    1. Validated for correct format
    2. Split into chunks
    3. Embedded and stored in vector database (scoped to X-Chat-Session-Id)
    """
    fname = file.filename or ""
    # Validate file type
    if not fname.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    # Check file size
    settings = get_settings()
    contents = await file.read()

    if len(contents) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size // (1024 * 1024)}MB limit",
        )

    try:
        # Process the PDF
        result = pdf_processor.process_uploaded_file(contents, fname)

        # Create vector store from chunks
        vector_service.create_from_documents(result.chunks)

        return UploadResponse(
            message=f"Successfully processed '{fname}'",
            chunks_created=result.total_chunks,
            file_name=fname or None,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}",
        ) from e


@router.get("/status", response_model=StatusResponse)
async def get_status(
    vector_service: VectorStoreService = Depends(get_vector_service),
):
    """
    Get current system status for this browser session.

    Checks if a PDF is loaded and ready for queries.
    """
    settings = get_settings()
    is_ready = vector_service.is_ready

    return StatusResponse(
        status="ready" if is_ready else "waiting",
        message="PDF loaded and ready for questions"
        if is_ready
        else "No PDF loaded. Please upload a PDF first.",
        pdf_loaded=is_ready,
        model=settings.default_model,
    )
