/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin (Coolify). Dev default: http://localhost:8000. Optional: /api for Vite proxy. */
  readonly VITE_API_BASE_URL: string;
  /** Where `npm run dev` proxies `/api/*` (default http://127.0.0.1:8000). */
  readonly VITE_DEV_PROXY_TARGET: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_TRACES_RATE: string;
  /** Overrides Sentry `environment` (e.g. production, preview). */
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
