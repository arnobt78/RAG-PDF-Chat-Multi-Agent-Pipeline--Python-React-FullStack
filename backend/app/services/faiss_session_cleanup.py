"""
Optional on-disk cleanup for ``faiss_index/sessions/<uuid>/``.

When ``faiss_session_max_age_days`` > 0 (default 3 in Settings), each API startup removes:
- Session folders whose mtime is older than that many days (redeploy orphans).
- Subdirectories whose names are not valid UUID v4 (junk).

Why mtime: cheap heuristic for "not touched recently"; active users keep files fresh.
"""

from __future__ import annotations

import logging
import os
import shutil
import time

from ..config import get_settings
from .session_vector_registry import is_valid_session_id
from .vector_store import VectorStoreService

logger = logging.getLogger(__name__)


def prune_stale_session_indexes() -> tuple[int, int]:
    """
    Returns ``(removed_stale_age, removed_junk_names)``.
    No-op when ``faiss_session_max_age_days`` is 0.
    """
    settings = get_settings()
    max_age_days = int(settings.faiss_session_max_age_days)
    if max_age_days <= 0:
        return (0, 0)

    root = VectorStoreService.sessions_directory()
    if not os.path.isdir(root):
        return (0, 0)

    cutoff = time.time() - max_age_days * 86400
    removed_stale = 0
    removed_junk = 0

    for name in os.listdir(root):
        path = os.path.join(root, name)
        if not os.path.isdir(path):
            continue

        if not is_valid_session_id(name):
            try:
                shutil.rmtree(path, ignore_errors=True)
                removed_junk += 1
                logger.info("Removed non-UUID session dir: %s", name)
            except OSError as exc:
                logger.warning("Could not remove junk dir %s: %s", path, exc)
            continue

        try:
            mtime = os.path.getmtime(path)
        except OSError:
            continue

        if mtime < cutoff:
            try:
                shutil.rmtree(path, ignore_errors=True)
                removed_stale += 1
                logger.info("Removed stale session index (mtime): %s", name)
            except OSError as exc:
                logger.warning("Could not remove stale dir %s: %s", path, exc)

    if removed_stale or removed_junk:
        logger.info(
            "FAISS session cleanup: %d stale (>%dd), %d junk dirs",
            removed_stale,
            max_age_days,
            removed_junk,
        )
    return (removed_stale, removed_junk)
