/**
 * PDFUpload Component
 *
 * Drag-and-drop PDF upload component with:
 * - File validation
 * - Upload progress indication
 * - Error handling
 * - Visual feedback for drag state
 *
 * Usage:
 * <PDFUpload onUpload={handleUpload} isUploading={false} />
 *
 * Client validates size/type before calling ``onUpload`` — server re-validates (never trust the browser alone).
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  File,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, isValidPDF, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { MAX_FILE_SIZE } from "@/lib/constants";

const PIPELINE_STEPS = [
  {
    id: 1,
    label: "Ingest & validate PDF",
    detail: "Verify MIME, size, and readability",
  },
  { id: 2, label: "Extract text", detail: "Pull text layer from each page" },
  {
    id: 3,
    label: "Semantic chunking",
    detail: "Split into overlapping segments",
  },
  {
    id: 4,
    label: "Embedding pass",
    detail: "Vectorize chunks for similarity search",
  },
  {
    id: 5,
    label: "Vector index",
    detail: "Update FAISS / store for retrieval",
  },
  { id: 6, label: "Session metadata", detail: "Wire document id and counters" },
  {
    id: 7,
    label: "Handoff to chat",
    detail: "RAG pipeline ready for questions",
  },
] as const;

export interface PDFUploadProps {
  /** Callback when file is selected */
  onUpload: (file: File) => Promise<void>;
  /** Currently uploading state */
  isUploading: boolean;
  /** Whether a PDF is already loaded */
  isLoaded: boolean;
  /** Currently loaded file name */
  fileName?: string;
  /** Number of chunks created */
  chunksCreated?: number;
  /** Error message to display */
  error?: string | null;
  /** Reset the upload state */
  onReset?: () => void;
  /** Whether the full drag-drop area is expanded (upload idle state only) */
  isExpanded?: boolean;
  /** Toggle expand/collapse of the full upload area */
  onToggleExpand?: () => void;
}

export function PDFUpload({
  onUpload,
  isUploading,
  isLoaded,
  fileName,
  chunksCreated,
  error,
  onReset,
  isExpanded = true,
  onToggleExpand,
}: PDFUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const [completedSteps, setCompletedSteps] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isUploading) {
      setCompletedSteps(0);
      return;
    }
    setCompletedSteps(0);
    const stepMs = 420;
    // Simulated step ticker is UX-only; backend does actual pipeline work independently.
    const interval = window.setInterval(() => {
      setCompletedSteps((c) => (c >= PIPELINE_STEPS.length ? c : c + 1));
    }, stepMs);
    return () => window.clearInterval(interval);
  }, [isUploading]);

  // Handle file validation and upload
  const handleFile = async (file: File) => {
    setValidationError(null);

    // Validate file type
    if (!isValidPDF(file)) {
      setValidationError("Please upload a PDF file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(
        `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
      );
      return;
    }

    await onUpload(file);
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input to allow re-uploading same file
    e.target.value = "";
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload PDF file"
      />

      <AnimatePresence mode="wait">
        {/* Success State - PDF Loaded */}
        {isLoaded && !isUploading ? (
          <motion.div
            key="loaded"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.45))" }}
          >
            <GlassCard
              variant="default"
              padding="default"
              className="border-violet-500/35"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white/90" />
                      <span className="text-white font-medium">{fileName}</span>
                    </div>
                    <p className="text-sm text-white/90 mt-1">
                      {chunksCreated} chunks created • Ready for questions
                    </p>
                  </div>
                </div>
                {onReset && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    className="text-white/90 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Upload Area */
          <motion.div
            key="upload"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{
              filter: isDragOver
                ? "drop-shadow(0 0 22px rgba(139,92,246,0.6))"
                : "drop-shadow(0 0 18px rgba(139,92,246,0.45))",
            }}
          >
            <GlassCard
              variant="default"
              padding="default"
              className={cn(
                "border-violet-500/35 transition-[border-color] duration-300",
                isDragOver && "border-violet-400/55",
                displayError && "border-red-500/45",
              )}
            >
              <div className="flex flex-col items-stretch">
                {isUploading ? (
                  <div className="space-y-4 px-1">
                    <div className="flex items-center gap-3">
                      <Spinner size="lg" color="purple" />
                      <div>
                        <p className="truncate text-sm font-medium text-white">
                          Processing PDF on server…
                        </p>
                        <p className="text-xs text-white/90">
                          Ingest pipeline (live-style progress)
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed shadow-inner">
                      {/* Visual ingest timeline (not server logs) to explain pipeline stages. */}
                      <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2 text-[10px] uppercase tracking-wide text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        ingest.log
                      </div>
                      <ul className="space-y-2">
                        {PIPELINE_STEPS.map((s, i) => {
                          const done = i < completedSteps;
                          const active =
                            i === completedSteps &&
                            completedSteps < PIPELINE_STEPS.length;
                          return (
                            <li
                              key={s.id}
                              className={cn(
                                "flex gap-2 rounded-lg px-2 py-1.5 transition-colors",
                                active && "bg-purple-500/10",
                              )}
                            >
                              <span className="mt-0.5 shrink-0">
                                {done ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded border border-emerald-500/50 bg-emerald-500/20">
                                    <Check className="h-2.5 w-2.5 text-emerald-300" />
                                  </span>
                                ) : active ? (
                                  <span className="flex h-4 w-4 items-center justify-center">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-300" />
                                  </span>
                                ) : (
                                  <span className="flex h-4 w-4 items-center justify-center rounded border border-white/15 bg-white/5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                  </span>
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/90">
                                  <span className="text-slate-300">
                                    [{String(s.id).padStart(2, "0")}]
                                  </span>{" "}
                                  {s.label}
                                </p>
                                <p className="text-[10px] text-slate-300">
                                  {s.detail}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0">
                    {/* Compact bar — always visible in upload idle state */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: icon + title + button (hidden when expanded) */}
                      {!isExpanded && (
                        <div className="flex w-full min-w-0 items-start gap-3 sm:w-auto sm:items-center">
                          <div className="shrink-0 rounded-xl bg-white/10 p-2">
                            <Upload className="h-5 w-5 text-white/90" />
                          </div>
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                Upload your PDF
                              </p>
                              <p className="text-xs text-white/70">
                                Select a file · up to{" "}
                                {formatFileSize(MAX_FILE_SIZE)}
                              </p>
                            </div>
                            <Button
                              className="mt-2 w-fit shrink-0 sm:mt-0"
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClick();
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span className="sm:hidden">Select PDF File</span>
                              <span className="hidden sm:inline">
                                Select PDF File
                              </span>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Right: drag-drop hint + expand/collapse toggle — hidden on small screens */}
                      {onToggleExpand && (
                        <div className="hidden ml-auto shrink-0 flex-col items-end sm:flex">
                          {!isExpanded && (
                            <p className="text-xs font-medium text-white/80">
                              Drag & drop file
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={onToggleExpand}
                            className="mt-0.5 flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white"
                          >
                            {isExpanded ? (
                              <>
                                Collapse <ChevronUp className="h-3.5 w-3.5" />
                              </>
                            ) : (
                              <>
                                Expand <ChevronDown className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Full drag-drop area — only on sm+ and when expanded */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="expanded"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="hidden overflow-hidden sm:block"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleClick();
                              }
                            }}
                            onClick={handleClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                              "mx-auto flex w-full max-w-5xl cursor-pointer flex-col items-center rounded-3xl border border-dashed p-4 sm:p-6 text-center transition-colors",
                              isDragOver
                                ? "border-purple-400/60 bg-purple-500/10"
                                : "border-white/25 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.05]",
                            )}
                          >
                            <div
                              className={cn(
                                "mb-4 rounded-3xl p-4 transition-colors",
                                isDragOver ? "bg-purple-500/25" : "bg-white/10",
                              )}
                            >
                              {isDragOver ? (
                                <File className="h-10 w-10 text-purple-300" />
                              ) : (
                                <Upload className="h-10 w-10 text-white/90" />
                              )}
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">
                              {isDragOver
                                ? "Drop your PDF here"
                                : "Upload your PDF"}
                            </h3>
                            <p className="mb-4 text-sm text-white/90">
                              Drag and drop inside the dashed area, or click to
                              browse
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClick();
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Select PDF File
                            </Button>
                            <p className="mt-4 text-xs text-white/80">
                              Supports PDF files up to{" "}
                              {formatFileSize(MAX_FILE_SIZE)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Error display */}
                {displayError && !isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-2 px-2 text-center text-sm text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {displayError}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
