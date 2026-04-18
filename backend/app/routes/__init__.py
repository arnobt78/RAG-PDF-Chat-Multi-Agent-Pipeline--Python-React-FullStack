"""
API Routes

FastAPI route definitions organized by functionality.

Each submodule exposes an ``APIRouter`` instance; ``app.main`` includes them without
a URL prefix, so paths are exactly ``/upload``, ``/ask``, etc.
"""

from .chat import router as chat_router
from .health import router as health_router
from .runtime_summary import router as runtime_summary_router
from .tunnel import router as tunnel_router
from .upload import router as upload_router

__all__ = [
    "health_router",
    "runtime_summary_router",
    "upload_router",
    "chat_router",
    "tunnel_router",
]
