# CLAUDE.md

## Project

**rag-pdf-chat** — Vite/React SPA + FastAPI/LangChain/FAISS RAG PDF chat. Anonymous sessions, SSE, multi-provider failover, IndexedDB history.

**C1** | Models+Sentry+docs done | Resume: `.agile-v/STATE.md`

## Stack

FE: React 18, TS, Vite 8, Tailwind, RR6, Framer, Sentry (env DSN)  
BE: Python 3.11+, FastAPI, LangChain, FAISS  
Data: FAISS per session; IndexedDB — **no** Redis / React Query / auth / Zod SSR  
Deploy: Vercel + Coolify | Validate: `npm run check` / `build`

## Defaults

- Model: `openai/gpt-oss-20b:free`  
- Sentry: `VITE_SENTRY_DSN` only; drop localhost/dev  
- Docs: educational `README.md` + `SECURITY.md` (contact@arnobmahmud.com)

## Architecture

SPA only. Map: `docs/PROJECT_WALKTHROUGH.md`. `/chat` → `useChat`. REQ-0010 ChatProvider dedupe deferred.

## Rules

No secrets in git · extend existing patterns · update `.agile-v/STATE.md` on handoff.
