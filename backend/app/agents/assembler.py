"""
Assembler Agent

Final agent in the pipeline.  Takes the validated answer string and
packages it into a structured output dict ready for the API response.

Responsibilities:
- Attaches source-page citations when ``include_sources`` is set.
- Adds timing and model metadata.
- Optionally formats markdown or plain-text output.
"""

import re
from typing import Any

from langchain_core.documents import Document

from .base_agent import BaseAgent


class AssemblerAgent(BaseAgent):
    """
    Agent responsible for assembling the final API-ready output.

    Pipeline position: runs *after* ValidatorAgent (the last step).
    """

    def __init__(self):
        super().__init__(
            name="assembler",
            description="Packages the validated answer into a structured response"
        )

    # ------------------------------------------------------------------
    # Pipeline interface
    # ------------------------------------------------------------------

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        # Keep only useful word tokens for lightweight lexical overlap scoring.
        return {
            t
            for t in re.findall(r"[a-zA-Z0-9]{4,}", text.lower())
            if t not in {"this", "that", "with", "from", "were", "have", "your"}
        }

    def _select_relevant_sources(
        self,
        answer: str,
        optimized_chunks: list[Document],
        fallback_sources: list[Any],
        max_pages: int = 3,
    ) -> list[str]:
        answer_tokens = self._tokenize(answer)
        if not answer_tokens:
            # Fallback to previously collected pages if answer has no usable tokens.
            return list(dict.fromkeys(str(p) for p in fallback_sources))[:max_pages]

        page_scores: dict[str, float] = {}
        for doc in optimized_chunks:
            page = str(doc.metadata.get("page", "N/A"))
            chunk_tokens = self._tokenize(doc.page_content)
            if not chunk_tokens:
                continue
            overlap = len(answer_tokens.intersection(chunk_tokens))
            score = overlap / max(1, len(answer_tokens))
            page_scores[page] = max(page_scores.get(page, 0.0), score)

        ranked_pages = [
            p for p, score in sorted(page_scores.items(), key=lambda x: x[1], reverse=True) if score > 0
        ]
        if ranked_pages:
            return ranked_pages[:max_pages]

        return list(dict.fromkeys(str(p) for p in fallback_sources))[:max_pages]

    def process(self, input_data: str, context: dict[str, Any]) -> dict[str, Any]:
        """
        Build structured output from the validated answer and pipeline context.

        Args:
            input_data: Validated answer string.
            context:    Shared pipeline context dict (contains all agent metadata).

        Returns:
            Dict with ``answer``, ``model_used``, ``sources``, ``pipeline_info``.
        """
        answer = input_data

        # Collect source page references if caller asked for them
        sources: list | None = None
        if context.get("include_sources"):
            optimized_chunks = context.get("optimized_chunks", [])
            if isinstance(optimized_chunks, list):
                sources = self._select_relevant_sources(
                    answer=answer,
                    optimized_chunks=optimized_chunks,
                    fallback_sources=context.get("chunk_sources", []),
                )
            else:
                sources = list(dict.fromkeys(str(p) for p in context.get("chunk_sources", [])))

        # Build pipeline telemetry summary
        pipeline_info = {
            "retrieved_chunks": context.get("retrieved_chunks", 0),
            "filtered_chunks": context.get("filtered_chunks", 0),
            "optimizer_output_chunks": context.get("optimizer_output_chunks", 0),
            "validation_passed": context.get("validation_passed", True),
            "is_uncertain": context.get("is_uncertain_answer", False),
        }

        result: dict[str, Any] = {
            "answer": answer,
            "model_used": context.get("model_used"),
            "sources": sources,
            "pipeline_info": pipeline_info,
        }

        context["assembler_done"] = True
        return result
