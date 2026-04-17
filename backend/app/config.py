"""
Application Configuration

Manages environment variables, API keys, and provider configurations.
Uses pydantic-settings for validation and type safety.
Supports OpenRouter, Groq, OpenAI, Google Gemini, and Hugging Face.
"""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import AliasChoices, Field, computed_field
from pydantic_settings import BaseSettings

# Pydantic reads .env into Settings, but AIProvider uses os.getenv — load .env into os.environ first.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

_DEFAULT_CORS_ORIGINS: list[str] = [
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
        models: list[str],
        embedding_model: str | None = None,
        is_openai_compatible: bool = True,
    ):
        self.name = name
        self.base_url = base_url
        self.api_key_env = api_key_env
        self.models = models
        self.embedding_model = embedding_model
        self.is_openai_compatible = is_openai_compatible
        self._api_key: str | None = None

    @property
    def api_key(self) -> str | None:
        """Get API key from environment."""
        if self._api_key is None:
            self._api_key = os.getenv(self.api_key_env)
            if not self._api_key and self.name == "openrouter":
                self._api_key = os.getenv("OPENAI_API_KEY")
        return self._api_key

    @property
    def is_enabled(self) -> bool:
        """Check if provider has valid API key."""
        return bool(self.api_key)


# ---------------------------------------------------------------------------
# Supported AI providers (order = default fallback priority)
# ---------------------------------------------------------------------------
AI_PROVIDERS: dict[str, AIProvider] = {
    "openrouter": AIProvider(
        name="openrouter",
        base_url="https://openrouter.ai/api/v1",
        api_key_env="OPENROUTER_API_KEY",
        models=[
            "openai/gpt-4o-mini",
            "openai/gpt-4o",
            "anthropic/claude-3-haiku",
            "anthropic/claude-3.7-sonnet",
            "meta-llama/llama-3.3-70b-instruct",
            "google/gemini-2.0-flash-001",
        ],
        embedding_model="openai/text-embedding-3-small",
    ),
    "groq": AIProvider(
        name="groq",
        base_url="https://api.groq.com/openai/v1",
        api_key_env="GROQ_API_KEY",
        models=[
            "llama-3.3-70b-versatile",
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
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.5-pro",
            "gemini-flash-latest",
            "gemini-2.0-flash",
        ],
        embedding_model="gemini-embedding-001",
    ),
    "huggingface": AIProvider(
        name="huggingface",
        base_url="https://router.huggingface.co/v1",
        api_key_env="HF_API_KEY",
        models=[
            "mistralai/Mistral-7B-Instruct-v0.3",
            "HuggingFaceH4/zephyr-7b-beta",
            "meta-llama/Meta-Llama-3-8B-Instruct",
        ],
        embedding_model="sentence-transformers/all-MiniLM-L6-v2",
    ),
}

# Ordered priority for automatic failover attempts
PROVIDER_PRIORITY: list[str] = [
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
    openrouter_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("OPENROUTER_API_KEY", "OPENAI_API_KEY"),
    )
    openrouter_api_base: str = Field(
        default="https://openrouter.ai/api/v1",
        validation_alias=AliasChoices("OPENROUTER_API_BASE", "OPENAI_API_BASE"),
    )
    groq_api_key: str | None = None
    google_api_key: str | None = None
    hf_api_key: str | None = None
    openai_direct_api_key: str | None = None

    # When false (default), direct OpenAI is not used for PDF embeddings — only OpenRouter
    # (avoids 429/quota errors from a stale OPENAI_DIRECT_API_KEY). Set to true to allow
    # api.openai.com as an embedding fallback after OpenRouter.
    embedding_openai_direct: bool = Field(default=False)

    # Default AI settings
    default_model: str = "openai/gpt-4o-mini"
    default_provider: str = "openrouter"
    temperature: float = 0.0
    max_tokens: int = 2048

    # RAG settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retrieval_k: int = 4

    # FAISS persistence (per X-Chat-Session-Id under faiss_index/sessions/<uuid>/)
    faiss_persist_dir: str = "faiss_index"
    max_vector_sessions: int = Field(default=64, ge=4, le=10_000)
    # 0 = disabled. Default 3 (demo): on each API startup remove session dirs older than N days
    # (orphans after redeploys) and non-UUID junk under sessions/. Set 0 to skip.
    faiss_session_max_age_days: int = Field(default=3, ge=0, le=365)

    # Per-IP sliding window (60s). 0 = disabled. Mitigates upload / ask spam and LRU flooding.
    rate_limit_upload_per_minute: int = Field(default=8, ge=0, le=500)
    rate_limit_ask_per_minute: int = Field(default=90, ge=0, le=5000)

    # CORS — comma-separated (avoids pydantic-settings JSON parsing for List fields)
    cors_origins_csv: str | None = Field(
        default=None,
        validation_alias="CORS_ORIGINS",
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
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


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


def provider_has_credentials(provider: AIProvider) -> bool:
    """True if LLM calls can authenticate (env + pydantic Settings)."""
    settings = get_settings()
    if provider.name == "openrouter":
        return bool(provider.api_key or settings.openrouter_api_key)
    if provider.name == "openai":
        return bool(provider.api_key or settings.openai_direct_api_key)
    if provider.name == "groq":
        return bool(provider.api_key or settings.groq_api_key)
    if provider.name == "gemini":
        return bool(provider.api_key or settings.google_api_key)
    if provider.name == "huggingface":
        return bool(provider.api_key or settings.hf_api_key)
    return bool(provider.api_key)


def get_available_providers() -> list[str]:
    """Get list of providers with valid API keys."""
    return [
        name for name, provider in AI_PROVIDERS.items()
        if provider_has_credentials(provider)
    ]


def get_provider(name: str) -> AIProvider | None:
    """Get provider configuration by name."""
    return AI_PROVIDERS.get(name)


def get_default_provider() -> AIProvider:
    """Get the default or first available provider."""
    settings = get_settings()

    default = AI_PROVIDERS.get(settings.default_provider)
    if default and provider_has_credentials(default):
        return default

    for name in PROVIDER_PRIORITY:
        provider = AI_PROVIDERS.get(name)
        if provider and provider_has_credentials(provider):
            return provider

    return AI_PROVIDERS["openrouter"]


def get_fallback_chain() -> list[AIProvider]:
    """Return an ordered list of providers that have credentials for LLM calls."""
    return [
        AI_PROVIDERS[name]
        for name in PROVIDER_PRIORITY
        if name in AI_PROVIDERS and provider_has_credentials(AI_PROVIDERS[name])
    ]


def get_embedding_fallback_chain() -> list[tuple[AIProvider, str]]:
    """
    Ordered embedding backends to try (upload / index build).

    Puts the configured default provider first when it defines an embedding model,
    then walks PROVIDER_PRIORITY (OpenRouter, Gemini, Hugging Face, OpenAI; Groq skipped when no embedding_model).
    Direct OpenAI embeddings run only if embedding_openai_direct is true.
    """
    chain: list[tuple[AIProvider, str]] = []
    seen: set[tuple[str, str]] = set()
    settings = get_settings()

    def has_embedding_key(provider: AIProvider) -> bool:
        if provider.name == "openrouter":
            return bool(provider.api_key or settings.openrouter_api_key)
        if provider.name == "openai":
            if not settings.embedding_openai_direct:
                return False
            return bool(provider.api_key or settings.openai_direct_api_key)
        if provider.name == "groq":
            if not provider.embedding_model:
                return False
            return bool(provider.api_key or settings.groq_api_key)
        if provider.name == "gemini":
            return bool(provider.api_key or settings.google_api_key)
        if provider.name == "huggingface":
            return bool(provider.api_key or settings.hf_api_key)
        return provider.is_enabled

    def append_provider(provider: AIProvider | None) -> None:
        if provider is None or not has_embedding_key(provider):
            return
        model = provider.embedding_model
        if not model:
            return
        sig = (provider.base_url, model)
        if sig in seen:
            return
        seen.add(sig)
        chain.append((provider, model))

    append_provider(AI_PROVIDERS.get(settings.default_provider))

    for name in PROVIDER_PRIORITY:
        append_provider(AI_PROVIDERS.get(name))

    gem = AI_PROVIDERS.get("gemini")
    if gem and has_embedding_key(gem):
        m2 = "gemini-embedding-2-preview"
        sig = (gem.base_url, m2)
        if sig not in seen:
            seen.add(sig)
            chain.append((gem, m2))

    return chain
