# CLAUDE.md

## Project

**rag-pdf-chat** — Vite/React SPA + FastAPI/LangChain/FAISS RAG PDF chat. Anonymous sessions, SSE, multi-provider failover, IndexedDB history.

**Cycle:** C1 | **Gate:** GATE-0001 scoped done (models + Sentry) | **Resume:** `.agile-v/STATE.md`

## Stack

FE: React 18, TS, Vite 8, Tailwind, RR6, Framer, Sentry (env DSN)  
BE: Python 3.11+, FastAPI, LangChain, FAISS, sse-starlette  
Data: FAISS per `X-Chat-Session-Id`; IndexedDB/localStorage — no Redis/React Query/auth  
Deploy: Vercel FE + Coolify/Docker BE  
Validate: `npm run check` / `build`; `scripts/check-backend.sh`

## Defaults (2026-08-08)

- Default model: `openai/gpt-oss-20b:free` (`backend/app/config.py`, FE `AI_MODELS`)
- Sentry: `VITE_SENTRY_DSN` only; drop localhost/`development`; no hardcoded DSN
- Coolify: set `DEFAULT_MODEL` to free ID or omit (code default applies)

## Architecture

Keep existing folders/naming. Extend, don’t parallel. Map: `docs/PROJECT_WALKTHROUGH.md`  
SPA only — no Next/SSR unless approved. `/chat` uses `useChat`; `ChatProvider` duplicate = REQ-0010 deferred.

## Rules

TS strict · no secrets in git · no unrelated refactors · update only affected docs  
Memory: `.agile-v/` · Traceability: REQUIREMENTS / DECISION_LOG / STATE

## Workflow

Analyze → plan → wait approval → implement → validate → update STATE resume point.
