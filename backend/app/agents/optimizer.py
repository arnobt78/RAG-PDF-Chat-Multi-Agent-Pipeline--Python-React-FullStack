"""
Optimizer Agent

Takes the preprocessed chunks and the original question and builds
an *optimized prompt payload* for the Synthesizer.  Responsibilities:

- Reorders chunks by estimated relevance (most relevant first).
- Injects a system instruction prefix that improves answer quality.
- Truncates the combined context to fit within a safe token budget.
"""

from typing import Any

from langchain_core.documents import Document

from .base_agent import BaseAgent

# Rough chars-per-token ratio for English text (conservative).
_CHARS_PER_TOKEN = 4
# Default token budget for context (leaves room for question + answer).
_DEFAULT_CONTEXT_TOKEN_BUDGET = 6000


class OptimizerAgent(BaseAgent):
    """
    Agent responsible for building the best possible prompt payload.

    Pipeline position: runs *after* PreprocessorAgent and *before*
    SynthesizerAgent.

    Output: ``Tuple[str, List[Document]]`` – (question, optimised_chunks).
    """

    def __init__(self, context_token_budget: int = _DEFAULT_CONTEXT_TOKEN_BUDGET):
        super().__init__(
            name="optimizer",
            description="Reorders and trims context for optimal LLM prompting"
        )
        self.context_char_budget = context_token_budget * _CHARS_PER_TOKEN

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _relevance_score(doc: Document) -> float:
        """Higher is better.  Prefer chunks earlier in the document and
        chunks that are longer (more likely to contain full paragraphs)."""
        page = doc.metadata.get("page", 999)
        length_bonus = min(len(doc.page_content) / 1000.0, 1.0)
        return length_bonus - (page * 0.001)

    def _fit_budget(self, docs: list[Document]) -> list[Document]:
        """Drop trailing chunks once the char budget is exceeded."""
        budget_left = self.context_char_budget
        kept: list[Document] = []
        for doc in docs:
            cost = len(doc.page_content)
            if cost > budget_left:
                break
            kept.append(doc)
            budget_left -= cost
        return kept

    # ------------------------------------------------------------------
    # Pipeline interface
    # ------------------------------------------------------------------

    def process(
        self,
        input_data: tuple[str, list[Document]],
        context: dict[str, Any],
    ) -> tuple[str, list[Document]]:
        """
        Optimise chunks for the Synthesizer.

        Args:
            input_data: ``(question, preprocessed_chunks)``
            context:    Shared pipeline context dict.

        Returns:
            ``(question, optimised_chunks)``
        """
        question, chunks = input_data

        # Sort by estimated relevance (best first)
        ranked = sorted(chunks, key=self._relevance_score, reverse=True)

        # Trim to token budget
        fitted = self._fit_budget(ranked)

        context["optimizer_input_chunks"] = len(chunks)
        context["optimizer_output_chunks"] = len(fitted)
        context["optimizer_char_budget"] = self.context_char_budget

        return (question, fitted)
