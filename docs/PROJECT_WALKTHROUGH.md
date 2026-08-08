# Project walkthrough (agent glance)

End-to-end map of **rag-pdf-chat** for reviews and safe edits.

## 1. User journey

1. Open SPA → anonymous `X-Chat-Session-Id` in `localStorage` ([`chat-session.ts`](frontend/src/lib/chat-session.ts)).
2. `/chat` → upload PDF → `POST /upload` → chunks embedded into session FAISS folder.
3. Ask question → `POST /ask` or `POST /ask/stream` (SSE). Default model: `openai/gpt-oss-20b:free`.
4. UI shows user/assistant bubbles; history saved to IndexedDB per PDF name.
5. Preferences (model, streaming, sources) in `localStorage` via [`storage.ts`](frontend/src/lib/storage.ts).

## 2. Frontend layout

```text
frontend/src/
├── main.tsx              # Sentry init (env DSN only), React root
├── App.tsx               # Router, ChatProvider, Sentry ErrorBoundary
├── pages/
│   ├── chat.tsx          # ChatContainer only
│   ├── home.tsx, about.tsx, api-status.tsx
├── components/chat/
│   ├── chat-container.tsx  # Orchestrator: upload, history, stream toggle
│   ├── chat-message.tsx    # Bubbles + TypingIndicator (CSS streaming UI)
│   ├── chat-input.tsx
│   └── pdf-upload.tsx, model-selector.tsx
├── hooks/
│   ├── use-chat.ts         # Primary chat state for /chat
│   └── use-pdf-upload.ts
├── context/
│   └── chat-context.tsx    # Parallel chat/upload path (REQ-0010: dedupe later)
├── lib/
│   ├── api.ts              # fetch + streamQuestion (AbortController)
│   ├── chat-history.ts     # createChatEntry, getChatEntryReactKey
│   ├── storage.ts          # localStorage + IndexedDB sessions
│   └── sentry.ts, env.ts, constants.ts
└── types/index.ts          # ChatEntry, API types, AI_MODELS (free-tier first)
```

## 3. Backend layout

```text
backend/app/
├── main.py           # CORS, routes, middleware
├── config.py         # AI_PROVIDERS free-tier catalogs + default_model
├── routes/           # health, upload, chat (ask + stream), oversight (Sentry tunnel)
├── services/         # vector store, rate limit, session cleanup
└── agents/           # retrieve → optimize → answer → validate
```

Session isolation: header `X-Chat-Session-Id` → separate FAISS directory per browser.

## 4. Chat state & “invalidation”

This project does **not** use React Query / Redis / Zod SSR.

| Concern | Mechanism |
|---------|-----------|
| Live UI | `useChat` `setState` on send/stream/clear |
| Cross-tab / refresh | `loadChatSession` / `saveChatSession` (IndexedDB) |
| List of saved sessions | `listChatSessions()`; refreshed when `chatHistory` or `showSessions` changes |
| Restore session | `setChatHistory` in `handleRestoreSession` |
| Stale model pref | Unknown IDs → `openai/gpt-oss-20b:free` |

## 5. Streaming

- Toggle: `prefKeys.STREAMING_ENABLED`. Partial text via `streamingAnswer` + CSS `TypingIndicator`.
- Complete → append `ChatEntry`, clear stream. Stop / new send → abort + generation guard.

## 6. Sentry (FE)

- DSN: `VITE_SENTRY_DSN` only (empty = off). Tunnel: `POST /api/oversight`.
- Drops `environment=development` and localhost. PII off; replay masked.
- Prior HMR-only `AboutPage` / Header hooks noise on `127.0.0.1` — not production blockers.

## 7. Recent fix: `/chat` DOM crash

**Resolution (May 2026):** CSS-only `TypingIndicator`, stream abort/generation guards, stable keys. Monitor Sentry `8d59c4e6` after deploy.

## 8. Verification

```bash
npm run check && npm run build
```

Manual `/chat`: upload → stream → second Q; stop mid-stream; restore session.

## 9. Related docs

- [`README.md`](../README.md) · [`SECURITY.md`](../SECURITY.md) · [`LLM_MODEL_SELECTION.md`](LLM_MODEL_SELECTION.md) · deploy playbooks · [`CLAUDE.md`](../CLAUDE.md) · `.agile-v/STATE.md`
