"""
Base Agent Class

Abstract base class for all agents in the pipeline.
Defines the interface and common functionality.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass, field
import time


@dataclass
class AgentResult:
    """
    Result from an agent execution.
    
    Attributes:
        success: Whether the agent completed successfully
        data: Output data from the agent
        error: Error message if failed
        duration_ms: Processing time in milliseconds
        metadata: Additional metadata about the execution
    """
    success: bool
    data: Any
    error: Optional[str] = None
    duration_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "success": self.success,
            "error": self.error,
            "duration_ms": self.duration_ms,
            "metadata": self.metadata,
        }


class BaseAgent(ABC):
    """
    Abstract base class for pipeline agents.
    
    Each agent in the pipeline inherits from this class and implements
    the `process` method for its specific functionality.
    
    Attributes:
        name: Unique identifier for the agent
        description: Human-readable description of agent's purpose
    """
    
    def __init__(self, name: str, description: str = ""):
        """
        Initialize the agent.
        
        Args:
            name: Agent identifier
            description: What this agent does
        """
        self.name = name
        self.description = description
    
    @abstractmethod
    def process(self, input_data: Any, context: Dict[str, Any]) -> Any:
        """
        Process input data and return result.
        
        This is the main method that each agent must implement.
        
        Args:
            input_data: Data from previous agent or initial input
            context: Shared context dictionary for pipeline state
            
        Returns:
            Processed data to pass to next agent
        """
        pass
    
    def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentResult:
        """
        Execute the agent with timing and error handling.
        
        Wraps the `process` method with:
        - Timing measurement
        - Error handling
        - Result formatting
        
        Args:
            input_data: Data from previous agent
            context: Shared pipeline context
            
        Returns:
            AgentResult with output or error
        """
        start_time = time.time()
        
        try:
            result = self.process(input_data, context)
            duration_ms = (time.time() - start_time) * 1000
            
            return AgentResult(
                success=True,
                data=result,
                duration_ms=duration_ms,
                metadata={"agent": self.name}
            )
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            
            return AgentResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=duration_ms,
                metadata={"agent": self.name}
            )
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}')"
