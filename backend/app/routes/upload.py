"""
Upload Routes

Endpoints for PDF upload and processing.
"""

from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from ..models import UploadResponse, StatusResponse
from ..services.pdf_processor import PDFProcessor
from ..services.vector_store import VectorStoreService
from ..config import get_settings

router = APIRouter(tags=["Upload"])

# Global services (initialized in main.py and injected)
_pdf_processor: Optional[PDFProcessor] = None
_vector_service: Optional[VectorStoreService] = None


def get_pdf_processor() -> PDFProcessor:
    """Dependency to get PDF processor."""
    global _pdf_processor
    if _pdf_processor is None:
        _pdf_processor = PDFProcessor()
    return _pdf_processor


def get_vector_service() -> VectorStoreService:
    """Dependency to get vector service."""
    global _vector_service
    if _vector_service is None:
        _vector_service = VectorStoreService()
    return _vector_service


def set_services(pdf_processor: PDFProcessor, vector_service: VectorStoreService):
    """Set global services from main app."""
    global _pdf_processor, _vector_service
    _pdf_processor = pdf_processor
    _vector_service = vector_service


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    pdf_processor: PDFProcessor = Depends(get_pdf_processor),
    vector_service: VectorStoreService = Depends(get_vector_service)
):
    """
    Upload and process a PDF file.
    
    The PDF is:
    1. Validated for correct format
    2. Split into chunks
    3. Embedded and stored in vector database
    
    Args:
        file: PDF file to upload
        
    Returns:
        UploadResponse with processing results
        
    Raises:
        HTTPException: If file is invalid or processing fails
    """
    fname = file.filename or ""
    # Validate file type
    if not fname.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    # Check file size
    settings = get_settings()
    contents = await file.read()
    
    if len(contents) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size // (1024*1024)}MB limit"
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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}"
        )


@router.get("/status", response_model=StatusResponse)
async def get_status(
    vector_service: VectorStoreService = Depends(get_vector_service)
):
    """
    Get current system status.
    
    Checks if a PDF is loaded and ready for queries.
    """
    settings = get_settings()
    is_ready = vector_service.is_ready
    
    return StatusResponse(
        status="ready" if is_ready else "waiting",
        message="PDF loaded and ready for questions" if is_ready else "No PDF loaded. Please upload a PDF first.",
        pdf_loaded=is_ready,
        model=settings.default_model
    )
