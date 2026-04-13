"""
Application Configuration

Manages environment variables, API keys, and provider configurations.
Uses pydantic-settings for validation and type safety.
"""

import os
from typing import Optional, Dict, List
from pydantic_settings import BaseSettings
from functools import lru_cache


class AIProvider:
    """
    Configuration for an AI provider.
    
    Attributes:
        name: Provider identifier
        base_url: API endpoint URL
        api_key_env: Environment variable name for API key
        models: List of supported model identifiers
        is_enabled: Whether this provider is available
    """
    
    def __init__(
        self,
        name: str,
        base_url: str,
        api_key_env: str,
        models: List[str],
        embedding_model: Optional[str] = None
    ):
        self.name = name
        self.base_url = base_url
        self.api_key_env = api_key_env
        self.models = models
        self.embedding_model = embedding_model
        self._api_key: Optional[str] = None
    
    @property
    def api_key(self) -> Optional[str]:
        """Get API key from environment."""
        if self._api_key is None:
            self._api_key = os.getenv(self.api_key_env)
        return self._api_key
    
    @property
    def is_enabled(self) -> bool:
        """Check if provider has valid API key."""
        return bool(self.api_key)


# Define supported AI providers with their configurations
AI_PROVIDERS: Dict[str, AIProvider] = {
    "openrouter": AIProvider(
        name="openrouter",
        base_url="https://openrouter.ai/api/v1",
        api_key_env="OPENAI_API_KEY",  # OpenRouter uses OPENAI_API_KEY format
        models=[
            "openai/gpt-4o-mini",
            "openai/gpt-4o",
            "anthropic/claude-3-haiku",
            "anthropic/claude-3.5-sonnet",
            "meta-llama/llama-3.1-70b-instruct",
            "google/gemini-pro",
        ],
        embedding_model="openai/text-embedding-3-small"
    ),
    "groq": AIProvider(
        name="groq",
        base_url="https://api.groq.com/openai/v1",
        api_key_env="GROQ_API_KEY",
        models=[
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ],
        embedding_model=None  # Groq doesn't support embeddings
    ),
    "openai": AIProvider(
        name="openai",
        base_url="https://api.openai.com/v1",
        api_key_env="OPENAI_DIRECT_API_KEY",
        models=[
            "gpt-4o-mini",
            "gpt-4o",
            "gpt-4-turbo",
        ],
        embedding_model="text-embedding-3-small"
    ),
}


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All sensitive values should be set via environment variables,
    not hardcoded in the codebase.
    """
    
    # Application
    app_name: str = "RAG PDF Chat"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # API Keys (loaded from environment)
    openai_api_key: Optional[str] = None
    openai_api_base: str = "https://openrouter.ai/api/v1"
    groq_api_key: Optional[str] = None
    
    # Default AI settings
    default_model: str = "openai/gpt-4o-mini"
    default_provider: str = "openrouter"
    temperature: float = 0.0
    max_tokens: int = 2048
    
    # RAG settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_k: int = 4
    
    # CORS settings
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # File upload settings
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Uses lru_cache to ensure settings are only loaded once.
    """
    return Settings()


def get_available_providers() -> List[str]:
    """Get list of providers with valid API keys."""
    return [
        name for name, provider in AI_PROVIDERS.items()
        if provider.is_enabled
    ]


def get_provider(name: str) -> Optional[AIProvider]:
    """Get provider configuration by name."""
    return AI_PROVIDERS.get(name)


def get_default_provider() -> AIProvider:
    """Get the default or first available provider."""
    settings = get_settings()
    
    # Try default provider first
    default = AI_PROVIDERS.get(settings.default_provider)
    if default and default.is_enabled:
        return default
    
    # Fallback to first available
    for provider in AI_PROVIDERS.values():
        if provider.is_enabled:
            return provider
    
    # Return OpenRouter as last resort (even if not configured)
    return AI_PROVIDERS["openrouter"]
