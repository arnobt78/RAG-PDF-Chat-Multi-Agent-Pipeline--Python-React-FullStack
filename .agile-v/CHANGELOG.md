# CHANGELOG.md — Agile V project memory

## 2026-08-08 — C1 bootstrap

- Created `.agile-v/` Cycle C1 memory (STATE, REQUIREMENTS, TASKS, RISKS, decisions, gates).
- Updated `CLAUDE.md` from empty template to match repository reality.
- No application source changes.

## 2026-08-08 — Free models + Sentry harden

- Removed hardcoded Sentry DSN; drop localhost/development events; tighten PII/replay.
- OpenRouter/Groq/Gemini catalogs + default `openai/gpt-oss-20b:free`.
- Refreshed `docs/LLM_MODEL_SELECTION.md` verification date and rag-pdf-chat registry notes.
- Compact CLAUDE.md + PROJECT_WALKTHROUGH; commit/push when human ready.

## 2026-08-08 — Educational README + SECURITY

- Full teaching README (title/screenshots kept); Diploi + stack badges  
- `SECURITY.md` → contact@arnobmahmud.com  
- Pre-deploy audit: plan scope OK; no RQ/Redis/auth in this Vite app
