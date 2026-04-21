import asyncio
import json
import unittest
from collections.abc import AsyncGenerator
from typing import Any, cast
from unittest.mock import patch

from app.routes.chat import _stream_pipeline
from app.services.llm_service import LLMService
from app.services.vector_store import VectorStoreService


class _FakePipeline:
    def __init__(self, vector_service: Any, llm_service: Any):
        self.retrieval_k = 4
        self.extractor = object()
        self.analyzer = object()
        self.preprocessor = object()
        self.optimizer = object()
        self.validator = object()
        self.assembler = object()
        self._optimized_chunks = [{"page_content": "stub", "metadata": {"page": 1}}]

    def _step(self, agent: Any, data: Any, context: dict[str, Any], results: list[Any]):
        if agent is self.extractor:
            return True, ["chunk-a"], 1.0, None
        if agent is self.analyzer:
            return True, ["chunk-a"], 1.0, None
        if agent is self.preprocessor:
            return True, ["chunk-a"], 1.0, None
        if agent is self.optimizer:
            return True, (context["question"], self._optimized_chunks), 1.0, None
        if agent is self.validator:
            return True, data, 1.0, None
        if agent is self.assembler:
            return (
                True,
                {"answer": data, "model_used": "openai/gpt-4o-mini", "sources": ["2"]},
                1.0,
                None,
            )
        return False, None, 0.0, "unknown agent"


class _FakeLLMService:
    async def stream_answer_with_failover(
        self, question: str, context_docs: list[Any], model: str | None = None
    ) -> AsyncGenerator[dict[str, str], None]:
        yield {"type": "token", "content": "Hello", "model_used": "openai/gpt-4o-mini"}
        yield {"type": "token", "content": " world", "model_used": "openai/gpt-4o-mini"}
        yield {"type": "complete", "model_used": "openai/gpt-4o-mini"}


def _parse_sse_line(block: str) -> tuple[str, dict]:
    event = ""
    payload: dict = {}
    for line in block.strip().splitlines():
        if line.startswith("event: "):
            event = line[7:].strip()
        elif line.startswith("data: "):
            payload = json.loads(line[6:])
    return event, payload


class TestChatStreamSSE(unittest.TestCase):
    def test_stream_pipeline_emits_token_and_done_with_sources(self):
        async def _run():
            vector_service = cast(VectorStoreService, object())
            llm_service = cast(LLMService, _FakeLLMService())
            events: list[tuple[str, dict[str, Any]]] = []
            with patch("app.routes.chat.AgentPipeline", _FakePipeline):
                async for raw in _stream_pipeline(
                    question="test?",
                    model=None,
                    include_sources=True,
                    vector_service=vector_service,
                    llm_service=llm_service,
                ):
                    events.append(_parse_sse_line(raw))
            return events

        events = asyncio.run(_run())
        token_payloads = [payload for event, payload in events if event == "token"]
        done_payloads = [payload for event, payload in events if event == "done"]

        self.assertGreaterEqual(len(token_payloads), 2)
        self.assertEqual(token_payloads[0].get("content"), "Hello")
        self.assertEqual(token_payloads[1].get("content"), " world")
        self.assertEqual(len(done_payloads), 1)
        self.assertEqual(done_payloads[0].get("sources"), ["2"])
        self.assertEqual(done_payloads[0].get("model_used"), "openai/gpt-4o-mini")


if __name__ == "__main__":
    unittest.main()
