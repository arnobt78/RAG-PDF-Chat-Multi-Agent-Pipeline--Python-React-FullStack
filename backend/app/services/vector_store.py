"""
Vector Store Service

Manages FAISS vector store for document embeddings and retrieval.
Supports saving and loading the index from disk for persistence.
"""

import os
import logging
from typing import Any, List, Optional, cast

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

from ..config import get_settings, get_default_provider, AI_PROVIDERS

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
        self.embeddings = self._create_embeddings()
        self._persist_dir = self.settings.faiss_persist_dir

        # Attempt to load a previously persisted index at startup
        self._try_load_from_disk()

    def _create_embeddings(self) -> OpenAIEmbeddings:
        """Create embeddings model using available provider."""
        provider = get_default_provider()

        embedding_model = provider.embedding_model
        if not embedding_model:
            provider = AI_PROVIDERS.get("openrouter", provider)
            embedding_model = provider.embedding_model or "openai/text-embedding-3-small"

        key = provider.api_key or self.settings.openai_api_key
        return OpenAIEmbeddings(
            base_url=provider.base_url,
            model=embedding_model,
            api_key=cast(Any, key),
        )

    # ------------------------------------------------------------------
    # FAISS persistence helpers
    # ------------------------------------------------------------------

    def _persist_path(self) -> str:
        return os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            self._persist_dir,
        )

    def _try_load_from_disk(self) -> None:
        """Load a persisted FAISS index if one exists."""
        path = self._persist_path()
        index_file = os.path.join(path, "index.faiss")
        if os.path.exists(index_file):
            try:
                self.vectorstore = FAISS.load_local(
                    path,
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                logger.info("Loaded persisted FAISS index from %s", path)
            except Exception as exc:
                logger.warning("Could not load persisted FAISS index: %s", exc)

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
        self.vectorstore = FAISS.from_documents(documents, self.embeddings)
        self.save_to_disk()
        return len(documents)

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
        """Check if vector store is ready for queries."""
        return self.vectorstore is not None

    def clear(self) -> None:
        """Clear the current vector store."""
        self.vectorstore = None
