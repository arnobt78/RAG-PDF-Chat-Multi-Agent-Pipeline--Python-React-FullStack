/**
 * Runtime environment resolution for Vite (Coolify API + Vercel SPA).
 *
 * Set `VITE_API_BASE_URL` per environment:
 * - Local (direct to FastAPI): http://localhost:8000
 * - Local (via Vite proxy):    /api   → proxy strips prefix to backend
 * - Production:                https://api.your-coolify-domain.com  (no trailing slash)
 */

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * Public API base used by fetch(), Sentry tunnel, health checks.
 * Empty `VITE_API_BASE_URL` in dev → http://localhost:8000
 * Empty in production build → console error + localhost fallback (set Vercel env!)
 */
export function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (trimmed) {
    if (trimmed.startsWith("/")) {
      return trimTrailingSlashes(trimmed) || "/";
    }
    return trimTrailingSlashes(trimmed);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  if (import.meta.env.PROD) {
    console.error(
      "[rag-pdf-chat] VITE_API_BASE_URL is missing. Add it in Vercel → Settings → Environment Variables (your Coolify API URL).",
    );
  }

  return "http://localhost:8000";
}

/**
 * Sentry tunnel path: always hits backend route POST /api/oversight
 * - Absolute API base: https://api.example.com → https://api.example.com/api/oversight
 * - Relative dev base: /api → /api/oversight (Vite proxy forwards to backend)
 */
export function resolveSentryTunnelUrl(apiBaseUrl: string): string {
  const base = trimTrailingSlashes(apiBaseUrl);
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return `${base}/api/oversight`;
  }
  if (base.startsWith("/")) {
    return `${base}/oversight`;
  }
  return `${base}/api/oversight`;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const SENTRY_TUNNEL_URL = resolveSentryTunnelUrl(API_BASE_URL);
