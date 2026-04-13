"""
Application Configuration

Manages environment variables, API keys, and provider configurations.
Uses pydantic-settings for validation and type safety.
Supports OpenRouter, Groq, OpenAI, Google Gemini, and Hugging Face.
"""

import os
from typing import Optional, Dict, List
from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings

_DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]


class AIProvider:
    """
    Configuration for an AI provider.

    Attributes:
        name: Provider identifier
        base_url: API endpoint URL
        api_key_env: Environment variable name for API key
        models: List of supported model identifiers
        is_enabled: Whether this provider has a valid key
    """

    def __init__(
        self,
        name: str,
        base_url: str,
        api_key_env: str,
        models: List[str],
        embedding_model: Optional[str] = None,
        is_openai_compatible: bool = True,
    ):
        self.name = name
        self.base_url = base_url
        self.api_key_env = api_key_env
        self.models = models
        self.embedding_model = embedding_model
        self.is_openai_compatible = is_openai_compatible
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


# ---------------------------------------------------------------------------
# Supported AI providers (order = default fallback priority)
# ---------------------------------------------------------------------------
AI_PROVIDERS: Dict[str, AIProvider] = {
    "openrouter": AIProvider(
        name="openrouter",
        base_url="https://openrouter.ai/api/v1",
        api_key_env="OPENAI_API_KEY",
        models=[
            "openai/gpt-4o-mini",
            "openai/gpt-4o",
            "anthropic/claude-3-haiku",
            "anthropic/claude-3.5-sonnet",
            "meta-llama/llama-3.1-70b-instruct",
            "google/gemini-pro",
        ],
        embedding_model="openai/text-embedding-3-small",
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
        embedding_model=None,
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
        embedding_model="text-embedding-3-small",
    ),
    "gemini": AIProvider(
        name="gemini",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key_env="GOOGLE_API_KEY",
        models=[
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ],
        embedding_model=None,
    ),
    "huggingface": AIProvider(
        name="huggingface",
        base_url="https://api-inference.huggingface.co/v1/",
        api_key_env="HF_API_KEY",
        models=[
            "mistralai/Mistral-7B-Instruct-v0.3",
            "HuggingFaceH4/zephyr-7b-beta",
            "meta-llama/Meta-Llama-3-8B-Instruct",
        ],
        embedding_model=None,
    ),
}

# Ordered priority for automatic failover attempts
PROVIDER_PRIORITY: List[str] = [
    "openrouter", "groq", "gemini", "huggingface", "openai",
]


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All sensitive values should be set via environment variables,
    not hardcoded in the codebase.
    """

    # Application
    app_name: str = "RAG PDF Chat"
    app_version: str = "2.0.0"
    debug: bool = False

    # API Keys (loaded from environment)
    openai_api_key: Optional[str] = None
    openai_api_base: str = "https://openrouter.ai/api/v1"
    groq_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    hf_api_key: Optional[str] = None
    openai_direct_api_key: Optional[str] = None

    # Default AI settings
    default_model: str = "openai/gpt-4o-mini"
    default_provider: str = "openrouter"
    temperature: float = 0.0
    max_tokens: int = 2048

    # RAG settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_k: int = 4

    # FAISS persistence
    faiss_persist_dir: str = "faiss_index"

    # CORS — comma-separated (avoids pydantic-settings JSON parsing for List fields)
    cors_origins_csv: Optional[str] = Field(
        default=None,
        validation_alias="CORS_ORIGINS",
    )

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        raw = self.cors_origins_csv
        if not raw or not raw.strip():
            return list(_DEFAULT_CORS_ORIGINS)
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        return parts if parts else list(_DEFAULT_CORS_ORIGINS)

    # File upload settings
    max_file_size: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
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

    default = AI_PROVIDERS.get(settings.default_provider)
    if default and default.is_enabled:
        return default

    for name in PROVIDER_PRIORITY:
        provider = AI_PROVIDERS.get(name)
        if provider and provider.is_enabled:
            return provider

    return AI_PROVIDERS["openrouter"]


def get_fallback_chain() -> List[AIProvider]:
    """Return an ordered list of enabled providers for failover."""
    return [
        AI_PROVIDERS[name]
        for name in PROVIDER_PRIORITY
        if name in AI_PROVIDERS and AI_PROVIDERS[name].is_enabled
    ]
