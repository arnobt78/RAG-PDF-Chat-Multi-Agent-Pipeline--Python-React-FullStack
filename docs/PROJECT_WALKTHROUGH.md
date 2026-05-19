# Project walkthrough (agent glance)

End-to-end map of **rag-pdf-chat** for reviews and safe edits.

## 1. User journey

1. Open SPA → anonymous `X-Chat-Session-Id` in `localStorage` ([`chat-session.ts`](frontend/src/lib/chat-session.ts)).
2. `/chat` → upload PDF → `POST /upload` → chunks embedded into session FAISS folder.
3. Ask question → `POST /ask` or `POST /ask/stream` (SSE).
4. UI shows user/assistant bubbles; history saved to IndexedDB per PDF name.
5. Preferences (model, streaming, sources) in `localStorage` via [`storage.ts`](frontend/src/lib/storage.ts).

## 2. Frontend layout

```text
frontend/src/
├── main.tsx              # Sentry init, React root
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
│   └── chat-context.tsx    # Global mirror of chat/upload (keep aligned with use-chat)
├── lib/
│   ├── api.ts              # fetch + streamQuestion (AbortController)
│   ├── chat-history.ts     # createChatEntry, getChatEntryReactKey
│   ├── storage.ts          # localStorage + IndexedDB sessions
│   └── sentry.ts, env.ts, constants.ts
└── types/index.ts          # ChatEntry, API types, AI_MODELS
```

## 3. Backend layout

```text
backend/app/
├── main.py           # CORS, routes, middleware
├── routes/           # health, upload, chat (ask + stream), oversight (Sentry tunnel)
├── services/         # vector store, rate limit, session cleanup
└── agents/           # retrieve → optimize → answer → validate
```

Session isolation: header `X-Chat-Session-Id` → separate FAISS directory per browser.

## 4. Chat state & “invalidation”

This project does **not** use React Query.

| Concern | Mechanism |
|---------|-----------|
| Live UI | `useChat` `setState` on send/stream/clear |
| Cross-tab / refresh | `loadChatSession` / `saveChatSession` (IndexedDB) |
| List of saved sessions | `listChatSessions()`; refreshed when `chatHistory` or `showSessions` changes |
| Restore session | `setChatHistory` in `handleRestoreSession` |

New messages get `ChatEntry.id` from `createChatEntry()`; UI keys via `getChatEntryReactKey()`.

## 5. Streaming implementation

- **Toggle:** `prefKeys.STREAMING_ENABLED` in localStorage.
- **While loading:** `streamingAnswer` string grows per SSE token; `TypingIndicator` renders partial text.
- **On complete:** `onDone` appends full `ChatEntry` to `chatHistory`, clears `streamingAnswer`, `isLoading=false`.
- **Stop:** `cancelStream()` aborts fetch + bumps `streamGenerationRef`.
- **New send while active:** prior stream aborted; stale callbacks ignored by generation id.

## 6. Recent fix: `/chat` DOM crash (Sentry)

**Symptom:** `NotFoundError: insertBefore` ~2s into second streamed reply (Chrome, production).

**Cause:** Framer Motion inside `<p>` updated every SSE token + branch swap dots ↔ text.

**Resolution (May 2026):** CSS-only `TypingIndicator`, stream abort/generation guards, stable React keys. Monitor Sentry issue `8d59c4e6` after deploy.

## 7. Verification checklist

```bash
npm run check && npm run build
```

Manual `/chat`:

- Upload PDF → stream answer → second question while streaming completes.
- Stop mid-stream → send again.
- Clear chat / restore IndexedDB session — no ErrorBoundary crash.

## 8. Related docs

- User-facing: [`README.md`](README.md)
- Deploy: `docs/VERCEL_PRODUCTION_GUARDRAILS.md`, `docs/DOCKER_VPS_BACKEND_PLAYBOOK.md`
- Agent rules: [`CLAUDE.md`](CLAUDE.md)
