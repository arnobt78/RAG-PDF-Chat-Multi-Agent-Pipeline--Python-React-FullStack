# Agent guide — rag-pdf-chat

Quick orientation for AI agents reviewing or changing this repo.

## Stack

| Layer | Tech | State / data |
|-------|------|----------------|
| Frontend | React 18, TS, Vite, Tailwind, Framer Motion (not on SSE hot path) | `useState`, `localStorage`, **IndexedDB** |
| Backend | FastAPI, FAISS, LangChain agents | Per-session FAISS on disk; no user DB |
| Deploy | Vercel (SPA), Coolify VPS (API) | CORS + `X-Chat-Session-Id` |

**No TanStack React Query** — chat updates propagate via React state + `useEffect` persistence to IndexedDB (`saveChatSession` on `chatHistory` change). Do not add query invalidation patterns unless the project adopts a query client.

## Chat data flow (`/chat`)

```
ChatContainer → useChat() → streamQuestion() / api.askQuestion()
                ↓
         chatHistory + streamingAnswer
                ↓
    IndexedDB (storage.ts) on chatHistory change
```

- **Active path:** [`use-chat.ts`](frontend/src/hooks/use-chat.ts) + [`chat-container.tsx`](frontend/src/components/chat/chat-container.tsx).
- **Parallel path:** [`chat-context.tsx`](frontend/src/context/chat-context.tsx) (`ChatProvider` in `App.tsx`) — keep in sync with `useChat` when changing stream/entry logic.

## Shared chat helpers

[`frontend/src/lib/chat-history.ts`](frontend/src/lib/chat-history.ts):

- `createChatEntry()` — assigns `id` + `timestamp` for new turns.
- `getChatEntryReactKey()` — stable React keys; legacy IndexedDB rows without `id` use index+timestamp fallback.

[`ChatEntry`](frontend/src/types/index.ts) has optional `id?: string`.

## SSE / streaming safeguards (Sentry insertBefore fix)

Production issue: `NotFoundError: insertBefore` during rapid SSE updates on `/chat`.

| Area | Fix |
|------|-----|
| [`TypingIndicator`](frontend/src/components/chat/chat-message.tsx) | CSS-only dots/cursor; single stable `<p>`; **no Framer Motion** on streaming subtree |
| [`use-chat.ts`](frontend/src/hooks/use-chat.ts) | Abort prior stream; `streamGenerationRef` ignores stale callbacks; abort on clear/cancel |
| [`chat-context.tsx`](frontend/src/context/chat-context.tsx) | Same abort + generation pattern |
| [`chat-container.tsx`](frontend/src/components/chat/chat-container.tsx) | `getChatEntryReactKey`; `key="streaming-indicator"`; `handleSend` blocks when `isLoading` |

## Quality commands

```bash
npm run check      # frontend typecheck + eslint + backend ruff/mypy/tests
npm run build      # frontend production build
npm run lint       # frontend + backend lint only
```

## Conventions

- Minimize scope; match existing patterns in touched files.
- Comments: explain non-obvious behavior (SSE, session, persistence), not obvious code.
- Do not commit `.env` or secrets.
- Sentry: [`frontend/src/lib/sentry.ts`](frontend/src/lib/sentry.ts) — tunnel via backend; do not `ignoreErrors` for DOM reconciliation bugs without fixing root cause.

## Key paths

- API client: `frontend/src/lib/api.ts`
- Session header: `frontend/src/lib/chat-session.ts`
- Preferences + IndexedDB: `frontend/src/lib/storage.ts`
- Backend entry: `backend/app/main.py`
- Ops docs: `docs/`

See also [`PROJECT_WALKTHROUGH.md`](PROJECT_WALKTHROUGH.md).
