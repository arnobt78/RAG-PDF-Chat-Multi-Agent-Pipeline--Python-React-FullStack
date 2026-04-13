/**
 * useChat Hook
 *
 * Custom hook for managing chat state and operations.
 * Supports both standard JSON and SSE streaming responses.
 *
 * Usage:
 * const { chatHistory, isLoading, sendMessage, clearHistory } = useChat();
 */

import * as React from "react";
import { api, ApiError, streamQuestion } from "@/lib/api";
import type { ChatEntry } from "@/types";

interface ChatState {
  chatHistory: ChatEntry[];
  isLoading: boolean;
  error: string | null;
  /** Partially received answer while streaming */
  streamingAnswer: string | null;
}

interface UseChatReturn extends ChatState {
  sendMessage: (message: string, model?: string, includeSources?: boolean) => Promise<void>;
  sendMessageStreaming: (message: string, model?: string, includeSources?: boolean) => void;
  clearHistory: () => void;
  cancelStream: () => void;
  /** Replace the entire chat history (e.g. restore from IndexedDB) */
  setChatHistory: (entries: ChatEntry[]) => void;
}

const initialState: ChatState = {
  chatHistory: [],
  isLoading: false,
  error: null,
  streamingAnswer: null,
};

export function useChat(): UseChatReturn {
  const [state, setState] = React.useState<ChatState>(initialState);
  const abortRef = React.useRef<AbortController | null>(null);

  /** Standard JSON request */
  const sendMessage = React.useCallback(
    async (message: string, model?: string, includeSources?: boolean) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.askQuestion(message, model, includeSources);

        const newEntry: ChatEntry = {
          question: message,
          answer: response.answer,
          timestamp: new Date(),
          sources: response.sources,
          modelUsed: response.model_used,
        };

        setState((prev) => ({
          ...prev,
          chatHistory: [...prev.chatHistory, newEntry],
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.detail
            : "Failed to get response. Please try again.";

        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      }
    },
    [],
  );

  /** SSE streaming request */
  const sendMessageStreaming = React.useCallback(
    (message: string, model?: string, includeSources?: boolean) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        streamingAnswer: "",
      }));

      const questionRef = message;
      let accumulated = "";

      const controller = streamQuestion(
        { question: message, model, include_sources: includeSources },
        {
          onToken(text) {
            accumulated += text;
            setState((prev) => ({ ...prev, streamingAnswer: accumulated }));
          },
          onDone(meta) {
            const entry: ChatEntry = {
              question: questionRef,
              answer: accumulated,
              timestamp: new Date(),
              sources: meta.sources,
              modelUsed: meta.model_used,
            };
            setState((prev) => ({
              ...prev,
              chatHistory: [...prev.chatHistory, entry],
              isLoading: false,
              streamingAnswer: null,
            }));
          },
          onError(msg) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: msg,
              streamingAnswer: null,
            }));
          },
        },
      );

      abortRef.current = controller;
    },
    [],
  );

  const cancelStream = React.useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      streamingAnswer: null,
    }));
  }, []);

  const clearHistory = React.useCallback(() => {
    setState(initialState);
  }, []);

  const setChatHistory = React.useCallback((entries: ChatEntry[]) => {
    setState((prev) => ({ ...prev, chatHistory: entries }));
  }, []);

  return {
    ...state,
    sendMessage,
    sendMessageStreaming,
    clearHistory,
    cancelStream,
    setChatHistory,
  };
}
