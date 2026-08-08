/**
 * TypeScript Type Definitions
 *
 * Central location for all shared types and interfaces used throughout the application.
 * This ensures type safety and provides clear contracts for data structures.
 */

// ============================================================================
// Chat & Message Types
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatEntry {
  /** Stable id for React keys and session export; optional on legacy IndexedDB rows */
  id?: string;
  question: string;
  answer: string;
  timestamp?: Date;
  sources?: string[];
  modelUsed?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// PDF & Document Types
// ============================================================================

export interface PDFDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  chunksCreated?: number;
}

export interface PDFUploadState {
  isUploading: boolean;
  isLoaded: boolean;
  document: PDFDocument | null;
  error: string | null;
}

// ============================================================================
// API Types
// ============================================================================

export interface AskQuestionRequest {
  question: string;
  model?: string;
  include_sources?: boolean;
}

export interface AskQuestionResponse {
  answer: string;
  sources?: string[];
  model_used?: string;
  processing_time?: number;
}

export interface UploadResponse {
  message: string;
  chunks_created: number;
}

export interface StatusResponse {
  status: string;
  message: string;
  pdf_loaded?: boolean;
}

export interface RuntimeProviderRow {
  id: string;
  display_name: string;
  llm_ready: boolean;
  embedding_ready: boolean;
  status: string;
}

export interface RuntimeSummary {
  status: string;
  providers: number;
  working: number;
  app_version: string;
  default_model: string;
  providers_detail: RuntimeProviderRow[];
  pipeline_agents?: number;
  embedding_chain_steps?: number;
  llm_providers_ready?: number;
  rate_limit_upload_per_minute?: number;
  rate_limit_ask_per_minute?: number;
  max_vector_sessions?: number;
  faiss_session_max_age_days?: number;
  total_pdf_uploads?: number;
  total_chat_completions?: number;
}

export interface APIError {
  detail: string;
  status_code?: number;
}

// ============================================================================
// AI Model Types
// ============================================================================

export type AIProvider =
  | "openrouter"
  | "groq"
  | "gemini"
  | "openai"
  | "huggingface";

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  maxTokens?: number;
  isDefault?: boolean;
}

/**
 * Static model catalogue used as a client-side fallback before the backend
 * /models endpoint responds.  The ModelSelector also fetches live models.
 */
/** Aligned with `backend/app/config.py` `AI_PROVIDERS` model IDs (free-tier first, 2026-08-08). */
export const AI_MODELS: AIModel[] = [
  {
    id: "openrouter/free",
    name: "OpenRouter Free Router",
    provider: "openrouter",
    description: "Auto-picks an available :free model",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B (free)",
    provider: "openrouter",
    description: "Default free OpenRouter model for RAG chat",
    isDefault: true,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B (free)",
    provider: "openrouter",
    description: "Google Gemma 4 via OpenRouter free tier",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B (free)",
    provider: "openrouter",
    description: "Efficient NVIDIA free model",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super 120B (free)",
    provider: "openrouter",
    description: "Larger NVIDIA free model",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B (Groq)",
    provider: "groq",
    description: "Fast Groq LPU — primary Groq fallback",
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B (Groq)",
    provider: "groq",
    description: "Faster Groq gpt-oss for simple Q&A",
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 27B (Groq)",
    provider: "groq",
    description: "Groq Qwen replacement for deprecated Llama IDs",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (direct)",
    provider: "openai",
    description: "Direct OpenAI API (paid optional)",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (direct)",
    provider: "openai",
    description: "Direct OpenAI API (paid optional)",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo (direct)",
    provider: "openai",
    description: "Direct OpenAI API (paid optional)",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Free-tier Flash — best price-performance",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "gemini",
    description: "Free-tier Flash-Lite — fastest Gemini",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash (latest)",
    provider: "gemini",
    description: "Rolling latest Flash",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    description: "Stable 2.0 generation",
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.3",
    name: "Mistral 7B (HF)",
    provider: "huggingface",
    description: "Open-weight Mistral via HuggingFace",
  },
  {
    id: "HuggingFaceH4/zephyr-7b-beta",
    name: "Zephyr 7B (HF)",
    provider: "huggingface",
    description: "HuggingFace fine-tuned assistant",
  },
  {
    id: "meta-llama/Meta-Llama-3-8B-Instruct",
    name: "Llama 3 8B Instruct (HF)",
    provider: "huggingface",
    description: "Meta Llama 3 via HuggingFace router",
  },
];

// ============================================================================
// UI Component Types
// ============================================================================

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

export type AnimationDirection = "up" | "down" | "left" | "right" | "none";

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

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface TechStackItem {
  name: string;
  icon: React.ReactNode;
  category: "frontend" | "backend" | "ai" | "database";
  description?: string;
}
