/**
 * Application Constants
 *
 * Centralized configuration values used throughout the application.
 * Modify these values to customize the application behavior.
 *
 * ``API_ENDPOINTS`` must stay in sync with FastAPI routes under ``backend/app/routes/``.
 */

/**
 * API base URL — from VITE_API_BASE_URL (see `src/lib/env.ts`)
 */
export { API_BASE_URL } from "./env";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  HEALTH: "/",
  STATUS: "/status",
  UPLOAD: "/upload",
  ASK: "/ask",
  ASK_STREAM: "/ask/stream",
  MODELS: "/models",
} as const;

/**
 * Application Metadata
 */
export const APP_CONFIG = {
  name: "RAG PDF Chat",
  description:
    "Chat with your PDF documents using AI-powered Retrieval Augmented Generation",
  author: "Arnob Mahmud",
  version: "1.0.0",
  github: "https://github.com/arnobt78",
} as const;

/**
 * Animation Durations (in seconds)
 */
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 0.8,
} as const;

/**
 * Animation Delays for staggered effects (in seconds)
 */
export const ANIMATION_DELAY = {
  none: 0,
  short: 0.1,
  medium: 0.2,
  long: 0.3,
} as const;

/**
 * Breakpoints matching Tailwind defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Maximum file size for PDF uploads (in bytes)
 * Default: 50MB
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Supported file types for upload
 */
export const SUPPORTED_FILE_TYPES = {
  pdf: ["application/pdf", ".pdf"],
} as const;

/**
 * Navigation Links
 */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
] as const;

/**
 * Social Links
 */
export const SOCIAL_LINKS = {
  github: "https://github.com/arnobt78",
  repository:
    "https://github.com/arnobt78/RAG-PDF-Chat-Multi-Agent-Pipeline--Python-React-FullStack",
  linkedin: "https://www.linkedin.com/in/arnob-mahmud-05839655",
  twitter: "https://x.com/arnob_t78",
} as const;

/**
 * Feature list for home page
 */
export const FEATURES = [
  {
    title: "PDF Analysis",
    description:
      "Upload any PDF document and let AI understand its content through advanced text extraction and chunking.",
  },
  {
    title: "Smart Retrieval",
    description:
      "Using FAISS vector store and embeddings, we find the most relevant sections for your questions.",
  },
  {
    title: "AI-Powered Answers",
    description:
      "Get accurate answers powered by state-of-the-art language models through OpenRouter API.",
  },
  {
    title: "Multi-Model Support",
    description:
      "Choose from 10+ AI models across OpenRouter, Groq, Gemini, HuggingFace, and direct OpenAI.",
  },
  {
    title: "7-Agent Pipeline",
    description:
      "Production-grade multi-agent architecture: Extractor, Analyzer, Preprocessor, Optimizer, Synthesizer, Validator, and Assembler.",
  },
  {
    title: "Real-time Streaming",
    description:
      "Watch answers appear token-by-token via Server-Sent Events with a blinking cursor animation.",
  },
  {
    title: "5-Provider Failover",
    description:
      "Automatic ordered failover across OpenRouter, Groq, Gemini, HuggingFace, and OpenAI.",
  },
  {
    title: "Source Citations",
    description:
      "Toggle source display to see exactly which PDF pages contributed to each answer.",
  },
  {
    title: "FAISS Persistence",
    description:
      "Vector index saved to disk automatically — restart the server without re-uploading PDFs.",
  },
  {
    title: "Docker Deployable",
    description:
      "Production Dockerfile with non-root user, health checks, and Vercel-ready frontend configuration.",
  },
] as const;

/**
 * How it works steps
 */
export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Upload Your PDF",
    description:
      "Simply drag and drop or select a PDF file. Our system processes it in seconds.",
  },
  {
    step: 2,
    title: "AI Processes Content",
    description:
      "The document is split into chunks, converted to embeddings, and stored in a vector database.",
  },
  {
    step: 3,
    title: "Ask Questions",
    description:
      "Type your questions and get accurate answers based on the document content.",
  },
] as const;

/**
 * Tech stack items
 */
export const TECH_STACK = [
  { name: "React", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Framer Motion", category: "frontend" },
  { name: "FastAPI", category: "backend" },
  { name: "LangChain", category: "ai" },
  { name: "FAISS", category: "database" },
  { name: "OpenRouter", category: "ai" },
] as const;
