/**
 * TypeScript Type Definitions
 * 
 * Central location for all shared types and interfaces used throughout the application.
 * This ensures type safety and provides clear contracts for data structures.
 */

// ============================================================================
// Chat & Message Types
// ============================================================================

/**
 * Represents a single chat message in the conversation history
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Represents a Q&A entry in the chat history
 */
export interface ChatEntry {
  question: string;
  answer: string;
  timestamp?: Date;
}

/**
 * Chat state for managing conversation
 */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// PDF & Document Types
// ============================================================================

/**
 * Represents an uploaded PDF document
 */
export interface PDFDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  chunksCreated?: number;
}

/**
 * PDF upload state
 */
export interface PDFUploadState {
  isUploading: boolean;
  isLoaded: boolean;
  document: PDFDocument | null;
  error: string | null;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Request body for asking questions
 */
export interface AskQuestionRequest {
  question: string;
  model?: string;
}

/**
 * Response from the /ask endpoint
 */
export interface AskQuestionResponse {
  answer: string;
  sources?: string[];
  model_used?: string;
}

/**
 * Response from the /upload endpoint
 */
export interface UploadResponse {
  message: string;
  chunks_created: number;
}

/**
 * Response from health/status endpoints
 */
export interface StatusResponse {
  status: string;
  message: string;
  pdf_loaded?: boolean;
}

/**
 * API error response
 */
export interface APIError {
  detail: string;
  status_code?: number;
}

// ============================================================================
// AI Model Types
// ============================================================================

/**
 * Supported AI model providers
 */
export type AIProvider = "openrouter" | "groq" | "gemini" | "openai" | "huggingface";

/**
 * AI model configuration
 */
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  maxTokens?: number;
  isDefault?: boolean;
}

/**
 * Available AI models for selection
 */
export const AI_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openrouter",
    description: "Fast and efficient for most tasks",
    isDefault: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openrouter",
    description: "Most capable model for complex tasks",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "openrouter",
    description: "Fast and cost-effective",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "openrouter",
    description: "Open source, high quality",
  },
];

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Button variant types for styling
 */
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

/**
 * Button size options
 */
export type ButtonSize = "default" | "sm" | "lg" | "icon";

/**
 * Badge variant types
 */
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

/**
 * Animation direction for scroll reveals
 */
export type AnimationDirection = "up" | "down" | "left" | "right" | "none";

/**
 * Props for scroll reveal animations
 */
export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
}

// ============================================================================
// Feature & Section Types
// ============================================================================

/**
 * Feature item for features section
 */
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Step item for how-it-works section
 */
export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Tech stack item
 */
export interface TechStackItem {
  name: string;
  icon: React.ReactNode;
  category: "frontend" | "backend" | "ai" | "database";
  description?: string;
}
