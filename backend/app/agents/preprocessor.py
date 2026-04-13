"""
Preprocessor Agent

Cleans and formats retrieved document chunks before they are sent
to the Optimizer/Synthesizer.  Strips whitespace noise, normalizes
unicode, collapses redundant newlines, and trims excessively long
chunks so downstream agents receive consistent, well-formed text.
"""

import re
import unicodedata
from typing import Any, Dict, List

from langchain_core.documents import Document
from .base_agent import BaseAgent


class PreprocessorAgent(BaseAgent):
    """
    Agent responsible for cleaning and normalizing text before synthesis.

    Pipeline position: runs *after* AnalyzerAgent and *before* OptimizerAgent.
    """

    def __init__(self, max_chunk_chars: int = 1500):
        """
        Args:
            max_chunk_chars: Hard cap per chunk – anything longer is truncated
                             so the LLM context window is used efficiently.
        """
        super().__init__(
            name="preprocessor",
            description="Cleans, normalizes, and trims document chunks"
        )
        self.max_chunk_chars = max_chunk_chars

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _normalize_whitespace(text: str) -> str:
        """Collapse runs of whitespace / blank lines into single newlines."""
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    @staticmethod
    def _normalize_unicode(text: str) -> str:
        """NFC-normalize and replace common special-quote chars."""
        text = unicodedata.normalize("NFC", text)
        replacements = {
            "\u2018": "'", "\u2019": "'",
            "\u201c": '"', "\u201d": '"',
            "\u2013": "-", "\u2014": "-",
            "\u2026": "...",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

    def _truncate(self, text: str) -> str:
        if len(text) <= self.max_chunk_chars:
            return text
        return text[: self.max_chunk_chars].rsplit(" ", 1)[0] + " ..."

    # ------------------------------------------------------------------
    # Pipeline interface
    # ------------------------------------------------------------------

    def process(
        self, input_data: List[Document], context: Dict[str, Any]
    ) -> List[Document]:
        """
        Clean every chunk and return the processed list.

        Args:
            input_data: Filtered document chunks from the AnalyzerAgent.
            context:    Shared pipeline context dict.

        Returns:
            List of cleaned Document objects.
        """
        cleaned: List[Document] = []
        chars_before = 0
        chars_after = 0

        for doc in input_data:
            raw = doc.page_content
            chars_before += len(raw)

            text = self._normalize_unicode(raw)
            text = self._normalize_whitespace(text)
            text = self._truncate(text)
            chars_after += len(text)

            cleaned.append(
                Document(page_content=text, metadata={**doc.metadata})
            )

        context["preprocessor_chars_before"] = chars_before
        context["preprocessor_chars_after"] = chars_after
        return cleaned
