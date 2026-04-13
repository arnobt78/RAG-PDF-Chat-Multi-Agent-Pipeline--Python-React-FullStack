/**
 * useChat Hook
 * 
 * Custom hook for managing chat state and operations.
 * Handles message sending, history, and loading states.
 * 
 * Usage:
 * const { chatHistory, isLoading, sendMessage, clearHistory } = useChat();
 */

import * as React from "react";
import { api, ApiError } from "@/lib/api";
import type { ChatEntry } from "@/types";

interface ChatState {
  chatHistory: ChatEntry[];
  isLoading: boolean;
  error: string | null;
}

interface UseChatReturn extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
}

const initialState: ChatState = {
  chatHistory: [],
  isLoading: false,
  error: null,
};

/**
 * Hook for chat functionality
 * 
 * @returns Chat state and methods
 */
export function useChat(): UseChatReturn {
  const [state, setState] = React.useState<ChatState>(initialState);

  /**
   * Send a message and get AI response
   */
  const sendMessage = React.useCallback(async (message: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await api.askQuestion(message);

      const newEntry: ChatEntry = {
        question: message,
        answer: response.answer,
        timestamp: new Date(),
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

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Clear chat history
   */
  const clearHistory = React.useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    sendMessage,
    clearHistory,
  };
}
