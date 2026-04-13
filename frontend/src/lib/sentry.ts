/**
 * Sentry Error Tracking & Observability
 *
 * Initializes Sentry with:
 * - Error monitoring + browser tracing + session replay
 * - Tunnel through our own backend at /api/oversight to bypass
 *   browser extensions and ad-blockers that block sentry.io domains
 * - Log forwarding
 *
 * Must be called **before** ReactDOM.createRoot().
 */

import * as Sentry from "@sentry/react";
import { SENTRY_TUNNEL_URL } from "./env";

const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN ||
  "https://e7954adc927ca26a7b9c6af391c43e14@o4510346504699904.ingest.de.sentry.io/4511213060751440";

export function initSentry(): void {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,

    // Route all Sentry envelopes through our backend tunnel so that
    // requests go to our own domain, not sentry.io directly.
    // This prevents ad-blockers / privacy extensions from dropping events.
    tunnel: SENTRY_TUNNEL_URL,

    sendDefaultPii: true,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Tracing — capture 100 % in dev, lower in prod via env var
    tracesSampleRate: parseFloat(
      import.meta.env.VITE_SENTRY_TRACES_RATE || "1.0",
    ),
    tracePropagationTargets: [
      "localhost",
      /^https?:\/\/.*\.vercel\.app/,
      /^https?:\/\/.*$/,
    ],

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Logs
    enableLogs: true,

    environment:
      import.meta.env.VITE_APP_ENV ||
      import.meta.env.MODE ||
      "development",

    ignoreErrors: [
      "top.GLOBALS",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });
}

export { Sentry };
