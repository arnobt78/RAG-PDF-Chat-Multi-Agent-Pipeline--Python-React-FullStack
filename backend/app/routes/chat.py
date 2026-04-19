"""
Chat Routes

Endpoints for asking questions and getting AI-generated answers.
Includes both a standard JSON endpoint and an SSE streaming endpoint.

Learning notes:
    - Both routes depend on ``get_vector_service`` (from upload routes), so every
      ask is scoped to the same ``X-Chat-Session-Id`` as the user's upload.
    - ``check_ask_rate_limit`` runs first (Depends order) to cap abuse per IP.
    - ``/ask`` waits for the full pipeline then returns JSON; ``/ask/stream``
      runs the same pipeline but then *simulates* token streaming by slicing
      the final answer (see ``_stream_pipeline``) — the LLM call itself is not
      token-streamed from the provider in this implementation.
"""

import json
import logging
import time
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from ..agents.pipeline import AgentPipeline
from ..models import AnswerResponse, QuestionRequest
from ..services.ip_rate_limit import check_ask_rate_limit
from ..services.llm_service import LLMService
from ..services.usage_counters import increment_chat_completions
from ..services.vector_store import VectorStoreService
from .upload import get_vector_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])

# Global LLM service
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    """Dependency to get LLM service."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def set_llm_service(llm_service: LLMService):
    """Set global LLM service from main app."""
    global _llm_service
    _llm_service = llm_service


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(
    request: QuestionRequest,
    _: None = Depends(check_ask_rate_limit),  # underscore = "fire-and-forget" dependency side effect only
    vector_service: VectorStoreService = Depends(get_vector_service),
    llm_service: LLMService = Depends(get_llm_service),
):
    """
    Ask a question about the uploaded PDF.

    Uses the full 7-agent RAG pipeline:
    1. Extractor      – Retrieves relevant chunks
    2. Analyzer        – Filters low-quality / duplicates
    3. Preprocessor    – Cleans & normalizes text
    4. Optimizer       – Reorders / trims to token budget
    5. Synthesizer     – Generates answer via LLM
    6. Validator       – Quality-checks the answer
    7. Assembler       – Packages structured output
    """
    if not vector_service.is_ready:
        raise HTTPException(
            status_code=400,
            detail="No PDF has been loaded. Please upload a PDF first.",
        )

    try:
        pipeline = AgentPipeline(vector_service, llm_service)
        result = pipeline.run(
            question=request.question,
            model=request.model,
            include_sources=request.include_sources,
        )

        if not result.success:
            raise HTTPException(
                status_code=500,
                detail=result.error or "Failed to generate answer",
            )

        increment_chat_completions()

        return AnswerResponse(
            answer=result.answer or "",
            model_used=result.model_used,
            processing_time=result.processing_time,
            sources=result.sources,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing question")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}",
        ) from e


# ---------------------------------------------------------------------------
# SSE Streaming endpoint
# ---------------------------------------------------------------------------

async def _stream_pipeline(
    question: str,
    model: str | None,
    include_sources: bool,
    vector_service: VectorStoreService,
    llm_service: LLMService,
) -> AsyncGenerator[str, None]:
    """Yield SSE events as the pipeline progresses."""
    start = time.time()

    def sse(event: str, data: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"

    yield sse("status", {"stage": "starting", "message": "Pipeline started"})

    try:
        pipeline = AgentPipeline(vector_service, llm_service)
        result = pipeline.run(
            question=question,
            model=model,
            include_sources=include_sources,
        )

        if not result.success:
            yield sse("error", {"message": result.error or "Pipeline failed"})
            return

        increment_chat_completions()

        # Stream the answer token-by-token for a typing effect
        answer = result.answer or ""
        chunk_size = 4
        for i in range(0, len(answer), chunk_size):
            yield sse("token", {"content": answer[i : i + chunk_size]})

        # Final metadata event
        yield sse(
            "done",
            {
                "model_used": result.model_used,
                "processing_time": round(time.time() - start, 3),
                "sources": result.sources,
            },
        )

    except Exception as exc:
        logger.exception("Streaming pipeline error")
        yield sse("error", {"message": str(exc)})


@router.post("/ask/stream")
async def ask_question_stream(
    request: QuestionRequest,
    _: None = Depends(check_ask_rate_limit),
    vector_service: VectorStoreService = Depends(get_vector_service),
    llm_service: LLMService = Depends(get_llm_service),
):
    """
    SSE streaming variant of /ask.

    Events emitted:
    - status  – pipeline progress info
    - token   – incremental answer text
    - done    – final metadata (model_used, processing_time, sources)
    - error   – if something goes wrong
    """
    if not vector_service.is_ready:
        raise HTTPException(
            status_code=400,
            detail="No PDF has been loaded. Please upload a PDF first.",
        )

    return StreamingResponse(
        _stream_pipeline(
            question=request.question,
            model=request.model,
            include_sources=request.include_sources,
            vector_service=vector_service,
            llm_service=llm_service,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
