# TASKS.md — Prioritized plan (awaiting GATE-0001)

## Wave 1 — Security & truthfulness (recommended first)

| Task | REQ | Action | Primary files |
|------|-----|--------|---------------|
| TASK-0001 | REQ-0008 | Remove or neutralize hardcoded Sentry DSN fallback; document env-only / fork setup | `frontend/src/lib/sentry.ts`, `frontend/.env.example`, README env section |
| TASK-0002 | REQ-0009 | Tighten Sentry defaults (PII off by default; mask replay text; sane prod sample rates) | `frontend/src/lib/sentry.ts` |
| TASK-0003 | REQ-0011 | Reconcile `docs/PROJECT_PLAN.md` with shipped Sentry; fix/remove dead Redis guide link | `docs/PROJECT_PLAN.md` |

**Validation:** `npm run check:frontend` + `npm run build`; manual confirm Sentry no-ops without DSN.

## Wave 2 — Maintainability

| Task | REQ | Action | Primary files |
|------|-----|--------|---------------|
| TASK-0004 | REQ-0010 | Audit `useChatContext` consumers; collapse or thin `ChatProvider` so `/chat` has one I/O path | `chat-context.tsx`, `use-chat.ts`, `App.tsx`, chat components |
| TASK-0005 | REQ-0012 | Add backend tests for upload session isolation + ask error paths (unittest, no live LLM) | `backend/tests/*`, route/service seams |

**Validation:** `npm run check` (+ backend unittest via `scripts/check-backend.sh`).

## Wave 3 — Deferred product (only if explicitly approved)

| Task | Notes |
|------|-------|
| TASK-0006 | Auth / multi-tenant |
| TASK-0007 | Redis queue / server history |
| TASK-0008 | Playwright critical-path E2E |

---

## Out of scope until approved

- Unrelated UI restyling
- Provider/model catalog expansion (see `docs/LLM_MODEL_SELECTION.md` only if product asks)
- Infrastructure migrations beyond doc fixes
