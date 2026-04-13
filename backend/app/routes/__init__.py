"""
API Routes

FastAPI route definitions organized by functionality.
"""

from .chat import router as chat_router
from .health import router as health_router
from .tunnel import router as tunnel_router
from .upload import router as upload_router

__all__ = [
    "health_router",
    "upload_router",
    "chat_router",
    "tunnel_router",
]
