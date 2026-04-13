"""
Vector Store Service

Manages FAISS vector store for document embeddings and retrieval.
Supports saving and loading the index from disk for persistence.
"""

import os
import logging
from typing import Any, List, Optional, Tuple, cast

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

from ..config import get_settings, get_embedding_fallback_chain, AIProvider

logger = logging.getLogger(__name__)


class VectorStoreService:
    """
    Service for managing vector store operations.

    Handles:
    - Creating embeddings from documents
    - Building and querying FAISS index
    - Similarity search for retrieval
    - Saving / loading FAISS index to / from disk
    """

    def __init__(self):
        self.settings = get_settings()
        self.vectorstore: Optional[FAISS] = None
        self.embeddings: Optional[OpenAIEmbeddings] = None
        self._persist_dir = self.settings.faiss_persist_dir

        # Attempt to load a previously persisted index at startup
        self._try_load_from_disk()

    def _make_openai_embeddings(self, provider: AIProvider, model: str) -> OpenAIEmbeddings:
        """Build OpenAIEmbeddings for an OpenAI-compatible provider."""
        key: Optional[str] = provider.api_key
        if provider.name == "openrouter":
            key = key or self.settings.openrouter_api_key
        elif provider.name == "openai":
            key = key or self.settings.openai_direct_api_key
        base_url = (
            self.settings.openrouter_api_base
            if provider.name == "openrouter"
            else provider.base_url
        )
        return OpenAIEmbeddings(
            base_url=base_url,
            model=model,
            api_key=cast(Any, key),
        )

    def _embedding_candidates(self) -> List[Tuple[AIProvider, str]]:
        return get_embedding_fallback_chain()

    # ------------------------------------------------------------------
    # FAISS persistence helpers
    # ------------------------------------------------------------------

    def _persist_path(self) -> str:
        return os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            self._persist_dir,
        )

    def _try_load_from_disk(self) -> None:
        """Load a persisted FAISS index if one exists (try each embedding backend)."""
        path = self._persist_path()
        index_file = os.path.join(path, "index.faiss")
        if not os.path.exists(index_file):
            return

        last_error: Optional[Exception] = None
        for provider, model in self._embedding_candidates():
            try:
                emb = self._make_openai_embeddings(provider, model)
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

    def create_from_documents(self, documents: List[Document]) -> int:
        """Create vector store from document chunks and persist to disk."""
        candidates = self._embedding_candidates()
        if not candidates:
            raise ValueError(
                "No embedding provider configured. Set OPENROUTER_API_KEY "
                "and/or OPENAI_DIRECT_API_KEY (OpenAI) — embeddings require an "
                "OpenAI-compatible embedding endpoint."
            )

        last_error: Optional[Exception] = None
        for provider, model in candidates:
            try:
                emb = self._make_openai_embeddings(provider, model)
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
                )

        raise RuntimeError(
            f"All embedding providers failed. Last error: {last_error}"
        ) from last_error

    def similarity_search(self, query: str, k: Optional[int] = None) -> List[Document]:
        """Search for similar documents."""
        if self.vectorstore is None:
            raise ValueError("Vector store not initialized. Upload a PDF first.")
        k = k or self.settings.retrieval_k
        return self.vectorstore.similarity_search(query, k=k)

    def get_retriever(self, k: Optional[int] = None):
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
