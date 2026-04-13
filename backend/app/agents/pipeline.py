"""
Agent Pipeline

Orchestrates the full 7-agent RAG pipeline in sequence:

  Extractor → Analyzer → Preprocessor → Optimizer
       → Synthesizer → Validator → Assembler

Each agent receives the previous agent's output plus a shared context dict.
"""

from dataclasses import dataclass, field
from typing import Any

from ..services.llm_service import LLMService
from ..services.vector_store import VectorStoreService
from .analyzer import AnalyzerAgent
from .assembler import AssemblerAgent
from .base_agent import AgentResult, BaseAgent
from .extractor import ExtractorAgent
from .optimizer import OptimizerAgent
from .preprocessor import PreprocessorAgent
from .synthesizer import SynthesizerAgent
from .validator import ValidatorAgent


@dataclass
class PipelineResult:
    """
    Result from running the full pipeline.

    Attributes:
        success: Whether pipeline completed successfully
        answer: Final generated answer
        model_used: Model that generated the answer
        processing_time: Total processing time in seconds
        agent_results: Results from each agent step
        context: Final pipeline context with all metadata
        sources: Page-level source references (when requested)
    """
    success: bool
    answer: str | None = None
    model_used: str | None = None
    processing_time: float = 0.0
    agent_results: list[AgentResult] = field(default_factory=list)
    context: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    sources: list[str] | None = None


class AgentPipeline:
    """
    Orchestrates the multi-agent RAG pipeline.

    Full pipeline flow (7 agents):
        1. Extractor      – retrieve relevant chunks from vector store
        2. Analyzer        – filter low-quality / duplicate chunks
        3. Preprocessor    – clean & normalize text
        4. Optimizer       – reorder & trim to token budget
        5. Synthesizer     – generate answer via LLM
        6. Validator       – quality-check the answer
        7. Assembler       – package structured API response

    Usage:
        pipeline = AgentPipeline(vector_service, llm_service)
        result = pipeline.run("What does clause 4.2 say?")
    """

    def __init__(
        self,
        vector_service: VectorStoreService,
        llm_service: LLMService,
        retrieval_k: int = 4,
    ):
        self.vector_service = vector_service
        self.llm_service = llm_service
        self.retrieval_k = retrieval_k

        # Instantiate every agent in execution order
        self.extractor = ExtractorAgent(vector_service, k=retrieval_k)
        self.analyzer = AnalyzerAgent()
        self.preprocessor = PreprocessorAgent()
        self.optimizer = OptimizerAgent()
        self.synthesizer = SynthesizerAgent(llm_service)
        self.validator = ValidatorAgent()
        self.assembler = AssemblerAgent()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _fail(
        error: str,
        results: list[AgentResult],
        total_ms: float,
        context: dict[str, Any],
    ) -> PipelineResult:
        """Convenience builder for an error result."""
        return PipelineResult(
            success=False,
            error=error,
            agent_results=results,
            processing_time=total_ms / 1000,
            context=context,
        )

    def _step(
        self,
        agent: BaseAgent,
        data: Any,
        context: dict[str, Any],
        results: list[AgentResult],
    ):
        """Run one agent step, accumulate results, return (ok, output, total_ms_delta)."""
        result = agent.execute(data, context)
        results.append(result)
        return result.success, result.data, result.duration_ms, result.error

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(
        self,
        question: str,
        model: str | None = None,
        include_sources: bool = False,
    ) -> PipelineResult:
        """
        Execute the full 7-step pipeline for a user question.

        Args:
            question:        The user's natural-language question.
            model:           Optional model id override.
            include_sources: Attach page-level source citations.

        Returns:
            PipelineResult with answer, metadata, and telemetry.
        """
        context: dict[str, Any] = {
            "question": question,
            "model": model,
            "include_sources": include_sources,
            "retrieval_k": self.retrieval_k,
        }
        results: list[AgentResult] = []
        total_ms = 0.0

        try:
            # 1 ── Extractor (question → chunks)
            ok, chunks, ms, err = self._step(self.extractor, question, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Extractor failed", results, total_ms, context)

            # 2 ── Analyzer (chunks → filtered_chunks)
            ok, filtered, ms, err = self._step(self.analyzer, chunks, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Analyzer failed", results, total_ms, context)

            # 3 ── Preprocessor (filtered_chunks → cleaned_chunks)
            ok, cleaned, ms, err = self._step(self.preprocessor, filtered, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Preprocessor failed", results, total_ms, context)

            # 4 ── Optimizer ((question, cleaned_chunks) → (question, optimised_chunks))
            ok, optimised_pair, ms, err = self._step(
                self.optimizer, (question, cleaned), context, results
            )
            total_ms += ms
            if not ok:
                return self._fail(err or "Optimizer failed", results, total_ms, context)

            # 5 ── Synthesizer ((question, optimised_chunks) → answer_text)
            ok, answer, ms, err = self._step(self.synthesizer, optimised_pair, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Synthesizer failed", results, total_ms, context)

            # 6 ── Validator (answer_text → validated_answer_text)
            ok, validated, ms, err = self._step(self.validator, answer, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Validator failed", results, total_ms, context)

            # 7 ── Assembler (validated_answer → structured dict)
            ok, assembled, ms, err = self._step(self.assembler, validated, context, results)
            total_ms += ms
            if not ok:
                return self._fail(err or "Assembler failed", results, total_ms, context)

            # Build final result from the assembled dict
            return PipelineResult(
                success=True,
                answer=assembled.get("answer"),
                model_used=assembled.get("model_used") or context.get("model_used"),
                processing_time=total_ms / 1000,
                agent_results=results,
                context=context,
                sources=assembled.get("sources"),
            )

        except Exception as e:
            return PipelineResult(
                success=False,
                error=str(e),
                agent_results=results,
                processing_time=total_ms / 1000,
                context=context,
            )
