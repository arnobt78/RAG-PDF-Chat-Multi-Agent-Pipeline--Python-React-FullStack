"""
Thin embedding clients for providers where LangChain OpenAIEmbeddings mismatches the HTTP API.
"""

from __future__ import annotations

import httpx
from langchain_core.embeddings import Embeddings

_BATCH = 32


def _norm_texts(texts: list[str]) -> list[str]:
    return [(t.replace("\n", " ").strip() or " ") for t in texts]


class GroqEmbeddings(Embeddings):
    """Groq OpenAI /v1/embeddings with explicit JSON input: list[str]."""

    def __init__(self, api_key: str, model: str, base_url: str = "https://api.groq.com/openai/v1") -> None:
        self._key = api_key
        self._model = model
        self._base = base_url.rstrip("/")

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        normed = _norm_texts(texts)
        headers = {"Authorization": f"Bearer {self._key}", "Content-Type": "application/json"}
        out: list[list[float]] = []
        with httpx.Client(timeout=120.0) as client:
            for i in range(0, len(normed), _BATCH):
                batch = normed[i : i + _BATCH]
                r = client.post(
                    f"{self._base}/embeddings",
                    headers=headers,
                    json={"model": self._model, "input": batch},
                )
                r.raise_for_status()
                data = r.json()
                rows = sorted(data.get("data", []), key=lambda x: x.get("index", 0))
                out.extend(row["embedding"] for row in rows)
        return out

    def embed_query(self, text: str) -> list[float]:
        headers = {"Authorization": f"Bearer {self._key}", "Content-Type": "application/json"}
        t = _norm_texts([text])[0]
        with httpx.Client(timeout=60.0) as client:
            r = client.post(
                f"{self._base}/embeddings",
                headers=headers,
                json={"model": self._model, "input": t},
            )
            r.raise_for_status()
            data = r.json()
        rows = sorted(data.get("data", []), key=lambda x: x.get("index", 0))
        return rows[0]["embedding"]


class GeminiEmbeddings(Embeddings):
    """Gemini REST embedContent / batchEmbedContents (not OpenAI-compat)."""

    def __init__(self, api_key: str, model: str) -> None:
        self._key = api_key
        self._resource = model if model.startswith("models/") else f"models/{model}"

    def _embedding_v2(self) -> bool:
        return "embedding-2" in self._resource.lower()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        normed = _norm_texts(texts)
        url = f"https://generativelanguage.googleapis.com/v1beta/{self._resource}:batchEmbedContents"
        headers = {"x-goog-api-key": self._key, "Content-Type": "application/json"}
        out: list[list[float]] = []
        with httpx.Client(timeout=120.0) as client:
            for i in range(0, len(normed), _BATCH):
                batch = normed[i : i + _BATCH]
                if self._embedding_v2():
                    reqs = [
                        {
                            "model": self._resource,
                            "content": {
                                "parts": [{"text": f"title: none | text: {t}"}],
                            },
                        }
                        for t in batch
                    ]
                else:
                    reqs = [
                        {
                            "model": self._resource,
                            "content": {"parts": [{"text": t}]},
                            "taskType": "RETRIEVAL_DOCUMENT",
                        }
                        for t in batch
                    ]
                body = {"requests": reqs}
                r = client.post(url, headers=headers, json=body)
                r.raise_for_status()
                data = r.json()
                chunk_out: list[list[float]] = []
                for emb in data.get("embeddings", []):
                    vals = emb.get("values")
                    if vals is not None:
                        chunk_out.append(list(vals))
                if len(chunk_out) != len(batch):
                    raise ValueError("Gemini batchEmbedContents: unexpected response length")
                out.extend(chunk_out)
        return out

    def embed_query(self, text: str) -> list[float]:
        url = f"https://generativelanguage.googleapis.com/v1beta/{self._resource}:embedContent"
        headers = {"x-goog-api-key": self._key, "Content-Type": "application/json"}
        t = _norm_texts([text])[0]
        if self._embedding_v2():
            body = {
                "model": self._resource,
                "content": {
                    "parts": [{"text": f"task: question answering | query: {t}"}],
                },
            }
        else:
            body = {
                "model": self._resource,
                "content": {"parts": [{"text": t}]},
                "taskType": "RETRIEVAL_QUERY",
            }
        with httpx.Client(timeout=60.0) as client:
            r = client.post(url, headers=headers, json=body)
            r.raise_for_status()
            data = r.json()
        emb = data.get("embedding") or {}
        vals = emb.get("values")
        if not vals:
            raise ValueError("Gemini embedContent: missing values")
        return list(vals)
