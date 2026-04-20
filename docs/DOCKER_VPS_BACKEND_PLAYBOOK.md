# Docker — lean VPS backend playbook (Coolify / Hetzner)

Copy this checklist into new Python (or similar) backend repos you deploy with **Dockerfile + Coolify**. It maps common “small image” practices to **real** backend constraints (Python wheels, system libs, secrets).

## This Project (RAG PDF Chat) — applied profile

- **Repo layout:** monorepo (`frontend/` + `backend/`), Docker target is `backend/`
- **Runtime stack:** FastAPI + Uvicorn + LangChain + FAISS + sentence-transformers
- **Image baseline:** `python:3.12-slim`
- **Production dependency source:** `backend/requirements.txt` only (no `requirements-dev.txt` in runtime image)
- **Container port contract:** process listens on `PORT=3000`; Coolify/Traefik must route to `3000`
- **Sessioned RAG behavior:** browser sends `X-Chat-Session-Id`; backend stores per-session FAISS indexes
- **Disk housekeeping:** periodic prune is fine on VPS; avoid aggressive prune during active deploy windows

**Related docs in this repo:** [COOLIFY_PUBLIC_BACKEND_GUIDE.md](./COOLIFY_PUBLIC_BACKEND_GUIDE.md) (DNS + Traefik/Caddy + TLS, placeholders only), [DEPLOYMENT.md](./DEPLOYMENT.md) (blog-to-audio layout). Personal VPS runbooks can stay **local** and **gitignored** under `docs/` if you prefer not to publish IPs or internal names.

---

## 1. Seven practices → Python / FastAPI reality

| # | Practice | Python / VPS notes |
|---|----------|-------------------|
| 1 | **Small base image** | Prefer `python:X.Y-slim` (Debian glibc). **Alpine** is smaller but many PyPI wheels lack musl builds — use Alpine only if you verify every dependency. Avoid unversioned `python:latest`. |
| 2 | **Multi-stage builds** | Biggest win when the **builder** needs `gcc`, `build-essential`, or heavy dev tools you do not want in production. Copy a **venv** (`COPY --from=builder /opt/venv /opt/venv`) or only built artifacts. Pure-wheel apps gain **modest** size savings from multi-stage alone. |
| 3 | **Install only what you need** | Runtime: only system packages the app uses (e.g. `ffmpeg` for audio, `libpq5` for Postgres client). **No** `vim`, `curl` in prod unless you truly need them. |
| 4 | **Clean caches in the same `RUN`** | `apt-get`: `&& rm -rf /var/lib/apt/lists/*`. **pip**: `--no-cache-dir`. Never leave `apt-get update` in a separate layer without install+clean in the same instruction. |
| 5 | **Fewer layers / good cache order** | Chain `apt` with `&&`. Copy **`requirements.txt` first**, `pip install`, **then** copy app code so dependency layer stays cached when only code changes. |
| 6 | **`.dockerignore`** | Exclude `.git`, `frontend/`, `.env*`, `__pycache__`, tests, docs you do not need in the image — smaller context, faster builds, fewer accidental secret leaks. |
| 7 | **Do not run as root** | Create a non-root user, `chown` writable dirs (`/app`, `audio_files`, etc.), `USER` before `CMD`. Reduces blast radius if the process is compromised. |

**Reality check:** viral “1.5 GB → 50 MB” posts are often **Node** (dropping `node_modules` + build tools). Python API images are dominated by **base + PyPI deps + optional native libs** (e.g. `ffmpeg`). Aim for **lean + correct**, not arbitrary MB targets.

---

## 2. Minimal Dockerfile template (FastAPI + uvicorn, Coolify)

Adjust paths, port, and health path to your app.

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

WORKDIR /app

# Runtime OS deps only — one layer, lists cleaned
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Writable dirs + non-root (UID/GID arbitrary but stable)
RUN mkdir -p audio_files \
    && groupadd --system --gid 10001 appgroup \
    && useradd --system --uid 10001 --gid appgroup --home-dir /app --no-create-home appuser \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,os; p=os.environ.get('PORT','3000'); urllib.request.urlopen('http://127.0.0.1:'+p+'/api/health')" || exit 1

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
```

**Coolify:** set `PORT=3000`, map host port → `3000`, Traefik `loadbalancer.server.port=3000` (see [COOLIFY_PUBLIC_BACKEND_GUIDE.md](./COOLIFY_PUBLIC_BACKEND_GUIDE.md)).

**Optional — pin base digest** (reproducible builds; refresh when you intentionally upgrade):

```dockerfile
# FROM python:3.12-slim@sha256:<digest>
```

Get digest: `docker pull python:3.12-slim && docker inspect python:3.12-slim --format '{{index .RepoDigests 0}}'`

---

## 3. Optional multi-stage (when you add compile deps later)

Use when `pip install` needs `gcc`, `python3-dev`, etc. Final stage only copies the venv + app + runtime `.so` deps.

```dockerfile
# --- builder ---
FROM python:3.12-slim AS builder
WORKDIR /opt/app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY main.py .

# --- runtime ---
FROM python:3.12-slim
WORKDIR /app
ENV PATH="/opt/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=3000
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /opt/app/main.py ./main.py
# runtime apt libs only (e.g. ffmpeg) + non-root as in section 2
```

Adapt `COPY` paths to your repo layout (`backend/` vs root).

---

## 4. `.dockerignore` template

Reuse and extend per project:

```gitignore
.git
.env
.env.*
!.env.example
__pycache__
*.pyc
.venv
venv
.pytest_cache
.mypy_cache
.ruff_cache
.idea
.vscode
*.log
.DS_Store
# Monorepo: do not send frontend into API image
frontend/
node_modules/
```

---

## 5. Coolify + VPS operations

- **Secrets:** set API keys only in Coolify env — never commit `.env`. If a deploy log ever prints runtime env with keys, **rotate** those keys at the provider.
- **Healthcheck:** Coolify UI healthcheck can disagree with app health; validate with `curl https://<your-domain>/api/health`.
- **TLS:** verify issuer with `openssl s_client` (see [COOLIFY_PUBLIC_BACKEND_GUIDE.md](./COOLIFY_PUBLIC_BACKEND_GUIDE.md) §6).
- **Resources:** set CPU/memory limits in Coolify if neighbors compete (see migration guide patterns).

---

## 6. Host cleanup (SSH to VPS)

Safe routine (reclaims stopped containers + **dangling** images):

```bash
ssh deploy@YOUR_VPS_IP
sudo docker container prune -f
sudo docker image prune -f
sudo docker system df
```

**Aggressive** (removes **all** unused images, not only dangling — next Coolify build may re-pull helper/base layers; Coolify rollback images may disappear):

```bash
sudo docker image prune -a -f
sudo docker system df
```

**Optional build cache** (when disk is tight; next builds can be slower):

```bash
sudo docker builder prune -f
```

Do **not** run `prune -a` during active deploys if you want zero extra pull time.

---

## 7. Blog-to-audio–specific note

This API installs **`ffmpeg`** for **pydub** merge paths. Removing `ffmpeg` shrinks the image but **breaks** that behavior. Keep it unless you remove pydub usage.

## 7b. RAG PDF Chat note

This backend does **not** require pydub/ffmpeg for the core PDF-chat path. Keep runtime image focused on Python + vector/LLM dependencies and avoid unrelated media packages unless you intentionally add that feature.

---

## 8. Redeploy safety, performance, and architecture-dependent scenarios

This section answers “**is it safe to commit and redeploy?**”, “**will it get slower?**”, and “**is this the optimal setup?**” — with nuance per **project shape**.

### 8.1 Safe to commit and redeploy (typical Coolify flow)

For this repo’s pattern (**FastAPI + uvicorn + `PORT` env + slim + optional `ffmpeg` + non-root user**):

- **Yes — safe** to push, let Coolify rebuild, and roll out, as long as **Coolify env** (`PORT`, API keys, `CORS_ORIGINS`, etc.) is unchanged and **Traefik/Caddy labels** still point at the same container port (usually **3000**).
- **Non-root (`USER`)** does **not** meaningfully slow request handling: the same Python process runs the same code; Linux permission checks on normal file I/O are negligible compared to network + TTS work.
- **What can change after `USER`:** only **paths the app must write to** must be owned or writable by that user (here: `/app` and `audio_files/`). Read-only system paths and site-packages remain readable by default — same as before.

### 8.2 Performance: will the VPS feel “slower”?

**Image shape** affects **deploy time** and **disk**, not steady-state QPS unless you are disk- or CPU-starved.

| Factor | Effect on runtime speed |
|--------|---------------------------|
| `python:slim` vs `alpine` | **Runtime:** similar if the app runs. **Build:** Alpine can fail or compile from source if wheels are missing. |
| Fewer layers / smaller image | **Faster pull** on new nodes; **same** CPU per request once running. |
| `pip install --no-cache-dir` | **Smaller image**; no runtime slowdown. |
| Non-root user | **No meaningful** API latency change. |
| `ffmpeg` present | **Disk + memory** for the binary; **only costs CPU** when pydub/audio paths actually invoke it. |
| Heavy ML / torch stacks | **Large RAM + slow cold start** — that dominates far more than Docker “optimizations”. |

**Bottom line:** For blog-to-audio, **TTS providers and text length** dominate latency — not Docker micro-optimizations.

### 8.3 “Optimal best” depends on architecture — decision matrix

There is **no single global best Dockerfile**. Pick patterns from **constraints**:

| Your project | Lean Docker emphasis |
|--------------|----------------------|
| **Small FastAPI API** (few files, pure wheels, one process) | `slim` + `.dockerignore` + non-root + `HEALTHCHECK` + copy `requirements.txt` first — **enough**. Multi-stage optional until you add native compile deps. |
| **Needs `gcc` / `build-essential` for `pip`** | **Multi-stage**: build in builder, copy **venv** only, **purge** compilers in builder before copy, runtime stage installs **runtime** `.deb` libs only (e.g. `libpq5` not `libpq-dev`). |
| **Monorepo** (React + API in one repo) | API image: `.dockerignore` must exclude **`frontend/`**, `node_modules/`, tests — **never** ship the SPA inside the Python image unless you intend to. |
| **Backend in `backend/` subfolder** | Coolify **Base directory** = `backend`; Dockerfile path relative to that folder; keep `.dockerignore` at repo root or duplicate rules — consistency matters more than which file you pick. |
| **Stateful files** (uploads, generated audio, SQLite) | Use **named volume** or ensure directory is **writable** by non-root; for ephemeral scratch, emptyDir-style is fine but data is lost on recreate. |
| **Database in same container** | Generally **avoid** for production; run Postgres/MySQL as **Coolify managed service** or external — simpler backups and upgrades. |
| **GPU** | Needs **NVIDIA runtime** + different base images — outside this playbook’s default `slim` path. |
| **Many replicas behind a LB** | Each replica is an **immutable** container; **shared disk** must be NFS/object storage, not local `audio_files` only — architecture change, not Dockerfile-only. |

### 8.4 Multi-stage: when it is worth the complexity

- **High value:** `pip` needs compilers, or you run `npm run build` / `cargo build` / `go build` in CI inside Docker and want **only artifacts** in the final image.
- **Low value (this blog-to-audio case):** dependencies are mostly **prebuilt wheels**; multi-stage **alone** saves limited space vs a clean single-stage + `--no-cache-dir`.
- **Rule of thumb:** add multi-stage the **first time** `docker build` fails without `gcc`, or when final image contains tools you **never** use at runtime.

### 8.5 Coolify / VPS operational scenarios

| Scenario | What to watch |
|----------|----------------|
| **First deploy after `prune -a`** | Longer build: base images and Coolify helper layers **re-pull**. Not a runtime regression. |
| **Healthcheck red but app works** | Coolify probe path/port/text mismatch — fix probe or rely on Dockerfile `HEALTHCHECK` + `curl` from outside. |
| **TLS / privacy errors** | Usually **ACME / DNS / labels**, not Dockerfile — see subdomain doc. |
| **Permission denied writing files** | Almost always **non-root + volume mount ownership** — fix mount UID/GID or `chown` in entrypoint (only if you must; prefer volumes created with correct ownership). |
| **Logs printed secrets** | **Rotate keys** — Dockerfile cannot fix logging mistakes in the platform. |

### 8.6 Copy-paste reassurance (blog-to-audio–style stack)

**Dockerfile / VPS:** Committing and redeploying a **`python:3.12-slim`** image with **minimal `apt`** (here **`ffmpeg`** where audio processing needs it), **`.dockerignore`**, **`pip --no-cache-dir`**, and a **non-root user** is a **solid, pragmatic** production baseline on Coolify. It is **not** inherently slower than root for normal HTTP workloads. **“Optimal best”** always depends on needs: add **multi-stage** when compile tooling or extra build steps would otherwise bloat the runtime image; add **digest-pinned `FROM`** when you need stricter reproducibility than a rolling `slim` tag.

---

## 9. Quick verification

```bash
docker build -t my-api:test .
docker run --rm -p 3000:3000 -e PORT=3000 my-api:test
curl -s http://127.0.0.1:3000/api/health
```

After changing `USER`, confirm writable paths (e.g. `audio_files/`) still work under load on Coolify.
