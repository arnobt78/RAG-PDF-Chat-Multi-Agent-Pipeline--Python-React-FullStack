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
/** Aligned with `backend/app/config.py` `AI_PROVIDERS` model IDs */
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
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "openrouter",
    description: "Strong reasoning and long context",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Open source, high quality",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "openrouter",
    description: "Google Gemini via OpenRouter",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq)",
    provider: "groq",
    description: "Ultra-fast inference via Groq LPU",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B (Groq)",
    provider: "groq",
    description: "Instant responses, great for simple Q&A",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B (Groq)",
    provider: "groq",
    description: "Mixture-of-experts, strong generalist",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (direct)",
    provider: "openai",
    description: "Direct OpenAI API",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (direct)",
    provider: "openai",
    description: "Direct OpenAI API",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo (direct)",
    provider: "openai",
    description: "Direct OpenAI API",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Best price-performance, low latency",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "gemini",
    description: "Fastest and most budget-friendly 2.5",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    description: "Highest quality Gemini 2.5",
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
