/**
 * ChatContext
 * 
 * Global context for chat state management.
 * Provides centralized state for PDF upload and chat functionality
 * across the application.
 * 
 * Usage:
 * // In App.tsx
 * <ChatProvider>
 *   <YourApp />
 * </ChatProvider>
 * 
 * // In components
 * const { isLoaded, sendMessage } = useChatContext();
 */

import * as React from "react";
import { api, ApiError } from "@/lib/api";
import type { ChatEntry, PDFDocument } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface ChatContextState {
  // PDF state
  pdfDocument: PDFDocument | null;
  isUploading: boolean;
  isPdfLoaded: boolean;

  // Chat state
  chatHistory: ChatEntry[];
  isLoading: boolean;

  // Errors
  uploadError: string | null;
  chatError: string | null;

  // Selected model
  selectedModel: string;
}

interface ChatContextActions {
  uploadPDF: (file: File) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetPDF: () => void;
  setSelectedModel: (model: string) => void;
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
};

// ============================================================================
// Provider Component
// ============================================================================

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, setState] = React.useState<ChatContextState>(initialState);

  /**
   * Upload a PDF file
   */
  const uploadPDF = React.useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isUploading: true,
      uploadError: null,
    }));

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
        chatHistory: [], // Clear chat on new upload
        uploadError: null,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : "Failed to upload PDF";

      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadError: message,
      }));
    }
  }, []);

  /**
   * Send a chat message
   */
  const sendMessage = React.useCallback(async (message: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      chatError: null,
    }));

    try {
      const response = await api.askQuestion(message, state.selectedModel);

      const entry: ChatEntry = {
        question: message,
        answer: response.answer,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, entry],
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : "Failed to get response";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        chatError: message,
      }));
    }
  }, [state.selectedModel]);

  /**
   * Clear chat history
   */
  const clearChat = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      chatHistory: [],
      chatError: null,
    }));
  }, []);

  /**
   * Reset PDF state
   */
  const resetPDF = React.useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Set selected AI model
   */
  const setSelectedModel = React.useCallback((model: string) => {
    setState((prev) => ({
      ...prev,
      selectedModel: model,
    }));
  }, []);

  // Context value
  const value: ChatContextValue = {
    ...state,
    uploadPDF,
    sendMessage,
    clearChat,
    resetPDF,
    setSelectedModel,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access chat context
 * 
 * @throws Error if used outside ChatProvider
 */
export function useChatContext(): ChatContextValue {
  const context = React.useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }

  return context;
}
