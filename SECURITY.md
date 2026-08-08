# Security Policy

## Supported versions

This is an educational / demo open-source project. Security fixes are applied on a best-effort basis on the `main` branch.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report privately by email:

**contact@arnobmahmud.com**

Include:

- A short description of the issue
- Steps to reproduce (or a proof of concept if safe)
- Impact assessment if known
- Your preferred contact for follow-up

You should receive an acknowledgment when the report is reviewed. Please allow reasonable time for investigation before any public disclosure.

## Scope notes

- Browser Sentry DSNs are public client keys by design — still treat them as project-specific; forks should use their own DSN (`VITE_SENTRY_DSN`).
- Never commit real API keys, `.env` files, or production secrets.
- Anonymous session isolation is **not** a substitute for authenticated multi-tenant security.
