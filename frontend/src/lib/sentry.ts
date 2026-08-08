/**
 * Sentry Error Tracking & Observability
 *
 * Initializes Sentry with:
 * - Error monitoring + browser tracing + session replay
 * - Tunnel through our own backend at /api/oversight to bypass
 *   browser extensions and ad-blockers that block sentry.io domains
 * - Drop of local / development noise so forks cannot spam a shared project
 *
 * Must be called **before** ReactDOM.createRoot().
 *
 * Set ``VITE_SENTRY_DSN`` in env (Vercel / local ``.env``). Empty DSN = Sentry off.
 * Never commit a real DSN into source — forks must use their own project key.
 */

import * as Sentry from "@sentry/react";
import { SENTRY_TUNNEL_URL } from "./env";

/** True when the event URL or current page is a local Vite/dev host. */
function isLocalHostUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url, "http://localhost");
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1"
    );
  } catch {
    return (
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      url.includes("[::1]")
    );
  }
}

/**
 * Drop localhost and ``environment: development`` events so local ``npm run dev``
 * (and forks that still point at a shared DSN) do not alert production owners.
 */
function shouldDropSentryEvent(
  event: Sentry.ErrorEvent | Sentry.Event,
  environment: string,
): boolean {
  if (environment === "development") return true;

  const requestUrl = event.request?.url;
  if (isLocalHostUrl(requestUrl)) return true;

  if (typeof window !== "undefined" && isLocalHostUrl(window.location.href)) {
    return true;
  }

  return false;
}

export function initSentry(): void {
  // Env-only DSN: no hardcoded fallback (prevents fork/clone leakage into our org).
  const dsn = (import.meta.env.VITE_SENTRY_DSN || "").trim();
  if (!dsn) return;

  const environment =
    import.meta.env.VITE_APP_ENV ||
    import.meta.env.MODE ||
    "development";

  // Prod default 0.2; higher in Vite DEV when a DSN is explicitly configured.
  const defaultTraces = import.meta.env.DEV ? "1.0" : "0.2";
  const tracesSampleRate = parseFloat(
    import.meta.env.VITE_SENTRY_TRACES_RATE || defaultTraces,
  );

  Sentry.init({
    dsn,

    // Route all Sentry envelopes through our backend tunnel so that
    // requests go to our own domain, not sentry.io directly.
    tunnel: SENTRY_TUNNEL_URL,

    sendDefaultPii: false,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate,
    tracePropagationTargets: [
      "localhost",
      /^https?:\/\/.*\.vercel\.app/,
      /^https?:\/\/.*$/,
    ],

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    enableLogs: true,

    environment,

    beforeSend(event) {
      if (shouldDropSentryEvent(event, environment)) return null;
      return event;
    },

    beforeSendTransaction(event) {
      if (shouldDropSentryEvent(event, environment)) return null;
      return event;
    },

    ignoreErrors: [
      "top.GLOBALS",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });
}

export { Sentry };
