"""
FastAPI Application Entry Point

Main application module that:
- Creates the FastAPI app instance
- Configures middleware (CORS, etc.)
- Registers route handlers
- Initializes services

Run with: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import chat_router, health_router, tunnel_router, upload_router
from .routes.chat import set_llm_service
from .routes.upload import set_services as set_upload_services
from .services.faiss_session_cleanup import prune_stale_session_indexes
from .services.llm_service import LLMService
from .services.pdf_processor import PDFProcessor
from .services.session_vector_registry import SessionVectorRegistry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events:
    - Startup: Initialize services and per-session vector registry
    - Shutdown: Cleanup resources
    """
    # Startup
    print("🚀 Starting RAG PDF Chat API...")

    settings = get_settings()
    pdf_processor = PDFProcessor()
    stale, junk = prune_stale_session_indexes()
    if settings.faiss_session_max_age_days > 0:
        print(
            f"   FAISS session disk cleanup (>{settings.faiss_session_max_age_days}d mtime): "
            f"{stale} stale, {junk} junk dirs removed"
        )
    else:
        print("   FAISS session disk cleanup: disabled (FAISS_SESSION_MAX_AGE_DAYS=0)")
    vector_registry = SessionVectorRegistry(settings.max_vector_sessions)
    llm_service = LLMService()

    set_upload_services(pdf_processor, vector_registry)
    set_llm_service(llm_service)

    print(
        f"   Vector sessions: max {settings.max_vector_sessions} "
        f"(LRU evict + delete oldest on-disk index under {settings.faiss_persist_dir}/sessions/)"
    )
    if settings.rate_limit_upload_per_minute > 0 or settings.rate_limit_ask_per_minute > 0:
        print(
            "   Rate limits (per IP / 60s): "
            f"upload={settings.rate_limit_upload_per_minute or 'off'}, "
            f"ask={settings.rate_limit_ask_per_minute or 'off'}"
        )
    else:
        print("   Rate limits: disabled (per-IP upload/ask limits set to 0)")
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
    app.include_router(tunnel_router)
    
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
