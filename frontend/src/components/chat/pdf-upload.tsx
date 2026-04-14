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
} from "lucide-react";
import { cn, isValidPDF, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { MAX_FILE_SIZE } from "@/lib/constants";

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
}

export function PDFUpload({
  onUpload,
  isUploading,
  isLoaded,
  fileName,
  chunksCreated,
  error,
  onReset,
}: PDFUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassCard
              variant="default"
              className="border-emerald-500/30"
              padding="default"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassCard
              variant={isDragOver ? "glow" : "hover"}
              padding="lg"
              className={cn(
                "cursor-pointer transition-all duration-300",
                isDragOver && "border-purple-500/50 scale-[1.02]",
                displayError && "border-red-500/50",
              )}
              onClick={!isUploading ? handleClick : undefined}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center text-center py-8">
                {isUploading ? (
                  // Uploading state
                  <>
                    <Spinner size="xl" color="purple" />
                    <p className="mt-4 text-white font-medium">
                      Processing PDF...
                    </p>
                    <p className="mt-2 text-sm text-white/90">
                      Creating embeddings and vector store
                    </p>
                  </>
                ) : (
                  // Default upload state
                  <>
                    <motion.div
                      className={cn(
                        "p-4 rounded-3xl mb-4 transition-colors",
                        isDragOver ? "bg-purple-500/30" : "bg-white/10",
                      )}
                      animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
                    >
                      {isDragOver ? (
                        <File className="w-10 h-10 text-purple-400" />
                      ) : (
                        <Upload className="w-10 h-10 text-white/90" />
                      )}
                    </motion.div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {isDragOver ? "Drop your PDF here" : "Upload your PDF"}
                    </h3>

                    <p className="text-sm text-white/90 mb-4">
                      Drag and drop or click to browse
                    </p>

                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Select PDF File
                    </Button>

                    <p className="mt-4 text-xs text-white/80">
                      Supports PDF files up to {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </>
                )}

                {/* Error display */}
                {displayError && !isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
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
