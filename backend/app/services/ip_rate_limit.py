"""
Per-client-IP sliding-window rate limits for expensive routes.

Mitigates abuse such as spamming new X-Chat-Session-Id values to fill the LRU
or hammering PDF indexing. Each limit is per client IP (not one global cap for
the server). Limits are in-memory (per API process); combine with a reverse
proxy for defense in depth when running multiple workers.
"""

from __future__ import annotations

import threading
import time
from collections import deque

from fastapi import HTTPException, Request

from ..config import get_settings

_lock = threading.Lock()
# key -> deque of monotonic timestamps (last window only)
_upload_hits: dict[str, deque[float]] = {}
_ask_hits: dict[str, deque[float]] = {}


def client_ip(request: Request) -> str:
    """Best-effort client IP; prefer proxy headers when present."""
    x_real = request.headers.get("x-real-ip")
    if x_real:
        part = x_real.strip().split(",")[0].strip()
        if part:
            return part
    xff = request.headers.get("x-forwarded-for")
    if xff:
        part = xff.split(",")[0].strip()
        if part:
            return part
    if request.client:
        return request.client.host
    return "unknown"


def _prune_and_allow(
    store: dict[str, deque[float]],
    key: str,
    max_events: int,
    window_seconds: float,
) -> bool:
    now = time.monotonic()
    cutoff = now - window_seconds
    with _lock:
        q = store.get(key)
        if q is None:
            q = deque()
            store[key] = q
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= max_events:
            return False
        q.append(now)
        return True


def check_upload_rate_limit(request: Request) -> None:
    settings = get_settings()
    n = int(settings.rate_limit_upload_per_minute)
    if n <= 0:
        return
    ip = client_ip(request)
    if not _prune_and_allow(_upload_hits, ip, n, 60.0):
        raise HTTPException(
            status_code=429,
            detail="Too many uploads from this address. Try again in a minute.",
            headers={"Retry-After": "60"},
        )


def check_ask_rate_limit(request: Request) -> None:
    settings = get_settings()
    n = int(settings.rate_limit_ask_per_minute)
    if n <= 0:
        return
    ip = client_ip(request)
    if not _prune_and_allow(_ask_hits, ip, n, 60.0):
        raise HTTPException(
            status_code=429,
            detail="Too many questions from this address. Try again in a minute.",
            headers={"Retry-After": "60"},
        )
