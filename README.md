# RAG PDF Chat - Python, React, Tailwind CSS, FastAPI, SSE Streaming, Multi-Agent Pipeline, Text Chunking, Conversion History, Device-Local Data, Anonymous Sessions FullStack Project (Contextual Document Assistant)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-8.0.9-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

A production-style, educational full-stack RAG project that demonstrates how to turn PDF documents into searchable knowledge and chat with them using modern AI models. It is designed for learners and builders who want to understand document chunking, embeddings, vector search, SSE streaming responses, multi-provider model fallback, and practical deployment (Vercel + Coolify VPS) end to end.

- **Frontend Live Demo:** [https://pdf-chat-scrapper.vercel.app/](https://pdf-chat-scrapper.vercel.app/)
- **Backend Live Demo:** [https://rag-pdf-backend.arnobmahmud.com/](https://rag-pdf-backend.arnobmahmud.com/)

---

## Table of contents

- [Project overview](#project-overview)
- [What you will learn](#what-you-will-learn)
- [Keywords and glossary (beginner-friendly)](#keywords-and-glossary-beginner-friendly)
- [Architecture walkthrough](#architecture-walkthrough)
- [Tech stack and dependencies](#tech-stack-and-dependencies)
- [Project structure and file walkthrough](#project-structure-and-file-walkthrough)
- [Core features and how they work](#core-features-and-how-they-work)
- [API reference](#api-reference)
- [Environment variables (`.env`) explained](#environment-variables-env-explained)
- [How to run locally](#how-to-run-locally)
- [How to deploy (Vercel + Coolify VPS)](#how-to-deploy-vercel--coolify-vps)
- [How to reuse this project in your own apps](#how-to-reuse-this-project-in-your-own-apps)
- [Quality checks and scripts](#quality-checks-and-scripts)
- [Troubleshooting notes](#troubleshooting-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Project overview

This app lets a user upload a PDF and ask questions about it. The backend parses PDF text, splits it into chunks, embeds each chunk into vectors, stores vectors in FAISS, retrieves relevant context for each question, then sends that context to an LLM for grounded responses.

It also includes:

- **Anonymous session isolation** (per browser via session header)
- **Streaming answers (SSE)** and non-streaming mode
- **Model selector with provider fallback**
- **Optional source snippets**
- **Rate limiting**
- **Device-local saved chat history in IndexedDB**
- **Deployment-ready Docker/Coolify setup**

---

## What you will learn

- How RAG (Retrieval Augmented Generation) works in a practical, production-like app.
- How to build a TypeScript React frontend that calls a FastAPI backend.
- How to wire PDF upload, chunking, embeddings, and vector search.
- How to stream model output token-by-token over SSE.
- How to maintain per-browser isolation without user authentication.
- How to deploy frontend and backend separately with correct CORS and environment config.

---

## Keywords and glossary (beginner-friendly)

| Term             | Meaning                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| **RAG**          | Retrieve relevant document context first, then generate answer with LLM.        |
| **Embedding**    | Numeric vector representation of text meaning.                                  |
| **FAISS**        | Fast vector database/index for similarity search.                               |
| **Chunking**     | Splitting long PDF text into smaller pieces for retrieval.                      |
| **SSE**          | Server-Sent Events for live streaming answer text.                              |
| **Session ID**   | Unique browser identifier used to isolate each user’s PDF vector index.         |
| **LRU eviction** | Removes least-recently-used session indexes when cap is reached.                |
| **CORS**         | Browser security rule controlling which frontend origins can call backend APIs. |

---

## Architecture walkthrough

```text
React SPA (frontend)
  ├─ localStorage: anonymous session UUID (X-Chat-Session-Id)
  ├─ IndexedDB: saved chat history by PDF
  └─ Calls FastAPI endpoints (/upload, /ask, /ask/stream, /status, /models)

FastAPI backend
  ├─ PDF loader + text splitter
  ├─ Embedding service + FAISS vector store
  ├─ Agent pipeline (retrieve -> optimize -> answer -> validate)
  ├─ Optional source snippets
  ├─ Rate limiting and session cleanup
  └─ Optional Sentry tunnel (/api/oversight)
```

---

## Tech stack and dependencies

### Frontend

- **React 18 + TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**
- **React Router**
- **Radix UI primitives**
- **Sonner toast notifications**
- **Sentry browser SDK (optional)**

### Backend

- **FastAPI + Uvicorn**
- **Pydantic + pydantic-settings**
- **LangChain ecosystem**
- **FAISS CPU**
- **sentence-transformers** (local embedding fallback)
- **httpx / aiohttp**
- **Tenacity retries**

### Why this stack is useful for learning

- It separates UI concerns from AI/backend concerns cleanly.
- It demonstrates real deployment constraints (CORS, env vars, reverse proxy).
- It includes robust failover behavior and operational safety defaults.

---

## Project structure and file walkthrough

```text
rag-pdf-chat/
├── README.md
├── docs/                            # deployment and operational guides
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx                # app bootstrap
│   │   ├── App.tsx                 # routes and app-level providers
│   │   ├── pages/                  # home, chat, about, api-status
│   │   ├── components/
│   │   │   ├── chat/               # chat container, model selector, upload, input
│   │   │   ├── layout/             # header/footer/layout helpers
│   │   │   ├── sections/           # marketing/documentation sections
│   │   │   └── ui/                 # reusable UI primitives
│   │   ├── hooks/                  # data and behavior hooks
│   │   ├── lib/                    # api/env/storage/session logic
│   │   └── types/                  # shared TS types
│   └── public/
└── backend/
    ├── app/
    │   ├── main.py                 # app setup and middleware
    │   ├── config.py               # settings/env/provider config
    │   ├── routes/                 # health, upload, chat, oversight
    │   ├── services/               # vector store, rate limiting, cleanup
    │   └── agents/                 # multi-step answer pipeline
    ├── requirements.txt
    ├── requirements-dev.txt
    ├── .env.example
    ├── Dockerfile
    └── .dockerignore
```

---

## Core features and how they work

### 1) PDF upload and indexing

User uploads a PDF through the frontend. Backend:

1. extracts text
2. chunks it
3. embeds each chunk
4. stores vectors in FAISS under session-specific folder

---

### 2) Chat with streaming or non-streaming

- **Streaming on** -> uses SSE (`/ask/stream`) for live token output.
- **Streaming off** -> classic JSON response (`/ask`).

---

### 3) Source snippets toggle

- When enabled, backend returns source context snippets (if available).
- Helps explain where the answer came from.

---

### 4) Multi-model and fallback behavior

- Frontend can select a preferred model.
- Backend tries configured providers and can fall back when a provider fails or is over quota.

---

### 5) Session isolation and local history

- Browser keeps anonymous session UUID.
- Backend uses `X-Chat-Session-Id` to separate vector indexes per browser.
- Frontend stores transcript locally in IndexedDB per PDF.

---

### 6) Rate limits and cleanup

- Per-IP request limits for upload and ask routes.
- Startup cleanup removes stale session FAISS folders.

---

## API reference

> Most data routes require `X-Chat-Session-Id` header.

| Method | Endpoint         | Purpose                           |
| ------ | ---------------- | --------------------------------- |
| `GET`  | `/`              | Basic backend status              |
| `GET`  | `/health`        | Health check                      |
| `GET`  | `/models`        | Available models/providers        |
| `GET`  | `/pipeline-info` | Explains pipeline stages          |
| `GET`  | `/status`        | Session PDF loaded status         |
| `POST` | `/upload`        | Upload PDF and build index        |
| `POST` | `/ask`           | Ask question (non-streaming JSON) |
| `POST` | `/ask/stream`    | Ask question (SSE streaming)      |
| `POST` | `/api/oversight` | Sentry tunnel endpoint            |

### Example request

```bash
curl -X POST "http://127.0.0.1:8000/ask" \
  -H "Content-Type: application/json" \
  -H "X-Chat-Session-Id: 11111111-2222-4333-8444-555555555555" \
  -d '{"question":"Summarize this PDF","model":"openai/gpt-4o-mini","include_sources":true}'
```

---

## Environment variables (`.env`) explained

This project **does need backend environment variables** for real AI usage.

### Backend (`backend/.env`)

Create from template:

```bash
cd backend
cp .env.example .env
```

#### Minimum required

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_API_BASE=https://openrouter.ai/api/v1
```

#### Commonly used variables

| Variable                       | Required           | Purpose                  |
| ------------------------------ | ------------------ | ------------------------ |
| `OPENROUTER_API_KEY`           | Yes                | Main provider key        |
| `OPENROUTER_API_BASE`          | Yes                | OpenRouter base URL      |
| `DEFAULT_MODEL`                | Recommended        | Default model ID         |
| `DEFAULT_PROVIDER`             | Recommended        | Provider selection hint  |
| `CORS_ORIGINS`                 | Yes for deployment | Allowed frontend origins |
| `FAISS_PERSIST_DIR`            | Recommended        | Vector index directory   |
| `MAX_VECTOR_SESSIONS`          | Recommended        | LRU session cap          |
| `FAISS_SESSION_MAX_AGE_DAYS`   | Recommended        | Startup stale cleanup    |
| `RATE_LIMIT_UPLOAD_PER_MINUTE` | Recommended        | Upload protection        |
| `RATE_LIMIT_ASK_PER_MINUTE`    | Recommended        | Ask/stream protection    |
| `SENTRY_DSN`                   | Optional           | Backend error reporting  |
| `SENTRY_ENVIRONMENT`           | Optional           | Sentry environment tag   |

#### Optional provider fallbacks

```env
GROQ_API_KEY=
OPENAI_DIRECT_API_KEY=
GOOGLE_API_KEY=
HF_API_KEY=
```

---

### Frontend (`frontend/.env`)

For local dev you can run with default assumptions, but recommended:

```bash
cd frontend
cp .env.example .env
```

Key variables:

| Variable                          | Required          | Purpose                    |
| --------------------------------- | ----------------- | -------------------------- |
| `VITE_API_BASE_URL`               | Yes in production | Backend public base URL    |
| `VITE_DEV_PROXY_TARGET`           | Optional          | Local Vite proxy target    |
| `VITE_FAISS_SESSION_MAX_AGE_DAYS` | Optional          | UI retention text parity   |
| `VITE_SENTRY_DSN`                 | Optional          | Browser Sentry             |
| `VITE_SENTRY_TRACES_RATE`         | Optional          | Perf tracing rate          |
| `VITE_APP_ENV`                    | Optional          | Env label (production/dev) |

---

## How to run locally

### 1) Start backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set OPENROUTER_API_KEY in .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend docs: `http://127.0.0.1:8000/docs`

---

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: `http://localhost:5173`

---

### 3) Learning walkthrough flow

1. Open chat page.
2. Upload sample PDF.
3. Ask summary question.
4. Toggle Sources and Stream.
5. Change model and compare behavior.
6. Inspect Network tab for `/upload`, `/ask`, `/ask/stream`.
7. Inspect backend logs to see retrieval/generation lifecycle.

---

## How to deploy (Vercel + Coolify VPS)

### Backend (Coolify)

- Use `backend/Dockerfile`
- Base Directory: `/backend`
- Dockerfile path: `/Dockerfile`
- Port expose: `3000`
- Set `PORT=3000`
- Set `CORS_ORIGINS` to your frontend domain(s)
- Configure domains and Traefik labels for:
  - sslip fallback host
  - production subdomain

### Frontend (Vercel)

- Root Directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install --legacy-peer-deps`
- Set `VITE_API_BASE_URL=https://your-backend-domain`

---

## How to reuse this project in your own apps

### Reuse frontend UI pieces

- Copy `frontend/src/components/ui` for reusable styled primitives.
- Copy `ChatInput`, `ChatMessage`, `PDFUpload` for chat/document UX.
- Keep shared utility `cn` from `frontend/src/lib/utils.ts`.

### Reuse backend architecture

- Start from `backend/app/routes` route separation.
- Reuse `config.py` settings pattern for env-driven deployments.
- Reuse rate-limit service for any expensive endpoint.
- Reuse session header approach for anonymous multi-user resource isolation.

### Reuse API client pattern

- `frontend/src/lib/api.ts` centralizes request and header handling.
- Adapt endpoint map and payload types for your own backend quickly.

---

## Quality checks and scripts

### Root scripts

```bash
npm run lint
npm run check
npm run build
npm run build:all
```

### Frontend scripts

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
npm audit
```

### Backend checks

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
ruff check app
mypy app
```

---

## Troubleshooting notes

- **CORS blocked in browser** -> ensure deployed frontend origin is present in `CORS_ORIGINS`, then redeploy backend.
- **Vercel npm peer conflict** -> use install command with `--legacy-peer-deps`.
- **No model response** -> verify at least one provider key is valid.
- **Wrong/empty retrieval** -> re-upload PDF and check session header consistency.
- **Frequent 404 probes in logs** -> expected on public servers due to internet scanners.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Keep changes focused and run checks before PR.
4. Open a PR with short summary, scope, and risk notes.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
