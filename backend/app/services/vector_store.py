"""
Vector Store Service

Manages FAISS vector store for document embeddings and retrieval.
Supports saving and loading the index from disk for persistence.
"""

import logging
import os
from typing import Any, cast

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings

from ..config import AIProvider, get_embedding_fallback_chain, get_settings
from .embedding_clients import GeminiEmbeddings, GroqEmbeddings

logger = logging.getLogger(__name__)


class VectorStoreService:
    """
    Service for managing vector store operations.

    Handles:
    - Creating embeddings from documents
    - Building and querying FAISS index
    - Similarity search for retrieval
    - Saving / loading FAISS index to / from disk

    Each ``session_id`` (UUID from ``X-Chat-Session-Id``) uses a separate
    directory under ``faiss_index/sessions/<id>/`` so demo users do not
    overwrite each other's indexes.
    """

    def __init__(self, session_id: str) -> None:
        self.settings = get_settings()
        self._session_id = session_id.strip()
        self.vectorstore: FAISS | None = None
        self.embeddings: Embeddings | None = None

        # Attempt to load a previously persisted index for this session
        self._try_load_from_disk()

    @staticmethod
    def sessions_directory() -> str:
        """``<backend>/<faiss_persist_dir>/sessions`` (each UUID is a subfolder)."""
        settings = get_settings()
        return os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            settings.faiss_persist_dir,
            "sessions",
        )

    @staticmethod
    def disk_path_for_session(session_id: str) -> str:
        """Absolute path to the on-disk FAISS directory for a browser session."""
        return os.path.join(
            VectorStoreService.sessions_directory(),
            session_id.strip(),
        )

    def _resolve_api_key(self, provider: AIProvider) -> str | None:
        if provider.name == "openrouter":
            return provider.api_key or self.settings.openrouter_api_key
        if provider.name == "openai":
            return provider.api_key or self.settings.openai_direct_api_key
        if provider.name == "groq":
            return provider.api_key or self.settings.groq_api_key
        if provider.name == "gemini":
            return provider.api_key or self.settings.google_api_key
        if provider.name == "huggingface":
            return provider.api_key or self.settings.hf_api_key
        return provider.api_key

    def _make_local_cpu_embeddings(self, model: str) -> Embeddings:
        """Runs MiniLM (etc.) on CPU via sentence-transformers — no cloud API."""
        mk: dict[str, Any] = {"device": "cpu"}
        return HuggingFaceEmbeddings(model_name=model, model_kwargs=mk)

    def _make_embeddings(self, provider: AIProvider, model: str) -> Embeddings:
        if provider.name == "huggingface":
            key = self._resolve_api_key(provider)
            mk: dict[str, Any] = {"device": "cpu"}
            if key:
                mk["token"] = key
            return HuggingFaceEmbeddings(model_name=model, model_kwargs=mk)
        if provider.name == "groq":
            key = self._resolve_api_key(provider)
            if not key:
                raise ValueError("GROQ_API_KEY missing")
            return GroqEmbeddings(
                api_key=key,
                model=model,
                base_url=provider.base_url.rstrip("/"),
            )
        if provider.name == "gemini":
            key = self._resolve_api_key(provider)
            if not key:
                raise ValueError("GOOGLE_API_KEY missing")
            return GeminiEmbeddings(api_key=key, model=model)
        key = self._resolve_api_key(provider)
        base_url = (
            self.settings.openrouter_api_base
            if provider.name == "openrouter"
            else provider.base_url
        )
        return OpenAIEmbeddings(  # type: ignore[call-arg]
            base_url=base_url,
            model=model,
            api_key=cast(Any, key),
        )

    def _embedding_candidates(self) -> list[tuple[AIProvider, str]]:
        return get_embedding_fallback_chain()

    # ------------------------------------------------------------------
    # FAISS persistence helpers
    # ------------------------------------------------------------------

    def _persist_path(self) -> str:
        return self.disk_path_for_session(self._session_id)

    def _try_load_from_disk(self) -> None:
        """Load a persisted FAISS index if one exists (try each embedding backend)."""
        path = self._persist_path()
        index_file = os.path.join(path, "index.faiss")
        if not os.path.exists(index_file):
            return

        last_error: Exception | None = None
        for provider, model in self._embedding_candidates():
            try:
                emb = self._make_embeddings(provider, model)
                self.vectorstore = FAISS.load_local(
                    path,
                    emb,
                    allow_dangerous_deserialization=True,
                )
                self.embeddings = emb
                logger.info(
                    "Loaded persisted FAISS index from %s (embeddings: %s / %s)",
                    path,
                    provider.name,
                    model,
                )
                return
            except Exception as exc:
                last_error = exc
                logger.debug(
                    "FAISS load with %s / %s failed: %s",
                    provider.name,
                    model,
                    exc,
                )

        try:
            emb = self._make_local_cpu_embeddings(
                "sentence-transformers/all-MiniLM-L6-v2"
            )
            self.vectorstore = FAISS.load_local(
                path,
                emb,
                allow_dangerous_deserialization=True,
            )
            self.embeddings = emb
            logger.info("Loaded persisted FAISS index using local CPU embeddings")
            return
        except Exception as exc:
            logger.debug("Local embedding load failed: %s", exc)

        logger.warning(
            "Could not load persisted FAISS index from %s (last error: %s)",
            path,
            last_error,
        )

    def save_to_disk(self) -> None:
        """Persist the current FAISS index to disk."""
        if self.vectorstore is None:
            return
        path = self._persist_path()
        os.makedirs(path, exist_ok=True)
        self.vectorstore.save_local(path)
        logger.info("Saved FAISS index to %s", path)

    # ------------------------------------------------------------------
    # Core operations
    # ------------------------------------------------------------------

    def create_from_documents(self, documents: list[Document]) -> int:
        """Create vector store from document chunks and persist to disk."""
        candidates = self._embedding_candidates()
        if not candidates:
            raise ValueError(
                "No embedding provider configured. Set at least one of: "
                "OPENROUTER_API_KEY, GOOGLE_API_KEY, HF_API_KEY, "
                "or OPENAI_DIRECT_API_KEY (with EMBEDDING_OPENAI_DIRECT=true)."
            )

        last_error: Exception | None = None
        for provider, model in candidates:
            try:
                emb = self._make_embeddings(provider, model)
                self.vectorstore = FAISS.from_documents(documents, emb)
                self.embeddings = emb
                self.save_to_disk()
                logger.info(
                    "Vector index built with embeddings: %s / %s",
                    provider.name,
                    model,
                )
                return len(documents)
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Embedding attempt failed (%s / %s): %s",
                    provider.name,
                    model,
                    exc,
                    exc_info=logger.isEnabledFor(logging.DEBUG),
                )

        try:
            emb = self._make_local_cpu_embeddings(
                "sentence-transformers/all-MiniLM-L6-v2"
            )
            self.vectorstore = FAISS.from_documents(documents, emb)
            self.embeddings = emb
            self.save_to_disk()
            logger.info("Vector index built with local CPU embeddings (MiniLM)")
            return len(documents)
        except Exception as exc:
            last_error = exc
            logger.warning("Local CPU embedding fallback failed: %s", exc)

        err = last_error
        detail = f"{type(err).__name__}: {err!r}" if err else "unknown"
        raise RuntimeError(
            f"All embedding providers failed. Last error: {detail}"
        ) from err

    def similarity_search(self, query: str, k: int | None = None) -> list[Document]:
        """Search for similar documents."""
        if self.vectorstore is None:
            raise ValueError("Vector store not initialized. Upload a PDF first.")
        k = k or self.settings.retrieval_k
        return self.vectorstore.similarity_search(query, k=k)

    def get_retriever(self, k: int | None = None):
        """Get a retriever for use in chains."""
        if self.vectorstore is None:
            raise ValueError("Vector store not initialized. Upload a PDF first.")
        k = k or self.settings.retrieval_k
        return self.vectorstore.as_retriever(search_kwargs={"k": k})

    @property
    def is_ready(self) -> bool:
        """Check if the vector store is ready for queries."""
        return self.vectorstore is not None

    def clear(self) -> None:
        """Clear the current vector store."""
        self.vectorstore = None
        self.embeddings = None
