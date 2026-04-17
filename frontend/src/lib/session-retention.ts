/**
 * User-facing copy for server-side vector index retention.
 * Set `VITE_FAISS_SESSION_MAX_AGE_DAYS` to match backend `FAISS_SESSION_MAX_AGE_DAYS`.
 */
const raw = import.meta.env.VITE_FAISS_SESSION_MAX_AGE_DAYS;
const parsed =
  typeof raw === "string" && raw.trim() !== ""
    ? Number.parseInt(raw, 10)
    : NaN;

export const SESSION_INDEX_RETENTION_DAYS =
  Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
