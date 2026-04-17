/**
 * ChatContext
 *
 * Global context for chat state management.
 * Provides centralized state for PDF upload and chat functionality
 * across the application.  Now supports streaming and include_sources.
 *
 * Usage:
 * <ChatProvider>
 *   <YourApp />
 * </ChatProvider>
 *
 * const { isLoaded, sendMessage } = useChatContext();
 */

import * as React from "react";
import { api, ApiError, streamQuestion } from "@/lib/api";
import type { ChatEntry, PDFDocument } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface ChatContextState {
  pdfDocument: PDFDocument | null;
  isUploading: boolean;
  isPdfLoaded: boolean;
  chatHistory: ChatEntry[];
  isLoading: boolean;
  uploadError: string | null;
  chatError: string | null;
  selectedModel: string;
  includeSources: boolean;
  streamingEnabled: boolean;
  streamingAnswer: string | null;
}

interface ChatContextActions {
  uploadPDF: (file: File) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetPDF: () => void;
  setSelectedModel: (model: string) => void;
  setIncludeSources: (v: boolean) => void;
  setStreamingEnabled: (v: boolean) => void;
  cancelStream: () => void;
}

type ChatContextValue = ChatContextState & ChatContextActions;

// ============================================================================
// Context
// ============================================================================

const ChatContext = React.createContext<ChatContextValue | null>(null);

// ============================================================================
// Initial State
// ============================================================================

const initialState: ChatContextState = {
  pdfDocument: null,
  isUploading: false,
  isPdfLoaded: false,
  chatHistory: [],
  isLoading: false,
  uploadError: null,
  chatError: null,
  selectedModel: "openai/gpt-4o-mini",
  includeSources: false,
  streamingEnabled: true,
  streamingAnswer: null,
};

// ============================================================================
// Provider Component
// ============================================================================

interface ChatProviderProps {
  children: React.ReactNode;
}

/** Global provider: exposes upload + chat + streaming via ``useChatContext`` (optional for pages outside the new chat hooks). */
export function ChatProvider({ children }: ChatProviderProps) {
  const [state, setState] = React.useState<ChatContextState>(initialState);
  const abortRef = React.useRef<AbortController | null>(null);

  const uploadPDF = React.useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isUploading: true, uploadError: null }));

    try {
      const response = await api.uploadPDF(file);

      const document: PDFDocument = {
        id: `pdf-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        chunksCreated: response.chunks_created,
      };

      setState((prev) => ({
        ...prev,
        pdfDocument: document,
        isUploading: false,
        isPdfLoaded: true,
        chatHistory: [],
        uploadError: null,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.detail : "Failed to upload PDF";

      setState((prev) => ({ ...prev, isUploading: false, uploadError: message }));
    }
  }, []);

  /** Send a chat message – chooses streaming or standard based on toggle */
  const sendMessage = React.useCallback(
    async (message: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        chatError: null,
        streamingAnswer: state.streamingEnabled ? "" : null,
      }));

      if (state.streamingEnabled) {
        let accumulated = "";

        const controller = streamQuestion(
          {
            question: message,
            model: state.selectedModel,
            include_sources: state.includeSources,
          },
          {
            onToken(text) {
              accumulated += text;
              setState((prev) => ({ ...prev, streamingAnswer: accumulated }));
            },
            onDone(meta) {
              const entry: ChatEntry = {
                question: message,
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
                chatError: msg,
                streamingAnswer: null,
              }));
            },
          },
        );
        abortRef.current = controller;
      } else {
        try {
          const response = await api.askQuestion(
            message,
            state.selectedModel,
            state.includeSources,
          );

          const entry: ChatEntry = {
            question: message,
            answer: response.answer,
            timestamp: new Date(),
            sources: response.sources,
            modelUsed: response.model_used,
          };

          setState((prev) => ({
            ...prev,
            chatHistory: [...prev.chatHistory, entry],
            isLoading: false,
          }));
        } catch (error) {
          const msg =
            error instanceof ApiError ? error.detail : "Failed to get response";
          setState((prev) => ({ ...prev, isLoading: false, chatError: msg }));
        }
      }
    },
    [state.selectedModel, state.includeSources, state.streamingEnabled],
  );

  const cancelStream = React.useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isLoading: false,
      streamingAnswer: null,
    }));
  }, []);

  const clearChat = React.useCallback(() => {
    setState((prev) => ({ ...prev, chatHistory: [], chatError: null }));
  }, []);

  const resetPDF = React.useCallback(() => {
    setState(initialState);
  }, []);

  const setSelectedModel = React.useCallback((model: string) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  const setIncludeSources = React.useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, includeSources: v }));
  }, []);

  const setStreamingEnabled = React.useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, streamingEnabled: v }));
  }, []);

  const value: ChatContextValue = {
    ...state,
    uploadPDF,
    sendMessage,
    clearChat,
    resetPDF,
    setSelectedModel,
    setIncludeSources,
    setStreamingEnabled,
    cancelStream,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useChatContext(): ChatContextValue {
  const context = React.useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }

  return context;
}
