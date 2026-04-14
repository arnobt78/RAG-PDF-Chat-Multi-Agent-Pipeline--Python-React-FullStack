/**
 * ChatContainer Component
 *
 * Main chat interface container that orchestrates:
 * - PDF upload
 * - Message display (with streaming support)
 * - Chat input
 * - Model selection (persisted in localStorage)
 * - Sources toggle (persisted in localStorage)
 * - Streaming toggle (persisted in localStorage)
 * - Chat history persistence in IndexedDB (per PDF)
 * - Export chat history
 * - Previous sessions sidebar
 * - Device-local data banner
 * - Empty states
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Zap,
  Trash2,
  RotateCcw,
  Download,
  BookOpen,
  Radio,
  StopCircle,
  History,
  HardDrive,
  X,
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
import {
  loadPreference,
  savePreference,
  prefKeys,
  saveChatSession,
  loadChatSession,
  listChatSessions,
  deleteChatSession,
  type ChatSession,
} from "@/lib/storage";

export function ChatContainer() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Persisted preferences (localStorage)
  const [selectedModel, setSelectedModel] = React.useState(() =>
    loadPreference<string>(prefKeys.SELECTED_MODEL, "openai/gpt-4o-mini"),
  );
  const [includeSources, setIncludeSources] = React.useState(() =>
    loadPreference<boolean>(prefKeys.INCLUDE_SOURCES, false),
  );
  const [useStreaming, setUseStreaming] = React.useState(() =>
    loadPreference<boolean>(prefKeys.STREAMING_ENABLED, true),
  );
  const [showBanner, setShowBanner] = React.useState(
    () => !loadPreference<boolean>(prefKeys.DISMISSED_LOCAL_BANNER, false),
  );

  // Previous sessions list
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = React.useState(false);

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
    streamingAnswer,
    sendMessage,
    sendMessageStreaming,
    clearHistory,
    cancelStream,
    setChatHistory,
  } = useChat();

  // -- Persist preferences on change --
  React.useEffect(() => {
    savePreference(prefKeys.SELECTED_MODEL, selectedModel);
  }, [selectedModel]);
  React.useEffect(() => {
    savePreference(prefKeys.INCLUDE_SOURCES, includeSources);
  }, [includeSources]);
  React.useEffect(() => {
    savePreference(prefKeys.STREAMING_ENABLED, useStreaming);
  }, [useStreaming]);

  // -- Persist chat history to IndexedDB on every change --
  React.useEffect(() => {
    if (fileName && chatHistory.length > 0) {
      saveChatSession(fileName, chatHistory);
    }
  }, [chatHistory, fileName]);

  // -- Restore chat history when a PDF is loaded and has a saved session --
  React.useEffect(() => {
    if (fileName && isLoaded && chatHistory.length === 0) {
      loadChatSession(fileName).then((saved) => {
        if (saved.length > 0) setChatHistory(saved);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName, isLoaded]);

  // -- Load sessions list when toggled open --
  React.useEffect(() => {
    if (showSessions) {
      listChatSessions().then(setSessions);
    }
  }, [showSessions]);

  // -- Auto-scroll --
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading, streamingAnswer]);

  const handleSend = React.useCallback(
    (message: string) => {
      if (useStreaming) {
        sendMessageStreaming(message, selectedModel, includeSources);
      } else {
        sendMessage(message, selectedModel, includeSources);
      }
    },
    [
      sendMessage,
      sendMessageStreaming,
      selectedModel,
      includeSources,
      useStreaming,
    ],
  );

  const handleExport = React.useCallback(() => {
    if (chatHistory.length === 0) return;
    const lines = chatHistory.flatMap((e: ChatEntry) => [
      `Q: ${e.question}`,
      `A: ${e.answer}`,
      e.modelUsed ? `Model: ${e.modelUsed}` : "",
      e.sources?.length ? `Sources: ${e.sources.join(", ")}` : "",
      "---",
    ]);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chatHistory]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleExport]);

  const dismissBanner = React.useCallback(() => {
    setShowBanner(false);
    savePreference(prefKeys.DISMISSED_LOCAL_BANNER, true);
  }, []);

  const handleRestoreSession = React.useCallback(
    (session: ChatSession) => {
      setChatHistory(session.entries);
      setShowSessions(false);
    },
    [setChatHistory],
  );

  const handleDeleteSession = React.useCallback(async (pdfName: string) => {
    await deleteChatSession(pdfName);
    setSessions((prev) => prev.filter((s) => s.pdfName !== pdfName));
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
      {/* Device-local data banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300 flex-1">
                Your chat history and preferences are stored locally in this
                browser. Clearing site data or switching devices will reset
                everything.
              </p>
              <button
                onClick={dismissBanner}
                className="text-amber-400 hover:text-amber-200 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with status */}
      <ScrollReveal direction="down" className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Chat with PDF</h1>
              <p className="text-sm text-white/90">
                Upload a document and start asking questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isLoaded && (
              <Badge variant="success" icon={<FileText className="w-3 h-3" />}>
                PDF Ready
              </Badge>
            )}
            <Badge variant="info" icon={<Zap className="w-3 h-3" />}>
              7-Agent Pipeline
            </Badge>

            {/* Previous sessions */}
            <button
              type="button"
              onClick={() => setShowSessions((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border bg-white/5 border-white/10 text-white/90 hover:bg-white/10 transition-all"
              title="View saved chat sessions"
            >
              <History className="w-3 h-3" />
              <span className="hidden sm:inline">Sessions</span>
            </button>

            {/* Sources toggle */}
            <button
              type="button"
              onClick={() => setIncludeSources((p) => !p)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                includeSources
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10"
              }`}
              title="Include source citations in answers"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">Sources</span>
            </button>

            {/* Streaming toggle */}
            <button
              type="button"
              onClick={() => setUseStreaming((p) => !p)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                useStreaming
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10"
              }`}
              title="Toggle streaming mode"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">Stream</span>
            </button>

            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={isLoading}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Previous sessions panel */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <GlassCard variant="default" padding="sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Saved Chat Sessions
                </h3>
                <button
                  onClick={() => setShowSessions(false)}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No saved sessions yet. Chat with a PDF and your history will
                  be saved here.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {sessions.map((s) => (
                    <div
                      key={s.pdfName}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <button
                        onClick={() => handleRestoreSession(s)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-sm text-white truncate">
                          {s.pdfName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.entries.length} message
                          {s.entries.length !== 1 ? "s" : ""} &middot;{" "}
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteSession(s.pdfName)}
                        className="text-slate-500 hover:text-red-400 transition-colors shrink-0 p-1"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

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
                {chatHistory.length} message
                {chatHistory.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white/90 hover:text-white h-7 px-2"
                  onClick={handleExport}
                  icon={<Download className="w-3 h-3" />}
                >
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white/90 hover:text-white h-7 px-2"
                  onClick={clearHistory}
                  icon={<Trash2 className="w-3 h-3" />}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white/90 hover:text-white h-7 px-2"
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
              {chatHistory.length === 0 && !streamingAnswer ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-10 px-2"
                >
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-white/5 border border-white/10 mb-5">
                    <MessageSquare className="w-10 h-10 text-purple-300/90" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/95 mb-2 tracking-tight">
                    {isLoaded ? "Ready to chat!" : "No PDF uploaded yet"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90/95 max-w-md leading-relaxed">
                    {isLoaded
                      ? "Ask anything about your document. The pipeline retrieves context, then your chosen model answers—with automatic fallback if a provider is unavailable."
                      : "Upload a PDF document to start asking questions about its content."}
                  </p>
                  {isLoaded && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-lg">
                      {[
                        "Summarize this document",
                        "What are the key points?",
                        "Explain the main topic",
                        "List all important sections",
                      ].map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion}
                          onClick={() => handleSend(suggestion)}
                          className="px-3 py-2 rounded-xl bg-white/[0.06] border border-purple-500/20 text-xs text-white/90 hover:bg-white/10 hover:border-purple-400/35 active:scale-[0.98] transition-colors duration-200 text-left leading-snug max-w-[11rem] sm:max-w-none"
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
                      isLatest={index === chatHistory.length - 1 && !isLoading}
                      sources={entry.sources}
                      modelUsed={entry.modelUsed}
                    />
                  </React.Fragment>
                ))
              )}

              {isLoading && (
                <TypingIndicator
                  key="typing-indicator"
                  streamingText={streamingAnswer}
                />
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Chat error display */}
          {chatError && (
            <div className="px-4 sm:px-6 pb-3">
              <div className="rounded-xl bg-rose-950/40 border border-rose-500/25 px-3 py-2.5 text-rose-100/90 text-xs sm:text-sm leading-relaxed max-h-36 overflow-y-auto scrollbar-hide">
                {chatError}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 sm:p-6 border-t border-white/10">
            {isLoading && useStreaming ? (
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={cancelStream}
                  icon={<StopCircle className="w-4 h-4" />}
                >
                  Stop generating
                </Button>
              </div>
            ) : (
              <ChatInput
                onSend={handleSend}
                disabled={!isLoaded}
                isLoading={isLoading}
              />
            )}
          </div>
        </GlassCard>
      </ScrollReveal>
    </div>
  );
}
