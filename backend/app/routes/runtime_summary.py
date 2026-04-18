"""
Public runtime summary for dashboards (no auth, no session header).

Path is ``/runtime-summary`` (not under ``/api``) so Vite dev proxy ``/api`` →
backend rewrite does not strip a needed prefix.
"""

from __future__ import annotations

from fastapi import APIRouter

from ..config import (
    AI_PROVIDERS,
    get_embedding_fallback_chain,
    get_settings,
    provider_has_credentials,
)
from ..models.schemas import RuntimeProviderRow, RuntimeSummaryResponse

router = APIRouter(tags=["API"])

_PROVIDER_LABELS: dict[str, str] = {
    "openrouter": "OpenRouter",
    "groq": "Groq",
    "openai": "OpenAI",
    "gemini": "Google Gemini",
    "huggingface": "Hugging Face",
}


@router.get("/runtime-summary", response_model=RuntimeSummaryResponse)
def runtime_summary() -> RuntimeSummaryResponse:
    settings = get_settings()
    chain = get_embedding_fallback_chain()
    emb_names = {p.name for p, _ in chain}
    rows: list[RuntimeProviderRow] = []
    for name, prov in AI_PROVIDERS.items():
        llm = provider_has_credentials(prov)
        emb = name in emb_names
        if llm and emb:
            st = "working"
        elif llm or emb:
            st = "partial"
        else:
            st = "unavailable"
        rows.append(
            RuntimeProviderRow(
                id=name,
                display_name=_PROVIDER_LABELS.get(name, name.replace("_", " ").title()),
                llm_ready=llm,
                embedding_ready=emb,
                status=st,
            )
        )
    usable = sum(1 for r in rows if r.status in ("working", "partial"))
    overall = "ok" if usable else "degraded"
    if not any(r.llm_ready for r in rows):
        overall = "error"
    llm_ready_n = sum(1 for r in rows if r.llm_ready)
    return RuntimeSummaryResponse(
        status=overall,
        providers=len(rows),
        working=usable,
        app_version=settings.app_version,
        default_model=settings.default_model,
        providers_detail=rows,
        embedding_chain_steps=len(chain),
        llm_providers_ready=llm_ready_n,
        rate_limit_upload_per_minute=settings.rate_limit_upload_per_minute,
        rate_limit_ask_per_minute=settings.rate_limit_ask_per_minute,
        max_vector_sessions=settings.max_vector_sessions,
        faiss_session_max_age_days=settings.faiss_session_max_age_days,
    )
