/**
 * usePDFUpload Hook
 * 
 * Custom hook for managing PDF upload state and operations.
 * Handles file upload, progress tracking, and error states.
 * 
 * Usage:
 * const { isUploading, isLoaded, uploadPDF, reset } = usePDFUpload();
 */

import * as React from "react";
import { api, ApiError } from "@/lib/api";

interface PDFUploadState {
  isUploading: boolean;
  isLoaded: boolean;
  fileName: string | null;
  chunksCreated: number | null;
  error: string | null;
}

interface UsePDFUploadReturn extends PDFUploadState {
  uploadPDF: (file: File) => Promise<void>;
  reset: () => void;
}

const initialState: PDFUploadState = {
  isUploading: false,
  isLoaded: false,
  fileName: null,
  chunksCreated: null,
  error: null,
};

/**
 * Hook for PDF upload functionality
 * 
 * @returns Upload state and methods
 */
export function usePDFUpload(): UsePDFUploadReturn {
  const [state, setState] = React.useState<PDFUploadState>(initialState);

  /**
   * Upload a PDF file to the backend
   */
  const uploadPDF = React.useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isUploading: true,
      error: null,
    }));

    try {
      const response = await api.uploadPDF(file);

      setState({
        isUploading: false,
        isLoaded: true,
        fileName: file.name,
        chunksCreated: response.chunks_created,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : "Failed to upload PDF. Please try again.";

      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: message,
      }));
    }
  }, []);

  /**
   * Reset upload state
   */
  const reset = React.useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    uploadPDF,
    reset,
  };
}
