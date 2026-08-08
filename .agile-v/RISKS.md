# RISKS.md — Cycle C1

| ID | Risk | Severity | Likelihood | Mitigation (proposed) | Linked |
|----|------|----------|------------|----------------------|--------|
| RISK-0001 | Hardcoded browser Sentry DSN in committed source | High | Certain | Env-only DSN; no inline fallback (or demo-only behind explicit flag) | REQ-0008 |
| RISK-0002 | Aggressive Sentry privacy settings (`sendDefaultPii`, unmasked replay) may capture PDF Q&A content | High | High | Default PII off; mask replay; document opt-in | REQ-0009 |
| RISK-0003 | Dual chat implementations can diverge (stream cancel, keys, persistence) | Medium | Medium | Single path for `/chat`; delete or wrap the unused one | REQ-0010 |
| RISK-0004 | Thin automated tests → regressions in upload/session/rate-limit | Medium | Medium | Expand unittest seams before larger refactors | REQ-0012 |
| RISK-0005 | Stale PROJECT_PLAN misleads agents (claims Sentry unfinished; dead doc link) | Low | Certain | Doc reconcile Wave 1 | REQ-0011 |
| RISK-0006 | Multi-worker FAISS session race without sticky sessions | Medium | Low–Med | Already documented in `.env.example`; keep ops constraint | REQ-0004 |
| RISK-0007 | Anonymous + rate-limit-by-IP is shared-office fragile | Low | Med | Documented; auth deferred | deferred |

No CAPA opened this session (planning only).
