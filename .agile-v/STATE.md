# STATE.md

**Cycle:** C1 | **Updated:** 2026-08-08  
**Status:** Models + Sentry harden **done**; checks PASS; ready to commit/deploy.  
**Gate:** GATE-0001 scoped approved. GATE-0002 N/A.

## Done

- REQ-0008/0009: env-only Sentry DSN, drop localhost/dev, PII/replay tight  
- REQ-0013: free catalogs (OpenRouter `:free`, Groq gpt-oss/Qwen, Gemini Flash); default `openai/gpt-oss-20b:free`  
- Docs: LLM_MODEL_SELECTION, PROJECT_WALKTHROUGH, CLAUDE compact  
- Validate: `check:frontend`, `build`, `check:backend` PASS

## Ops (human)

- Coolify: `DEFAULT_MODEL=openai/gpt-oss-20b:free` then Redeploy  
- Vercel: already has `VITE_APP_ENV=production` + DSN — redeploy FE after git push  
- Sentry DSN rotate: optional for demo  
- Spot-check prod `/about` `/chat`; archive HMR issues if clean

## Deferred

REQ-0010 chat dedupe · REQ-0011 PROJECT_PLAN stale · REQ-0012 more tests

## Resume

```md
/agile-v-core
Load .agile-v/STATE.md. Next: deploy + optional deferred REQs after approval.
```
