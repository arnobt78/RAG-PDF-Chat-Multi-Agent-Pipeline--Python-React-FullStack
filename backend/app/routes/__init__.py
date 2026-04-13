"""
API Routes

FastAPI route definitions organized by functionality.
"""

from .health import router as health_router
from .upload import router as upload_router
from .chat import router as chat_router

__all__ = [
    "health_router",
    "upload_router",
    "chat_router",
]
