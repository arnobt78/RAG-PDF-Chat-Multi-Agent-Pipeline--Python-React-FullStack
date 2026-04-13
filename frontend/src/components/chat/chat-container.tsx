/**
 * ChatContainer Component
 *
 * Main chat interface container that orchestrates:
 * - PDF upload
 * - Message display
 * - Chat input
 * - Model selection
 * - Empty states
 *
 * This is the primary component for the chat page.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Zap,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PDFUpload } from "./pdf-upload";
import { ChatMessage, TypingIndicator } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { usePDFUpload } from "@/hooks/use-pdf-upload";
import { useChat } from "@/hooks/use-chat";
import type { ChatEntry } from "@/types";

export function ChatContainer() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = React.useState("openai/gpt-4o-mini");
  const {
    isUploading,
    isLoaded,
    fileName,
    chunksCreated,
    error: uploadError,
    uploadPDF,
    reset: resetUpload,
  } = usePDFUpload();

  const {
    chatHistory,
    isLoading,
    error: chatError,
    sendMessage,
    clearHistory,
  } = useChat();

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSend = React.useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
      {/* Header with status */}
      <ScrollReveal direction="down" className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Chat with PDF</h1>
              <p className="text-sm text-slate-400">
                Upload a document and start asking questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoaded && (
              <Badge variant="success" icon={<FileText className="w-3 h-3" />}>
                PDF Ready
              </Badge>
            )}
            <Badge variant="info" icon={<Zap className="w-3 h-3" />}>
              7-Agent Pipeline
            </Badge>
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={isLoading}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* PDF Upload Section */}
      <ScrollReveal direction="up" delay={0.1} className="mb-6">
        <PDFUpload
          onUpload={uploadPDF}
          isUploading={isUploading}
          isLoaded={isLoaded}
          fileName={fileName ?? undefined}
          chunksCreated={chunksCreated ?? undefined}
          error={uploadError}
          onReset={resetUpload}
        />
      </ScrollReveal>

      {/* Chat Messages Area */}
      <ScrollReveal direction="up" delay={0.2} className="flex-1 min-h-0">
        <GlassCard
          variant="default"
          padding="none"
          className="h-full flex flex-col"
        >
          {/* Toolbar */}
          {chatHistory.length > 0 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-white/10">
              <span className="text-xs text-slate-500">
                {chatHistory.length} message{chatHistory.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                  onClick={clearHistory}
                  icon={<Trash2 className="w-3 h-3" />}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                  onClick={resetUpload}
                  icon={<RotateCcw className="w-3 h-3" />}
                >
                  New PDF
                </Button>
              </div>
            </div>
          )}

          {/* Messages scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {chatHistory.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="p-4 rounded-2xl bg-white/5 mb-4">
                    <MessageSquare className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {isLoaded ? "Ready to chat!" : "No PDF uploaded yet"}
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm">
                    {isLoaded
                      ? "Ask any question about your document and I'll find the answer using the 7-agent RAG pipeline."
                      : "Upload a PDF document to start asking questions about its content."}
                  </p>
                  {isLoaded && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {[
                        "Summarize this document",
                        "What are the key points?",
                        "Explain the main topic",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSend(suggestion)}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                chatHistory.map((entry: ChatEntry, index: number) => (
                  <React.Fragment key={index}>
                    <ChatMessage
                      role="user"
                      content={entry.question}
                      timestamp={entry.timestamp}
                      index={index * 2}
                    />
                    <ChatMessage
                      role="assistant"
                      content={entry.answer}
                      timestamp={entry.timestamp}
                      index={index * 2 + 1}
                      isLatest={index === chatHistory.length - 1}
                    />
                  </React.Fragment>
                ))
              )}

              {isLoading && <TypingIndicator />}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Chat error display */}
          {chatError && (
            <div className="px-4 sm:px-6 pb-2">
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {chatError}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 sm:p-6 border-t border-white/10">
            <ChatInput
              onSend={handleSend}
              disabled={!isLoaded}
              isLoading={isLoading}
            />
          </div>
        </GlassCard>
      </ScrollReveal>
    </div>
  );
}
