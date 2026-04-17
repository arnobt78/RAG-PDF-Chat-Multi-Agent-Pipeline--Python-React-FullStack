# ---------------------------------------------------------------------------
# RAG PDF Chat — backend image (Coolify / Hetzner VPS)
#
# Matches the patterns in:
#   - docs/DOCKER_VPS_BACKEND_PLAYBOOK.md   (slim, non-root, PORT, HEALTHCHECK)
#   - docs/SUBDOMAIN_ARNOBMAHMUD_SETUP.md (Coolify + Traefik; container port 3000)
#   - docs/HETZNER_VPS_MIGRATION_GUIDE.md   (VPS / Coolify deployment context)
#
# Coolify: Base Directory = backend, set PORT=3000 in service env (Traefik
# loadbalancer.server.port=3000). Liveness path is /health (this app has no /api prefix).
# Local dev without Docker still typically uses uvicorn on 8000 — unrelated to this image.
# ---------------------------------------------------------------------------

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000 \
    HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/transformers

WORKDIR /app

# Runtime OS deps only (one layer, lists cleaned) — playbook §1 / §2
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first so code-only edits keep this layer cached — playbook §1.5
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Writable dirs for FAISS + HF/torch caches; non-root — playbook §1.7
RUN mkdir -p documents uploads faiss_index faiss_index/sessions .cache/huggingface .cache/transformers \
    && groupadd --system --gid 10001 appgroup \
    && useradd --system --uid 10001 --gid appgroup --home-dir /app --no-create-home appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Document the port Coolify / Traefik expect (ENV PORT may still be overridden at run).
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,os; p=os.environ.get('PORT','3000'); urllib.request.urlopen('http://127.0.0.1:'+p+'/health')" || exit 1

# --proxy-headers: trust X-Forwarded-* from Coolify reverse proxy (subdomain doc).
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers"]
