"""Persist aggregate PDF upload and successful chat counts (JSON next to FAISS dir)."""

from __future__ import annotations

import json
import os
import threading
from pathlib import Path

_lock = threading.Lock()


def _counter_path() -> Path:
    from ..config import get_settings

    root = Path(get_settings().faiss_persist_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root / "usage_counters.json"


def _read_pair(path: Path) -> tuple[int, int]:
    if not path.is_file():
        return (0, 0)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return (
            max(0, int(data.get("pdf_uploads", 0))),
            max(0, int(data.get("chat_completions", 0))),
        )
    except (OSError, ValueError, TypeError):
        return (0, 0)


def _write_pair(path: Path, pdf_uploads: int, chat_completions: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(
        {"pdf_uploads": pdf_uploads, "chat_completions": chat_completions},
        separators=(",", ":"),
    )
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(body, encoding="utf-8")
    os.replace(tmp, path)


def read_counters() -> tuple[int, int]:
    path = _counter_path()
    with _lock:
        return _read_pair(path)


def increment_pdf_uploads() -> None:
    path = _counter_path()
    with _lock:
        pdf, chats = _read_pair(path)
        _write_pair(path, pdf + 1, chats)


def increment_chat_completions() -> None:
    path = _counter_path()
    with _lock:
        pdf, chats = _read_pair(path)
        _write_pair(path, pdf, chats + 1)
