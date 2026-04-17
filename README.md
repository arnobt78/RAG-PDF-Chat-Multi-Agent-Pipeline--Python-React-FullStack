# RAG PDF Chat - Python, React, Tailwind CSS, FastAPI, SSE Streaming, Multi-Agent Pipeline, Text Chunking, Conversion History, Device-Local Data, Anonymous Sessions FullStack Project (Contextual Document Assistant)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

A **full-stack Retrieval Augmented Generation (RAG)** demo you can run locally or deploy to a VPS: upload a PDF, build a **per-browser vector index** (FAISS), and chat with an **LLM** using retrieved context. The UI is a **React + TypeScript** single-page app; the API is **FastAPI + LangChain** with a **multi-agent pipeline**, optional **Sentry** tunneling, and sensible **production defaults** (CORS, rate limits, session disk cleanup). Use it to learn how RAG, embeddings, and vector stores fit together end to end.

---

## Table of contents

- [What you will learn](#what-you-will-learn)
- [Keywords & glossary](#keywords--glossary)
- [Architecture at a glance](#architecture-at-a-glance)
- [Tech stack & libraries](#tech-stack--libraries)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [How to run (local)](#how-to-run-local)
- [API reference](#api-reference)
- [How the RAG pipeline works](#how-the-rag-pipeline-works)
- [Frontend features & components](#frontend-features--components)
- [Reusing parts in other projects](#reusing-parts-in-other-projects)
- [Docker & VPS notes](#docker--vps-notes)
- [Scripts (quality checks)](#scripts-quality-checks)
- [Contributing](#contributing)

---

## What you will learn

- How **PDF text** is chunked, embedded, and stored in **FAISS** for similarity search.
- How a **question** triggers **retrieval** then **LLM generation** with optional **source citations**.
- How **anonymous sessions** work via `X-Chat-Session-Id` (no login) while keeping indexes separate.
- How to configure **OpenRouter** and optional providers (**Groq**, **Gemini**, **Hugging Face**, **OpenAI**).
- How a **Vite** frontend talks to a **FastAPI** backend, including **SSE streaming** for answers.

---

## Keywords & glossary

| Keyword        | Short meaning                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RAG**        | Retrieval Augmented Generation: retrieve relevant text from your document, then ask the LLM to answer using that context.                          |
| **Embedding**  | A numeric vector representing text meaning; similar texts have similar vectors.                                                                    |
| **FAISS**      | Facebook AI Similarity Search: fast vector index for “nearest neighbor” search over embeddings.                                                    |
| **Chunk**      | A slice of the PDF (e.g. ~1000 characters) used as one retrieval unit.                                                                             |
| **LangChain**  | Python framework that composes loaders, splitters, chains, and vector stores.                                                                      |
| **OpenRouter** | One API key to access many models (OpenAI-compatible HTTP).                                                                                        |
| **SSE**        | Server-Sent Events: one HTTP response stream; used here for streamed answer tokens.                                                                |
| **Session id** | UUID sent as `X-Chat-Session-Id` so each browser gets its own FAISS folder on disk.                                                                |
| **LRU**        | Least Recently Used eviction: when too many sessions exist in memory, older ones are dropped from the registry (and disk removed for evicted ids). |

---

## Architecture at a glance

```text
Browser (React)
  │  localStorage: API session UUID
  │  IndexedDB: chat history (per PDF / session UI)
  │
  ├─► GET /status, POST /upload, POST /ask, POST /ask/stream
  │       Header: X-Chat-Session-Id: <uuid v4>
  │
  ▼
FastAPI (app.main)
  ├─ Health: /, /health, /models, /pipeline-info
  ├─ Upload: PDF → chunks → embeddings → FAISS (per session path)
  ├─ Chat: Agent pipeline → LLM → JSON or SSE stream
  └─ Optional: POST /api/oversight (Sentry tunnel)
```

---

## Tech stack & libraries

### Frontend

| Technology        | Role                                           |
| ----------------- | ---------------------------------------------- |
| **React 18**      | UI and state.                                  |
| **TypeScript**    | Types for API payloads and components.         |
| **Vite**          | Dev server, HMR, production bundling.          |
| **Tailwind CSS**  | Utility-first styling; glass-style UI.         |
| **Framer Motion** | Declarative animations.                        |
| **React Router**  | Routes: home, chat, about.                     |
| **Radix UI**      | Accessible primitives (e.g. alert dialog).     |
| **Lucide React**  | Icons.                                         |
| **Sonner**        | Toasts.                                        |
| **Sentry React**  | Optional error reporting (tunnel via backend). |

### Backend

| Technology                       | Role                                                     |
| -------------------------------- | -------------------------------------------------------- |
| **FastAPI**                      | HTTP API, dependency injection, OpenAPI docs at `/docs`. |
| **Uvicorn**                      | ASGI server.                                             |
| **Pydantic / pydantic-settings** | Request/response models and `.env` loading.              |
| **LangChain**                    | PDF loading, splitting, embeddings, FAISS integration.   |
| **FAISS (CPU)**                  | Vector index.                                            |
| **sentence-transformers**        | Local CPU embeddings fallback when cloud keys fail.      |
| **httpx**                        | HTTP client (e.g. Sentry tunnel forward).                |

---

## Project structure

```text
rag-pdf-chat/
├── README.md                 # This file
├── docs/                     # Extra planning / notes (optional reading)
│
├── frontend/                 # Vite + React SPA
│   ├── .env.example          # VITE_* variables documented
│   ├── src/
│   │   ├── App.tsx           # Root layout, routes, error boundary
│   │   ├── main.tsx          # React entry + Sentry init
│   │   ├── pages/            # home, chat, about
│   │   ├── components/
│   │   │   ├── chat/         # Chat UI: container, messages, upload, model selector
│   │   │   ├── layout/       # Header, footer, page wrapper
│   │   │   ├── sections/     # Marketing / explainer sections on home & about
│   │   │   └── ui/           # Buttons, cards, dialogs, inputs (reusable)
│   │   ├── hooks/            # useChat, usePDFUpload, useHealth, etc.
│   │   ├── lib/              # api.ts, env.ts, storage (IndexedDB), chat-session, Sentry helpers
│   │   ├── context/          # React context (e.g. chat-related providers)
│   │   └── types/            # Shared TS types
│   ├── vite.config.ts        # Aliases @/*, dev proxy /api → backend
│   └── vercel.json           # SPA rewrites for Vercel
│
└── backend/                  # FastAPI application (use `app.main:app`)
    ├── Dockerfile            # Production-oriented image (non-root, healthcheck)
    ├── .dockerignore
    ├── .env.example          # Full list of backend env vars (copy to .env)
    ├── requirements.txt      # Runtime Python deps
    ├── requirements-dev.txt  # ruff, mypy (optional)
    └── app/
        ├── main.py           # App factory, CORS, lifespan, routers
        ├── config.py         # Settings, providers, embedding chain
        ├── models/           # Pydantic schemas
        ├── routes/           # health, upload, chat, tunnel
        ├── services/         # PDF, vector store, LLM, rate limit, session registry, cleanup
        └── agents/           # Multi-step RAG pipeline (Extractor … Assembler)
```

---

## Prerequisites

- **Node.js** 18+ (for `npm` / Vite).
- **Python** 3.11+ (3.12 works; Dockerfile uses 3.12-slim).
- At least one **LLM/embedding-capable** API key — **OpenRouter** is the recommended default (`OPENROUTER_API_KEY`).

---

## Environment variables

You **do** need a backend `.env` for real AI calls. The frontend can run with **defaults** in development (see `frontend/src/lib/env.ts`), but production builds should set `VITE_API_BASE_URL`.

### Backend — required for a working demo

1. Copy the template:

```bash
cd backend
cp .env.example .env
```

1. **Minimum** to process PDFs and chat (OpenRouter):

```env
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

`backend/.env.example` documents everything else: optional **Groq**, **Gemini**, **HF**, **OpenAI direct**, **CORS**, **FAISS paths**, **session retention**, **rate limits**, **Sentry**, etc. Values you will often tune for production:

| Variable                     | Purpose                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `CORS_ORIGINS`               | Comma-separated browser origins allowed to call the API.                  |
| `FAISS_PERSIST_DIR`          | Root folder for indexes (default `faiss_index`).                          |
| `MAX_VECTOR_SESSIONS`        | Max in-memory LRU sessions before evicting oldest.                        |
| `FAISS_SESSION_MAX_AGE_DAYS` | On startup, delete on-disk session folders older than N days (`0` = off). |
| `RATE_LIMIT_*`               | Per-IP rolling limits for `/upload` and `/ask` (+ stream).                |

### Frontend — optional but recommended for deployment

```bash
cd frontend
cp .env.example .env
```

| Variable                                      | Purpose                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`                           | Backend URL (`http://localhost:8000`) or same-origin `/api` with Vite proxy. |
| `VITE_DEV_PROXY_TARGET`                       | Where `/api` proxies in dev (default `http://127.0.0.1:8000`).               |
| `VITE_FAISS_SESSION_MAX_AGE_DAYS`             | Should match backend copy for UI retention text (defaults to `3` if unset).  |
| `VITE_SENTRY_DSN` / `VITE_SENTRY_TRACES_RATE` | Optional browser error reporting.                                            |

Example **local** frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Example **same-origin dev** (Vite proxies `/api` to FastAPI):

```env
VITE_API_BASE_URL=/api
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8000
```

---

## How to run (local)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then edit .env — set OPENROUTER_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive docs: **<http://127.0.0.1:8000/docs>**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: **<http://localhost:5173>**

### 3. Typical learner flow

1. Open the **Chat** page.
2. **Upload** a PDF (only `.pdf`; size limit enforced server-side).
3. Wait until status shows the document is ready.
4. Pick a **model** (if `/models` returns live options).
5. Ask a question — try **non-streaming** vs **streaming** toggles.
6. Open **/docs** on the backend to see the same routes the UI uses.

---

## API reference

All JSON/upload/stream routes below expect header **`X-Chat-Session-Id`** with a **UUID v4** (the frontend generates and stores one in `localStorage`). Omitting it returns **400**.

| Method | Path             | Auth header         | Description                                                                   |
| ------ | ---------------- | ------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/`              | —                   | Simple API status.                                                            |
| `GET`  | `/health`        | —                   | Health + default model hint.                                                  |
| `GET`  | `/models`        | —                   | Lists models from configured providers.                                       |
| `GET`  | `/pipeline-info` | —                   | JSON describing the 7 pipeline stages (educational).                          |
| `GET`  | `/status`        | `X-Chat-Session-Id` | Whether this session’s vector index has a loaded PDF.                         |
| `POST` | `/upload`        | `X-Chat-Session-Id` | Multipart file field `file`: PDF bytes → chunks → FAISS for that session.     |
| `POST` | `/ask`           | `X-Chat-Session-Id` | JSON body: question, optional `model`, `include_sources`.                     |
| `POST` | `/ask/stream`    | `X-Chat-Session-Id` | Same body; returns **SSE** (`text/event-stream`) with token chunks.           |
| `POST` | `/api/oversight` | —                   | Sentry envelope tunnel (restricted hosts); used when browser DSN points here. |

**Example** (curl) — replace `SESSION` with a fresh UUID v4:

```bash
export API=http://127.0.0.1:8000
export SESSION=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx

curl -sS -H "X-Chat-Session-Id: $SESSION" "$API/status" | jq .

curl -sS -H "X-Chat-Session-Id: $SESSION" -F "file=@./sample.pdf" "$API/upload" | jq .

curl -sS -H "X-Chat-Session-Id: $SESSION" -H "Content-Type: application/json" \
  -d '{"question":"What is this document about?","model":"openai/gpt-4o-mini","include_sources":false}' \
  "$API/ask" | jq .
```

---

## How the RAG pipeline works

High-level flow:

1. **Upload** — `PyPDFLoader` reads the PDF → `RecursiveCharacterTextSplitter` creates chunks → embeddings run via configured providers (with local **MiniLM** fallback) → vectors stored in **FAISS** under `faiss_index/sessions/<session_id>/`.
2. **Ask** — `AgentPipeline` runs staged agents (see `GET /pipeline-info` for full text):

```text
Extractor → Analyzer → Preprocessor → Optimizer → Synthesizer → Validator → Assembler
```

- **Extractor**: similarity search in FAISS (`RETRIEVAL_K` chunks).
- **Analyzer / Preprocessor / Optimizer**: clean, dedupe, trim context to budget.
- **Synthesizer**: calls the LLM via `LLMService` (multi-provider failover).
- **Validator / Assembler**: quality checks and structured response (e.g. sources).

Read the Python modules under `backend/app/agents/` for implementation details — each file is small and focused, which is ideal for learning.

---

## Frontend features & components

| Area                            | What it does                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| **`ChatContainer`**             | Orchestrates upload, messages, streaming, model selection, session sidebar, local-data banner. |
| **`PDFUpload`**                 | Drag-and-drop + file picker; talks to `usePDFUpload` → `/upload`.                              |
| **`ChatMessage` / `ChatInput`** | Renders Q&A; input supports send + keyboard UX.                                                |
| **`ModelSelector`**             | Fetches `/models` once; falls back to static list.                                             |
| **`lib/api.ts`**                | Adds `X-Chat-Session-Id`, handles errors, implements SSE client for `/ask/stream`.             |
| **`lib/storage.ts`**            | IndexedDB persistence for chat sessions (device-local).                                        |
| **`lib/chat-session.ts`**       | Stable UUID for the anonymous API session.                                                     |

---

## Reusing parts in other projects

- **UI primitives** (`frontend/src/components/ui/`): copy `button`, `glass-card`, `input`, `textarea`, `alert-dialog` patterns into any React + Tailwind app; keep `cn()` from `lib/utils.ts`.
- **`lib/api.ts` pattern**: centralize `fetch`, headers, and error mapping — swap `API_BASE_URL` and routes for your API.
- **FastAPI routers** (`backend/app/routes/`): each router is a template for splitting `GET`/`POST` concerns; `Depends()` injects services cleanly.
- **Rate limiter** (`backend/app/services/ip_rate_limit.py`): sliding-window per IP — reusable for other expensive routes.
- **Session vector registry**: pattern for “anonymous multi-tenant” resource handles without accounts.

---

## Docker & VPS notes

```bash
cd backend
docker build -t rag-pdf-chat-api .
docker run -p 8000:8000 --env-file .env rag-pdf-chat-api
```

- Image runs as **non-root**; writable dirs include **`faiss_index/`** and **`.cache/`** for model downloads.
- Mount a **volume** on `faiss_index` if you want indexes to survive container restarts.
- Set **`CORS_ORIGINS`** to your real frontend origin(s).
- Prefer **one worker per replica** or **sticky sessions** if you scale horizontally (shared FAISS on disk + in-memory LRU per process).

---

## Scripts (quality checks)

**Frontend** (`frontend/`):

```bash
npm run lint
npm run typecheck
npm run build
```

**Backend** (`backend/` — with dev deps):

```bash
pip install -r requirements.txt -r requirements-dev.txt
ruff check app
mypy app
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes; run **lint**, **typecheck**, and **build** (frontend) and **ruff** / **mypy** (backend) when possible.
4. Open a pull request with a short description of behavior and risk.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
