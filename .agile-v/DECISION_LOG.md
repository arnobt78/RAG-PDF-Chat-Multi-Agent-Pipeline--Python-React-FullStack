# DECISION_LOG.md — append-only

| Timestamp | ID | Agent | Decision | Rationale | Linked |
|-----------|-----|-------|----------|-----------|--------|
| 2026-08-08 | DEC-0001 | orchestrator | Bootstrap Agile V Cycle **C1** (no prior `.agile-v/`) | Protocol: create memory when missing; code is SoT | AGILE_V_PROTOCOL §1 |
| 2026-08-08 | DEC-0002 | orchestrator | Treat app as **Vite SPA** for rendering guidance; do not force Next.js SSR patterns | Codebase has no RSC/Next; CLAUDE SSR bullets are generic | CLAUDE.md |
| 2026-08-08 | DEC-0003 | orchestrator | Recommend Wave 1 = Sentry secret/PII + doc truth before chat dedupe/tests | Security + agent confusion are highest verified risks | REQ-0008, REQ-0009, REQ-0011 |
| 2026-08-08 | DEC-0004 | orchestrator | No implementation code changes until GATE-0001 | Human Gate / user instruction | GATE-0001 |
| 2026-08-08 | DEC-0005 | orchestrator | Approved scope: free-model catalog + Sentry DSN/PII harden; leave HMR Sentry issues | User approved plan Models and Sentry harden | REQ-0008, REQ-0009, REQ-0013 |
| 2026-08-08 | DEC-0006 | build | Default model `openai/gpt-oss-20b:free`; Groq gpt-oss/Qwen; Gemini without Pro on free chain | Live OpenRouter API + Groq deprecation 2026-08-16 + Gemini Pro paid | REQ-0013 |
| 2026-08-08 | DEC-0007 | build | Env-only Sentry DSN; drop development/localhost events; mask replay | Hardcoded DSN leaked to forks | REQ-0008, REQ-0009 |
