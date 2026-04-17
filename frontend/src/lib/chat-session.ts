const STORAGE_KEY = "rag-pdf-chat-api-session-id";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True if the value is a syntactically valid UUID v4 (matches backend rules). */
export function isValidChatApiSessionId(value: string): boolean {
  return UUID_V4_RE.test(value.trim());
}

/**
 * Anonymous per-browser API session (no auth). Sent as X-Chat-Session-Id so
 * the backend keeps a separate FAISS index per visitor.
 */
function newSessionUuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  throw new Error("crypto.randomUUID is not available");
}

export function getChatApiSessionId(): string {
  if (typeof window === "undefined") {
    try {
      return newSessionUuid();
    } catch {
      return "";
    }
  }
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || !isValidChatApiSessionId(id)) {
      id = newSessionUuid();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    try {
      return newSessionUuid();
    } catch {
      return "";
    }
  }
}
