/**
 * API Client Module
 *
 * Centralized API client for all backend communication.
 * Handles requests, responses, error handling, and SSE streaming.
 *
 * Walkthrough:
 *   1. ``withSessionHeaders`` injects ``X-Chat-Session-Id`` (see ``chat-session.ts``).
 *   2. JSON helpers use ``fetchWithErrorHandling``; streaming uses manual ``fetch`` + ReadableStream.
 *   3. ``api`` object groups REST calls used by hooks and components.
 */

import { API_BASE_URL, API_ENDPOINTS } from "./constants";
import { getChatApiSessionId, isValidChatApiSessionId } from "./chat-session";
import type {
  AskQuestionRequest,
  AskQuestionResponse,
  UploadResponse,
  StatusResponse,
  APIError,
  RuntimeSummary,
} from "@/types";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail || message;
  }
}

function withSessionHeaders(init?: RequestInit): RequestInit {
  const sid = getChatApiSessionId();
  if (!isValidChatApiSessionId(sid)) {
    throw new ApiError(
      "Chat session id is missing or invalid. Use a modern browser with Web Crypto enabled.",
      400,
      "missing_session_id",
    );
  }
  const merged: Record<string, string> = { "X-Chat-Session-Id": sid };
  const inHeaders = init?.headers;
  if (inHeaders instanceof Headers) {
    inHeaders.forEach((v, k) => {
      if (k.toLowerCase() !== "x-chat-session-id") merged[k] = v;
    });
  } else if (inHeaders && typeof inHeaders === "object") {
    for (const [k, v] of Object.entries(inHeaders as Record<string, string>)) {
      if (k.toLowerCase() !== "x-chat-session-id" && v !== undefined) {
        merged[k] = String(v);
      }
    }
  }
  return { ...init, headers: merged };
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(url, withSessionHeaders(options));

    if (!response.ok) {
      const errorData: APIError = await response.json().catch(() => ({
        detail: `HTTP error ${response.status}`,
      }));
      throw new ApiError(errorData.detail, response.status, errorData.detail);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Network error. Please check if the backend server is running.",
      0,
      "Connection failed",
    );
  }
}

// ---------------------------------------------------------------------------
// SSE streaming helpers
// ---------------------------------------------------------------------------

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onDone: (meta: {
    model_used?: string;
    processing_time?: number;
    sources?: string[];
  }) => void;
  onError: (message: string) => void;
  onStatus?: (stage: string, message: string) => void;
}

/**
 * Open an SSE connection to the streaming /ask endpoint and dispatch
 * incremental events to the supplied callbacks.
 *
 * Returns an AbortController so the caller can cancel the stream.
 */
export function streamQuestion(
  request: AskQuestionRequest,
  callbacks: StreamCallbacks,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ASK_STREAM}`,
        withSessionHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: controller.signal,
        }),
      );

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ detail: "Stream failed" }));
        callbacks.onError(err.detail ?? "Stream failed");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let eventName = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventName = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const raw = line.slice(6);
            try {
              const data = JSON.parse(raw);
              switch (eventName) {
                case "token":
                  callbacks.onToken(data.content ?? "");
                  break;
                case "done":
                  callbacks.onDone(data);
                  break;
                case "error":
                  callbacks.onError(data.message ?? "Unknown error");
                  break;
                case "status":
                  callbacks.onStatus?.(data.stage, data.message);
                  break;
              }
            } catch {
              /* skip malformed JSON */
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        callbacks.onError((err as Error).message ?? "Stream failed");
      }
    }
  })();

  return controller;
}

// ---------------------------------------------------------------------------
// REST API Client
// ---------------------------------------------------------------------------
// Grouped methods keep components free of raw URL strings and duplicate header logic.

export const api = {
  async checkHealth(): Promise<StatusResponse> {
    return fetchWithErrorHandling<StatusResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.HEALTH}`,
    );
  },

  async getStatus(): Promise<StatusResponse> {
    return fetchWithErrorHandling<StatusResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.STATUS}`,
    );
  },

  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return fetchWithErrorHandling<UploadResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.UPLOAD}`,
      {
        method: "POST",
        body: formData,
      },
    );
  },

  /**
   * Ask a question about the uploaded PDF (JSON response)
   */
  async askQuestion(
    question: string,
    model?: string,
    includeSources?: boolean,
  ): Promise<AskQuestionResponse> {
    const requestBody: AskQuestionRequest = { question };
    if (model) requestBody.model = model;
    if (includeSources) requestBody.include_sources = true;

    return fetchWithErrorHandling<AskQuestionResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.ASK}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );
  },
};

/** Public dashboard JSON — no ``X-Chat-Session-Id`` (not used by backend for this route). */
export async function fetchRuntimeSummary(
  options?: { signal?: AbortSignal },
): Promise<RuntimeSummary> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.RUNTIME_SUMMARY}`,
    { signal: options?.signal },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(text || `HTTP ${response.status}`, response.status);
  }
  return response.json() as Promise<RuntimeSummary>;
}

export default api;
