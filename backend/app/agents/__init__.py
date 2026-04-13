"""
Agent Pipeline Module

Multi-agent architecture for RAG processing.
Each agent handles a specific step in the pipeline:

1. Extractor     - Retrieves relevant chunks from vector store
2. Analyzer      - Analyzes context relevance and quality
3. Preprocessor  - Cleans and normalizes text data
4. Optimizer     - Reorders/trims context for optimal prompting
5. Synthesizer   - Generates response using LLM
6. Validator     - Checks response quality
7. Assembler     - Packages final structured output
"""

from .analyzer import AnalyzerAgent
from .assembler import AssemblerAgent
from .base_agent import AgentResult, BaseAgent
from .extractor import ExtractorAgent
from .optimizer import OptimizerAgent
from .pipeline import AgentPipeline
from .preprocessor import PreprocessorAgent
from .synthesizer import SynthesizerAgent
from .validator import ValidatorAgent

__all__ = [
    "BaseAgent",
    "AgentResult",
    "ExtractorAgent",
    "AnalyzerAgent",
    "PreprocessorAgent",
    "OptimizerAgent",
    "SynthesizerAgent",
    "ValidatorAgent",
    "AssemblerAgent",
    "AgentPipeline",
]
