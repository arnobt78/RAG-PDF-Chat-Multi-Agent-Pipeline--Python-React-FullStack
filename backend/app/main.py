"""
FastAPI Application Entry Point

Main application module that:
- Creates the FastAPI app instance
- Configures middleware (CORS, etc.)
- Registers route handlers
- Initializes services

Run with: uvicorn app.main:app --reload
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import health_router, upload_router, chat_router
from .routes.upload import set_services as set_upload_services
from .routes.chat import set_llm_service
from .services.pdf_processor import PDFProcessor
from .services.vector_store import VectorStoreService
from .services.llm_service import LLMService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize services, load default PDF if exists
    - Shutdown: Cleanup resources
    """
    # Startup
    print("🚀 Starting RAG PDF Chat API...")
    
    # Initialize services
    pdf_processor = PDFProcessor()
    vector_service = VectorStoreService()
    llm_service = LLMService()
    
    # Inject services into routes
    set_upload_services(pdf_processor, vector_service)
    set_llm_service(llm_service)
    
    # Try to load default PDF if exists
    default_pdf = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "documents",
        "document.pdf"
    )
    if os.path.exists(default_pdf):
        try:
            result = pdf_processor.process_file(default_pdf)
            vector_service.create_from_documents(result.chunks)
            print(f"📄 Loaded default PDF: {result.file_name} ({result.total_chunks} chunks)")
        except Exception as e:
            print(f"⚠️ Could not load default PDF: {e}")
    
    print("✅ API ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI instance
    """
    settings = get_settings()
    
    # Create app with metadata
    app = FastAPI(
        title="RAG PDF Chat API",
        description="""
        Chat with your PDF documents using Retrieval Augmented Generation.
        
        ## Features
        
        - **PDF Upload**: Upload and process PDF documents
        - **Smart Retrieval**: Find relevant content using vector similarity
        - **AI Answers**: Get accurate answers powered by LLMs
        - **Multi-Model**: Support for multiple AI providers
        
        ## Quick Start
        
        1. Upload a PDF using `/upload`
        2. Ask questions using `/ask`
        """,
        version="1.0.0",
        lifespan=lifespan,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register routers
    app.include_router(health_router)
    app.include_router(upload_router)
    app.include_router(chat_router)
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
