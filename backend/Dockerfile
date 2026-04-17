# ---------------------------------------------------------------------------
# RAG PDF Chat — Backend Dockerfile
#
# Lean single-stage image following DOCKER_VPS_BACKEND_PLAYBOOK.md:
#   python:3.12-slim  ·  non-root user  ·  pip --no-cache-dir
#   HEALTHCHECK  ·  copy requirements first for layer caching
# ---------------------------------------------------------------------------

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/transformers

WORKDIR /app

# Runtime OS deps only (one layer, lists cleaned)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (layer cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Writable dirs (FAISS under faiss_index/; HF/torch may use .cache when embeddings fall back locally)
RUN mkdir -p documents uploads faiss_index faiss_index/sessions .cache/huggingface .cache/transformers \
    && groupadd --system --gid 10001 appgroup \
    && useradd --system --uid 10001 --gid appgroup --home-dir /app --no-create-home appuser \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,os; p=os.environ.get('PORT','8000'); urllib.request.urlopen('http://127.0.0.1:'+p+'/health')" || exit 1

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers"]
