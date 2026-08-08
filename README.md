# RAG PDF Chat - Python, React, Tailwind CSS, FastAPI, SSE Streaming, Multi-Agent Pipeline, Text Chunking, Conversion History, Device-Local Data, Anonymous Sessions FullStack Project (Contextual Document Assistant)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-8.0.9-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C)](https://www.langchain.com/)
[![FAISS](https://img.shields.io/badge/FAISS-vector%20store-0055FF)](https://github.com/facebookresearch/faiss)
[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/launch/arnobt78/RAG-PDF-Chat-Multi-Agent-Pipeline--Python-React-FullStack)

A production-style, educational full-stack RAG project that demonstrates how to turn PDF documents into searchable knowledge and chat with them using modern AI models. It is designed for learners and builders who want to understand document chunking, embeddings, vector search, SSE streaming responses, multi-provider model fallback, and practical deployment (Vercel + Coolify VPS) end to end.

- **Frontend Live Demo:** [https://pdf-chat-scrapper.vercel.app/](https://pdf-chat-scrapper.vercel.app/)
- **Backend Live Demo:** [https://rag-pdf-backend.arnobmahmud.com/](https://rag-pdf-backend.arnobmahmud.com/)
- **Security:** Private vulnerability reports — see [SECURITY.md](SECURITY.md) (`contact@arnobmahmud.com`)

![Image 1](https://github.com/user-attachments/assets/d0c1ed31-8c98-4191-b388-8c0d0f55ebda)
![Image 2](https://github.com/user-attachments/assets/3557b9f2-9e33-40dc-89ff-b616db68bd84)
![Image 3](https://github.com/user-attachments/assets/0046ca91-1066-435a-89a7-ef442e8a914e)
![Image 4](https://github.com/user-attachments/assets/eb5e9e49-9993-4c96-939b-a1d1703aa835)
![Image 5](https://github.com/user-attachments/assets/84a8f448-8918-47d9-8917-3f4e539ea8d0)
![Image 6](https://github.com/user-attachments/assets/e4ac4e75-c154-4cde-9c96-0640f4b9fcba)
![Image 7](https://github.com/user-attachments/assets/f075f714-0ceb-47cc-bb1d-54c14602c345)
![Image 8](https://github.com/user-attachments/assets/bf8f07a1-7185-4b4e-ba45-600ec58339f4)
![Image 9](https://github.com/user-attachments/assets/bda5e587-f66f-4bb0-a429-95a8a1396912)
![Image 10](https://github.com/user-attachments/assets/f1353646-bc0c-425e-a037-880c16190ecb)

---

## Table of contents

- [Project overview](#project-overview)
- [What you will learn](#what-you-will-learn)
- [Keywords and glossary (beginner-friendly)](#keywords-and-glossary-beginner-friendly)
- [Architecture walkthrough](#architecture-walkthrough)
- [Tech stack and dependencies](#tech-stack-and-dependencies)
- [Project structure and file walkthrough](#project-structure-and-file-walkthrough)
- [Frontend routes and reusable pieces](#frontend-routes-and-reusable-pieces)
- [Core features and how they work](#core-features-and-how-they-work)
- [API reference](#api-reference)
- [Environment variables (`.env`) explained](#environment-variables-env-explained)
- [How to run locally](#how-to-run-locally)
- [How to deploy (Vercel + Coolify VPS)](#how-to-deploy-vercel--coolify-vps)
- [How to reuse this project in your own apps](#how-to-reuse-this-project-in-your-own-apps)
- [Quality checks and scripts](#quality-checks-and-scripts)
- [Troubleshooting notes](#troubleshooting-notes)
- [Related documentation](#related-documentation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Project overview

This app lets a user **upload a PDF** and **ask questions about it**. The backend:

1. extracts text from the PDF  
2. splits text into **chunks**  
3. turns each chunk into an **embedding** (vector)  
4. stores vectors in **FAISS** (per anonymous browser session)  
5. for each question, **retrieves** the most relevant chunks  
6. sends question + context to an **LLM** (with provider failover)  
7. returns a grounded answer — optionally **streamed** over **SSE**

It is intentionally a **Vite SPA + FastAPI** split (not Next.js), so you can learn CORS, env vars, reverse proxies, and separate frontend/backend deploys the way many real products do.

Highlights for learners:

- Anonymous session isolation (`X-Chat-Session-Id`) — no login required  
- Streaming (SSE) and non-streaming chat modes  
- Free-tier-first multi-provider model catalog (OpenRouter `:free`, Groq, Gemini, …)  
- Optional source snippets (“where did this answer come from?”)  
- Device-local chat history (IndexedDB) and preferences (localStorage)  
- Rate limiting + FAISS session cleanup for demo safety  
- Optional Sentry (browser SDK + backend tunnel)

---

## What you will learn

- How **RAG** works end-to-end in a runnable app (not only slides).  
- How a **React + TypeScript + Vite** frontend talks to a **FastAPI** API.  
- How **chunking → embeddings → vector search → LLM** fits together.  
- How **SSE** streaming feels in the UI (and how to cancel mid-stream).  
- How to isolate users **without accounts** using a session header + on-disk indexes.  
- How to configure **`.env`** for local, Vercel, and Coolify.  
- How to keep a demo resilient with **provider failover** and rate limits.

---

## Keywords and glossary (beginner-friendly)

| Term | What it is | Why it matters here |
| --- | --- | --- |
| **RAG** | Retrieval Augmented Generation: find relevant text first, then ask the LLM | Answers stay grounded in *your* PDF |
| **Embedding** | Numbers that represent meaning of text | Similar sentences land near each other in vector space |
| **FAISS** | Fast similarity search over vectors (Facebook AI) | Speedy “which chunks match this question?” |
| **Chunking** | Split a long PDF into smaller pieces | Models have context limits; retrieval needs units |
| **SSE** | Server-Sent Events — one-way stream from server → browser | Token-by-token “typing” answers |
| **Session ID** | UUID stored in the browser, sent as `X-Chat-Session-Id` | Each visitor gets their own FAISS folder |
| **LRU eviction** | Drop least-recently-used sessions when the cap is hit | Keeps disk usage bounded on a demo VPS |
| **CORS** | Browser rule: which websites may call your API | Must list your Vercel origin on Coolify |
| **Failover** | Try next provider/model when one fails | Free tiers rate-limit and deprecate models often |
| **IndexedDB** | Browser database for larger local data | Chat history stays on the device (not on the server) |

---

## Architecture walkthrough

```text
Browser (Vite React SPA)
  ├─ localStorage: X-Chat-Session-Id (UUID)
  ├─ localStorage: model / streaming / sources prefs
  ├─ IndexedDB: chat transcripts keyed by PDF name
  └─ HTTP → FastAPI (VITE_API_BASE_URL)

FastAPI (Coolify / local Uvicorn)
  ├─ POST /upload  → PDF → chunks → embeddings → FAISS (per session)
  ├─ POST /ask | /ask/stream → retrieve → multi-agent pipeline → LLM
  ├─ GET /models, /health, /status, /pipeline-info, /runtime-summary
  └─ POST /api/oversight → Sentry envelope tunnel (optional)
```

**Teaching tip:** Open the browser Network tab while you chat. You should see `/upload`, then `/ask` or `/ask/stream`, always with header `X-Chat-Session-Id`.

Default chat model (code + `.env.example`): `openai/gpt-oss-20b:free` (OpenRouter free tier). Catalogs live in `backend/app/config.py` and the frontend fallback list `frontend/src/types/index.ts` (`AI_MODELS`).

---

## Tech stack and dependencies

### Frontend (high level)

| Library | Role for learners |
| --- | --- |
| **Vite** | Fast dev server + production bundler for the SPA |
| **React 18** | UI components and hooks |
| **TypeScript** | Typed props, API payloads, model IDs |
| **React Router** | `/`, `/chat`, `/about`, `/api-status` |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Landing / section motion (chat streaming uses CSS for stability) |
| **Radix UI** | Accessible dialogs, menus, tooltips |
| **Sonner** | Toast notifications |
| **Sentry React SDK** | Optional errors/replay — only if `VITE_SENTRY_DSN` is set |

### Backend (high level)

| Library | Role for learners |
| --- | --- |
| **FastAPI** | Typed HTTP API + automatic OpenAPI at `/docs` |
| **Uvicorn** | ASGI server |
| **Pydantic / pydantic-settings** | Request schemas + env-driven config |
| **LangChain** | PDF load, split, LLM glue |
| **FAISS** | Vector index on disk per session |
| **sentence-transformers** | Local embedding fallback if cloud embeddings fail |
| **sse-starlette** | SSE streaming responses |
| **httpx / tenacity** | HTTP clients and retries |

### Why this stack is useful for learning

- Clear **UI vs AI** boundary (easy to swap either side).  
- Real ops topics: CORS, env vars, Docker, healthchecks.  
- Free-tier **failover** teaches resilience, not only happy-path demos.

---

## Project structure and file walkthrough

```text
rag-pdf-chat/
├── README.md
├── SECURITY.md                      # private vulnerability reporting
├── AGENTS.md / CLAUDE.md            # agent / contributor workflow hints
├── .agile-v/                        # project memory / requirements trail
├── docs/                            # deploy + model-selection guides
├── package.json                     # root: npm run check / build
├── scripts/check-backend.sh
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── src/
│       ├── main.tsx                 # Sentry init (env DSN), React root
│       ├── App.tsx                  # routes, providers, ErrorBoundary
│       ├── pages/                   # home, chat, about, api-status
│       ├── components/
│       │   ├── chat/                # ChatContainer, upload, model selector…
│       │   ├── layout/              # header, footer, page shell
│       │   ├── sections/            # landing marketing sections
│       │   └── ui/                  # button, glass-card, dialogs…
│       ├── hooks/                   # useChat, usePDFUpload, useHealth…
│       ├── context/                 # ChatProvider (parallel path; /chat uses hooks)
│       ├── lib/                     # api.ts, storage, sentry, env
│       └── types/                   # ChatEntry, AI_MODELS, API types
└── backend/
    ├── .env.example
    ├── Dockerfile
    ├── requirements.txt
    ├── requirements-dev.txt
    ├── tests/test_chat_stream_sse.py
    └── app/
        ├── main.py                  # CORS, lifespan, routers
        ├── config.py                # AI_PROVIDERS + Settings
        ├── routes/                  # health, upload, chat, tunnel, runtime
        ├── services/                # FAISS, LLM, rate limit, cleanup
        ├── agents/                  # multi-step RAG pipeline
        └── models/schemas.py        # Pydantic request/response models
```

Agent-oriented map (shorter): [`docs/PROJECT_WALKTHROUGH.md`](docs/PROJECT_WALKTHROUGH.md).

---

## Frontend routes and reusable pieces

| Route | Page | What you see |
| --- | --- | --- |
| `/` | Home | Hero, features, pipeline, models, CTA |
| `/chat` | Chat | Upload PDF, ask questions, stream answers |
| `/about` | About | Project story / credits |
| `/api-status` | API status | Live health / runtime summary from backend |

### Important components (how to reuse)

| Piece | Path | Reuse idea |
| --- | --- | --- |
| `ChatContainer` | `components/chat/chat-container.tsx` | Orchestrates upload + chat + prefs — copy as a “chat screen” shell |
| `ChatMessage` / `ChatInput` | `components/chat/` | Message bubbles + composer for any assistant UI |
| `PDFUpload` | `components/chat/pdf-upload.tsx` | Drag/drop file UX |
| `ModelSelector` | `components/chat/model-selector.tsx` | Fetches `GET /models`, falls back to `AI_MODELS` |
| UI primitives | `components/ui/` | Buttons, glass cards, dialogs — design-system starters |
| `api.ts` | `lib/api.ts` | Central `fetch` + `streamQuestion` + session header |
| `storage.ts` | `lib/storage.ts` | localStorage prefs + IndexedDB sessions |

**State model note:** this project does **not** use React Query or Redis. Live UI updates via React state; persistence is device-local. `/chat` uses `useChat` / `usePDFUpload` hooks.

---

## Core features and how they work

### 1) PDF upload and indexing

User uploads a PDF → `POST /upload` → backend extracts text, chunks (`CHUNK_SIZE` / `CHUNK_OVERLAP`), embeds, writes FAISS under `faiss_index/sessions/<session-id>/`.

---

### 2) Chat: streaming or JSON

- **Streaming on** → `POST /ask/stream` (SSE events: status / token / done / error).  
- **Streaming off** → `POST /ask` (single JSON answer).  
- Stop mid-stream aborts the fetch; a generation counter ignores stale callbacks.

---

### 3) Source snippets

Toggle “include sources” → backend may return page/snippet metadata so learners can see grounding context.

---

### 4) Multi-model + failover

Frontend sends a preferred `model` id. Backend walks configured providers (`PROVIDER_PRIORITY` in `config.py`) and models until one succeeds (rate limits, outages, deprecations).

Free-tier guidance: [`docs/LLM_MODEL_SELECTION.md`](docs/LLM_MODEL_SELECTION.md).

---

### 5) Anonymous sessions + local history

- Browser UUID → header `X-Chat-Session-Id`.  
- Vector indexes isolated per session on the server.  
- Chat transcripts saved in **IndexedDB** (device-local — clearing site data resets history).

---

### 6) Rate limits + cleanup

- Per-IP rolling windows for upload / ask (env-tunable).  
- On startup, prune FAISS session dirs older than `FAISS_SESSION_MAX_AGE_DAYS`.

---

### 7) Observability (optional)

- Frontend Sentry only if `VITE_SENTRY_DSN` is set (never hardcode a DSN in source).  
- Localhost / `development` events are dropped in client code.  
- Envelopes can tunnel via `POST /api/oversight` to reduce ad-block drops.

---

## API reference

> Data routes that touch FAISS expect header: `X-Chat-Session-Id: <uuid>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic status |
| `GET` | `/health` | Healthcheck (Coolify / Docker) |
| `GET` | `/models` | Model catalog for the selector |
| `GET` | `/pipeline-info` | Human-readable agent pipeline stages |
| `GET` | `/status` | Whether this session has a PDF loaded |
| `GET` | `/runtime-summary` | Provider readiness / counters for status UI |
| `POST` | `/upload` | Upload PDF and build index |
| `POST` | `/ask` | Question → JSON answer |
| `POST` | `/ask/stream` | Question → SSE stream |
| `POST` | `/api/oversight` | Sentry tunnel |

Interactive docs when the API is running: `http://127.0.0.1:8000/docs`

### Example: ask (JSON)

```bash
curl -X POST "http://127.0.0.1:8000/ask" \
  -H "Content-Type: application/json" \
  -H "X-Chat-Session-Id: 11111111-2222-4333-8444-555555555555" \
  -d '{"question":"Summarize this PDF","model":"openai/gpt-oss-20b:free","include_sources":true}'
```

### Example: SSE mental model

```text
event: status
data: {"message":"Retrieving..."}

event: token
data: {"content":"Hello"}

event: done
data: {"answer":"Hello world","model_used":"openai/gpt-oss-20b:free"}
```

---

## Environment variables (`.env`) explained

### Do you need a `.env` to open the UI?

- **Frontend alone:** you can open the Vite app without a `.env` for layout browsing.  
- **Real chat:** the **backend** needs at least one LLM provider key (recommended: OpenRouter).  
- **Embeddings:** cloud keys help; if all cloud embeddings fail, the backend can fall back to local `sentence-transformers` (CPU, no key — slower first download).

Never commit real `.env` files. Copy from the examples only.

---

### Backend — `backend/.env`

```bash
cd backend
cp .env.example .env
```

#### Minimum for real answers

```env
OPENROUTER_API_KEY=sk-or-v1-your_key_here
OPENROUTER_API_BASE=https://openrouter.ai/api/v1
```

Get a key: [https://openrouter.ai/keys](https://openrouter.ai/keys)

#### Recommended defaults (already in `.env.example`)

```env
DEFAULT_MODEL=openai/gpt-oss-20b:free
DEFAULT_PROVIDER=openrouter
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

If `DEFAULT_MODEL` / `DEFAULT_PROVIDER` are **omitted**, code defaults in `backend/app/config.py` still apply (`openai/gpt-oss-20b:free` + `openrouter`). Coolify env vars **override** those defaults when set.

#### Common backend variables

| Variable | Required? | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes for primary path | Main LLM + embedding gateway |
| `OPENROUTER_API_BASE` | Recommended | OpenRouter base URL |
| `DEFAULT_MODEL` | Optional | Override default model id |
| `DEFAULT_PROVIDER` | Optional | Hint / default provider name |
| `CORS_ORIGINS` | Yes in production | Comma-separated frontend origins |
| `GROQ_API_KEY` | Optional | Groq failover |
| `GOOGLE_API_KEY` | Optional | Gemini failover |
| `HF_API_KEY` | Optional | Hugging Face router failover |
| `OPENAI_DIRECT_API_KEY` | Optional | Paid OpenAI last resort |
| `FAISS_PERSIST_DIR` | Optional | Index directory (default `faiss_index`) |
| `MAX_VECTOR_SESSIONS` | Optional | LRU session cap |
| `FAISS_SESSION_MAX_AGE_DAYS` | Optional | Startup cleanup age |
| `RATE_LIMIT_UPLOAD_PER_MINUTE` | Optional | Upload budget per IP |
| `RATE_LIMIT_ASK_PER_MINUTE` | Optional | Ask/stream budget per IP |
| `SENTRY_DSN` | Optional | Backend Sentry |
| `SENTRY_ENVIRONMENT` | Optional | e.g. `production` |
| `DEBUG` | Optional | Extra debug behavior |

Legacy aliases still work: `OPENAI_API_KEY` / `OPENAI_API_BASE` → OpenRouter fields.

---

### Frontend — `frontend/.env`

```bash
cd frontend
cp .env.example .env
```

#### Local (typical)

```env
VITE_API_BASE_URL=http://localhost:8000
```

If unset in **dev**, the app defaults API base to `http://localhost:8000`.

#### Production (Vercel)

| Variable | Required? | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | **Yes** | Public HTTPS API URL (no trailing slash) |
| `VITE_APP_ENV` | Recommended | e.g. `production` (Sentry environment label) |
| `VITE_SENTRY_DSN` | Optional | Browser Sentry — empty = Sentry **off** |
| `VITE_SENTRY_TRACES_RATE` | Optional | e.g. `0.2` |
| `VITE_FAISS_SESSION_MAX_AGE_DAYS` | Optional | Keep UI copy aligned with backend retention |
| `VITE_DEV_PROXY_TARGET` | Optional | When using Vite proxy + `VITE_API_BASE_URL=/api` |

Fork tip: use **your own** Sentry project DSN. Do not commit DSNs into source.

---

## How to run locally

### Prerequisites

- Python **3.11+**  
- Node.js **18+** (or current LTS)  
- At least one LLM API key (OpenRouter recommended)

---

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env → set OPENROUTER_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: `http://127.0.0.1:8000`  
- Swagger: `http://127.0.0.1:8000/docs`

---

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional if defaults are fine
npm run dev
```

App: `http://localhost:5173`

---

### 3) Learning walkthrough (first hour)

1. Open `/chat`.  
2. Upload a short PDF.  
3. Ask: “Summarize this document in 5 bullets.”  
4. Toggle **streaming** and **sources**.  
5. Change model in the selector; watch `/models` and Network.  
6. Refresh the page — history should restore from IndexedDB for that PDF name.  
7. Read `backend/app/agents/` to see pipeline stages.

---

## How to deploy (Vercel + Coolify VPS)

### Backend (Coolify)

- Dockerfile: `backend/Dockerfile`  
- Base directory: `/backend`  
- Expose port matching Coolify (`PORT=3000` is common in this project’s playbooks)  
- Set `CORS_ORIGINS` to your Vercel origin(s)  
- Set provider keys; set `DEFAULT_MODEL=openai/gpt-oss-20b:free` (or omit to use code default)  
- Persist `FAISS_PERSIST_DIR` on a volume  
- After env edits: **Redeploy** (Restart alone may not apply new env in Coolify)

Deeper guides: [`docs/DOCKER_VPS_BACKEND_PLAYBOOK.md`](docs/DOCKER_VPS_BACKEND_PLAYBOOK.md), [`docs/COOLIFY_PUBLIC_BACKEND_GUIDE.md`](docs/COOLIFY_PUBLIC_BACKEND_GUIDE.md).

---

### Frontend (Vercel)

- Root Directory: `frontend`  
- Framework: Vite  
- Build: `npm run build`  
- Output: `dist`  
- Install: `npm install --legacy-peer-deps` (if peer conflicts)  
- Env: `VITE_API_BASE_URL=https://your-backend-domain`  
- Recommended: `VITE_APP_ENV=production`

Guardrails: [`docs/VERCEL_PRODUCTION_GUARDRAILS.md`](docs/VERCEL_PRODUCTION_GUARDRAILS.md).

---

## How to reuse this project in your own apps

### Reuse UI

1. Copy `frontend/src/components/ui` + `lib/utils.ts` (`cn` helper).  
2. Drop in `ChatInput` / `ChatMessage` / `PDFUpload`.  
3. Point `lib/api.ts` at your API base and session header convention.

### Reuse backend patterns

1. Keep **route modules** (`routes/`) separate from **services** and **agents**.  
2. Copy `config.py`’s `AI_PROVIDERS` + `Settings` pattern for env-driven failover.  
3. Reuse IP rate limiting for expensive endpoints.  
4. Reuse session-header isolation when you need multi-tenant demos without auth.

### Reuse the RAG idea elsewhere

```text
PDF → chunks → embeddings → vector store → retrieve(k) → prompt(LLM) → answer
```

Swap FAISS for Pinecone/pgvector later; keep the same pipeline stages.

---

## Quality checks and scripts

### Root

```bash
npm run check          # frontend typecheck+lint + backend script
npm run build          # frontend production build
npm run build:all      # check then build
```

### Frontend

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

### Backend

```bash
# from repo root
npm run check:backend
# or manually:
cd backend
pip install -r requirements.txt -r requirements-dev.txt
bash ../scripts/check-backend.sh
```

Included test: `backend/tests/test_chat_stream_sse.py` (SSE token + done flow with fakes).

---

## Troubleshooting notes

| Symptom | Likely fix |
| --- | --- |
| CORS errors in browser | Add Vercel origin to `CORS_ORIGINS`, redeploy backend |
| Chat works locally, fails on Vercel | Set `VITE_API_BASE_URL` to HTTPS API; redeploy frontend |
| No model / empty answers | Invalid or missing provider key; check Coolify env |
| Wrong PDF answers after refresh | Session header changed or FAISS session pruned |
| Old default model in production | Coolify still has `DEFAULT_MODEL=openai/gpt-4o-mini` — update + Redeploy |
| Sentry noise from localhost | Expected before harden; client now drops localhost/dev; use env-only DSN |
| `/wp-json/...` 404 in logs | Internet scanners — ignore |
| Coolify UI blocked | Update Hetzner firewall allowlist for your current public IP (ports 22 / 8000) |

---

## Related documentation

| Doc | Topic |
| --- | --- |
| [`docs/PROJECT_WALKTHROUGH.md`](docs/PROJECT_WALKTHROUGH.md) | Short agent/dev map |
| [`docs/LLM_MODEL_SELECTION.md`](docs/LLM_MODEL_SELECTION.md) | Free-tier providers + failover strategy |
| [`docs/DOCKER_VPS_BACKEND_PLAYBOOK.md`](docs/DOCKER_VPS_BACKEND_PLAYBOOK.md) | Docker / VPS ops |
| [`docs/VERCEL_PRODUCTION_GUARDRAILS.md`](docs/VERCEL_PRODUCTION_GUARDRAILS.md) | Frontend deploy tips |
| [`SECURITY.md`](SECURITY.md) | Vulnerability reporting |
| [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) | Agent workflow |

---

## Security

- Report vulnerabilities privately: **contact@arnobmahmud.com** (details in [SECURITY.md](SECURITY.md)).  
- Do not publish API keys, Coolify secrets, or real DSNs in issues/PRs.  
- This demo uses **anonymous** sessions — not enterprise auth. Treat public demos accordingly.

---

## Contributing

1. Fork the repository.  
2. Create a focused feature branch.  
3. Run `npm run check` (and backend checks) before opening a PR.  
4. Describe scope, risks, and how you tested.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
