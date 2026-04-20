"""
Validator Agent

Validates the generated answer for quality and relevance.
Can flag low-confidence or potentially incorrect responses.
"""

from typing import Any

from .base_agent import BaseAgent


class ValidatorAgent(BaseAgent):
    """
    Agent responsible for validating generated answers.
    
    Performs:
    - Length validation
    - Confidence indicators
    - Quality checks
    
    Usage:
        validator = ValidatorAgent()
        validated_answer = validator.execute(answer, context)
    """
    
    def __init__(
        self,
        min_answer_length: int = 10,
        max_answer_length: int = 5000
    ):
        """
        Initialize the validator agent.
        
        Args:
            min_answer_length: Minimum valid answer length
            max_answer_length: Maximum valid answer length
        """
        super().__init__(
            name="validator",
            description="Validates generated answers for quality"
        )
        self.min_answer_length = min_answer_length
        self.max_answer_length = max_answer_length
    
    def process(self, input_data: str, context: dict[str, Any]) -> str:
        """
        Validate the generated answer.
        
        Args:
            input_data: Generated answer string
            context: Pipeline context
            
        Returns:
            Validated (possibly modified) answer
        """
        answer = input_data
        
        # Lightweight post-checks only; we do not perform a second LLM pass here.
        validation_issues = []
        
        # Check length
        if len(answer) < self.min_answer_length:
            validation_issues.append("answer_too_short")
        
        if len(answer) > self.max_answer_length:
            answer = answer[:self.max_answer_length] + "..."
            validation_issues.append("answer_truncated")
        
        # Check for common failure patterns
        # This helps frontends label "uncertain" responses without parsing full text.
        failure_indicators = [
            "I cannot find",
            "I don't have information",
            "not mentioned in the document",
            "no information available"
        ]
        
        is_uncertain = any(
            indicator.lower() in answer.lower()
            for indicator in failure_indicators
        )
        
        # Update context with validation results
        context["validation_passed"] = len(validation_issues) == 0
        context["validation_issues"] = validation_issues
        context["is_uncertain_answer"] = is_uncertain
        
        return answer
