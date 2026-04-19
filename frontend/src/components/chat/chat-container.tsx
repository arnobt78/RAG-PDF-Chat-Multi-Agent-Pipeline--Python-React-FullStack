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
 *
 * Learning path inside this file:
 *   1. Hooks ``usePDFUpload`` / ``useChat`` encapsulate server I/O; this component wires UI state.
 *   2. Effects persist chat to IndexedDB whenever history or filename changes (device-local backup).
 *   3. Banner + copy reference ``SESSION_INDEX_RETENTION_DAYS`` — keep aligned with backend env.
 *   4. Streaming vs non-streaming is a user toggle; both hit the same pipeline on the server.
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
import { ModelInfoToggle } from "./model-info-toggle";
import { usePDFUpload } from "@/hooks/use-pdf-upload";
import { useChat } from "@/hooks/use-chat";
import { AI_MODELS, type AIModel, type ChatEntry } from "@/types";
import {
  loadPreference,
  savePreference,
  prefKeys,
  saveChatSession,
  loadChatSession,
  listChatSessions,
  deleteChatSession,
  clearAllSessions,
  type ChatSession,
} from "@/lib/storage";
import { appToast } from "@/lib/app-toast";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SESSION_INDEX_RETENTION_DAYS } from "@/lib/session-retention";

const DEFAULT_CHAT_MODEL_ID = "openai/gpt-4o-mini";

export function ChatContainer() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Persisted preferences (localStorage)
  const [selectedModel, setSelectedModel] = React.useState(() =>
    loadPreference<string>(prefKeys.SELECTED_MODEL, DEFAULT_CHAT_MODEL_ID),
  );
  const [modelMeta, setModelMeta] = React.useState(() => {
    const id = loadPreference<string>(
      prefKeys.SELECTED_MODEL,
      DEFAULT_CHAT_MODEL_ID,
    );
    const m = AI_MODELS.find((x) => x.id === id) ?? AI_MODELS[0];
    return { name: m.name, provider: m.provider };
  });
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
  const [clearAllOpen, setClearAllOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(
    null,
  );

  const prevUploading = React.useRef(false);
  const prevChatLoading = React.useRef(false);
  const chatLenWhenRequestStarted = React.useRef(0);

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

  // -- Keep saved-session list in sync (toolbar badge + panel) --
  React.useEffect(() => {
    listChatSessions().then(setSessions);
  }, [chatHistory, fileName, showSessions]);

  React.useEffect(() => {
    const was = prevUploading.current;
    if (isUploading && !was) {
      appToast.pdfUploading();
    }
    if (!isUploading && was) {
      if (uploadError) {
        appToast.pdfError(uploadError);
      } else if (isLoaded && fileName) {
        appToast.pdfReady(fileName, chunksCreated ?? undefined);
      }
    }
    prevUploading.current = isUploading;
  }, [isUploading, uploadError, isLoaded, fileName, chunksCreated]);

  React.useEffect(() => {
    const was = prevChatLoading.current;
    if (isLoading && !was) {
      chatLenWhenRequestStarted.current = chatHistory.length;
    }
    if (!isLoading && was) {
      if (chatError) {
        appToast.chatError(chatError);
      } else if (chatHistory.length > chatLenWhenRequestStarted.current) {
        const last = chatHistory[chatHistory.length - 1];
        const preview =
          last.question.length > 72
            ? `${last.question.slice(0, 72)}…`
            : last.question;
        appToast.replyReady(preview, last.modelUsed);
      } else {
        appToast.generationStopped();
      }
    }
    prevChatLoading.current = isLoading;
  }, [isLoading, chatError, chatHistory]);

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
    appToast.chatExported();
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
      appToast.sessionRestored(session.pdfName, session.entries.length);
    },
    [setChatHistory],
  );

  const handleDeleteSession = React.useCallback(async (pdfName: string) => {
    await deleteChatSession(pdfName);
    setSessions((prev) => prev.filter((s) => s.pdfName !== pdfName));
    appToast.sessionDeleted(pdfName);
  }, []);

  const handleClearAllConfirmed = React.useCallback(async () => {
    const n = sessions.length;
    if (n === 0) return;
    await clearAllSessions();
    setSessions([]);
    appToast.allSessionsCleared(n);
  }, [sessions.length]);

  const handleClearToolbarChat = React.useCallback(() => {
    clearHistory();
    appToast.chatCleared();
  }, [clearHistory]);

  const handleResetUpload = React.useCallback(() => {
    resetUpload();
    appToast.uploadReset();
  }, [resetUpload]);

  return (
    <div className="flex w-full min-w-0 flex-col overflow-x-visible">
      <ScrollReveal direction="down" once={false} className="mb-4">
        <ModelInfoToggle
          selectedModel={selectedModel}
          activeModelName={modelMeta.name}
          activeProvider={modelMeta.provider}
        />
      </ScrollReveal>

      {/* Device-local data banner */}
      <ScrollReveal direction="down" once={false} className="mb-4">
        <AnimatePresence initial={false}>
          {showBanner && (
            <motion.div
              key="local-data-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/15 via-amber-500/8 to-transparent px-4 py-3 shadow-[0_0_24px_-8px_rgba(251,191,36,0.35)]">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300/80 to-amber-500/40" />
                <div className="flex items-start gap-3 pl-2">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15">
                    <HardDrive className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-sm font-semibold tracking-tight text-amber-50">
                      Stored only on this device
                    </h2>
                    <p className="text-xs leading-relaxed text-amber-100/95">
                      Chat history and UI preferences live only on this device
                      (IndexedDB and localStorage): they do not sync elsewhere
                      and disappear if you clear site data or use another
                      browser or profile. The app sends an anonymous session id
                      so the API can keep a separate PDF search index per
                      browser—your uploads are not mixed with other visitors’
                      documents.
                      Those server indexes are capped and may be removed after
                      about {SESSION_INDEX_RETENTION_DAYS} days without use or
                      when the server runs cleanup; if answers stop matching your
                      document, upload the PDF again.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissBanner}
                    className="rounded-lg p-1 text-amber-300/90 transition-colors hover:bg-white/10 hover:text-amber-100 shrink-0"
                    aria-label="Dismiss notice"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollReveal>

      {/* Header with status */}
      <ScrollReveal direction="down" once={false} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/15">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Chat with PDF
              </h1>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="info"
                  icon={<Zap className="w-3 h-3" aria-hidden />}
                  className="cursor-default"
                  aria-label="About the 7-agent RAG pipeline"
                >
                  7-Agent Pipeline
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <p className="font-medium text-white">7-Agent Pipeline</p>
                <p className="mt-1 text-[11px] text-white/80 leading-snug">
                  This app runs a multi-step RAG flow on the server: PDF text is
                  chunked and embedded, then specialized agents handle routing,
                  retrieval, and answer generation so replies stay grounded in
                  your document.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Previous sessions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowSessions((p) => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border bg-white/5 border-white/10 text-white/90 hover:bg-white/10 transition-all"
                  aria-label={`Open saved chat sessions, ${sessions.length} saved`}
                >
                  <History className="w-3 h-3" aria-hidden />
                  <span className="hidden sm:inline">Sessions</span>
                  <span className="min-w-[1.25rem] rounded-md bg-white/15 px-1 py-0.5 text-center text-[10px] font-semibold tabular-nums text-white/95">
                    {sessions.length}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p className="font-medium text-white">Sessions</p>
                <p className="mt-1 text-[11px] text-white/80 leading-snug">
                  Open a panel of chat histories saved in your browser
                  (IndexedDB) for this site. The number is how many threads are
                  stored on this device—they are not synced to other browsers.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Sources toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    const next = !includeSources;
                    setIncludeSources(next);
                    if (next) appToast.sourcesEnabled();
                    else appToast.sourcesDisabled();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                    includeSources
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10"
                  }`}
                  aria-label="Toggle source citations in answers"
                >
                  <BookOpen className="w-3 h-3" aria-hidden />
                  <span className="hidden sm:inline">Sources</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p className="font-medium text-white">Sources</p>
                <p className="mt-1 text-[11px] text-white/80 leading-snug">
                  When on, the app asks the backend to attach citation snippets
                  from your PDF to each reply (when the model returns them).
                  Turn off for shorter responses.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Streaming toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    const next = !useStreaming;
                    setUseStreaming(next);
                    if (next) appToast.streamingEnabled();
                    else appToast.streamingDisabled();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                    useStreaming
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10"
                  }`}
                  aria-label="Toggle answer streaming"
                >
                  <Radio className="w-3 h-3" aria-hidden />
                  <span className="hidden sm:inline">Stream</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p className="font-medium text-white">Stream</p>
                <p className="mt-1 text-[11px] text-white/80 leading-snug">
                  When on, answers stream over the network token-by-token (SSE)
                  for a live typing effect. When off, you get one JSON response
                  after the model finishes.
                </p>
              </TooltipContent>
            </Tooltip>

            <ModelSelector
              value={selectedModel}
              onChange={(model: AIModel) => {
                setSelectedModel(model.id);
                setModelMeta({ name: model.name, provider: model.provider });
                appToast.modelSelected(model);
              }}
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
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      <History className="h-4 w-4 shrink-0 text-purple-400" />
                      Saved Chat Sessions
                    </span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white/90">
                      ({sessions.length})
                    </span>
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Saved rows are chat history in IndexedDB on this device
                    only. Clearing site data removes them; other devices won't
                    see these threads. The list does not include the server-side
                    PDF index (anonymous session); that index can be removed
                    after about {SESSION_INDEX_RETENTION_DAYS} days without use
                    (and on server cleanup)—re-upload the PDF if retrieval feels
                    off.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:pt-0.5">
                  {sessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setClearAllOpen(true)}
                      className="text-xs text-white/75 decoration-white/50 underline-offset-2 transition-colors hover:text-white hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSessions(false)}
                    className="text-xs text-white/75 decoration-white/50 underline-offset-2 transition-colors hover:text-white hover:underline"
                  >
                    close
                  </button>
                </div>
              </div>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-300">
                  No saved sessions yet. Chat with a PDF and your history will
                  be saved here.
                </p>
              ) : (
                <div className="max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto scrollbar-hide">
                  {sessions.map((s) => {
                    const lastWithModel = [...s.entries]
                      .reverse()
                      .find((e) => e.modelUsed);
                    const lastSources =
                      [...s.entries].reverse().find((e) => e.sources?.length)
                        ?.sources?.length ?? 0;
                    const updated = new Date(s.updatedAt);
                    return (
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
                          <p className="text-xs text-slate-300">
                            {s.entries.length} message
                            {s.entries.length !== 1 ? "s" : ""}
                            {" · "}
                            {updated.toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          {(lastWithModel?.modelUsed || lastSources > 0) && (
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {lastWithModel?.modelUsed && (
                                <span>Model: {lastWithModel.modelUsed}</span>
                              )}
                              {lastWithModel?.modelUsed && lastSources > 0
                                ? " · "
                                : ""}
                              {lastSources > 0 && (
                                <span>
                                  {lastSources} cited source
                                  {lastSources !== 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          )}
                        </button>
                        <button
                          onClick={() => setSessionToDelete(s.pdfName)}
                          className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-1"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Upload Section */}
      <ScrollReveal direction="down" once={false} delay={0.06} className="mb-6 w-full min-w-0">
        <PDFUpload
          onUpload={uploadPDF}
          isUploading={isUploading}
          isLoaded={isLoaded}
          fileName={fileName ?? undefined}
          chunksCreated={chunksCreated ?? undefined}
          error={uploadError}
          onReset={handleResetUpload}
        />
      </ScrollReveal>

      {/* Chat Messages Area */}
      <ScrollReveal direction="down" once={false} delay={0.1} className="w-full min-w-0">
        <GlassCard
          variant="default"
          padding="none"
          className="flex min-h-[16rem] max-h-[min(36rem,72dvh)] flex-col border-emerald-600/40 sm:max-h-[min(40rem,75dvh)]"
        >
          {/* Toolbar */}
          {chatHistory.length > 0 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-white/10">
              <span className="text-xs text-slate-300">
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
                  onClick={handleClearToolbarChat}
                  icon={<Trash2 className="w-3 h-3" />}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white/90 hover:text-white h-7 px-2"
                  onClick={handleResetUpload}
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
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[14rem] flex-col items-center justify-center px-2 py-10 text-center"
                >
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-white/5 border border-white/10 mb-5">
                    <MessageSquare className="w-10 h-10 text-purple-300/90" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/95 mb-2 tracking-tight">
                    {isLoaded ? "Ready to chat!" : "No PDF uploaded yet"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90/95 max-w-7xl leading-relaxed">
                    {isLoaded
                      ? "Ask anything about your document. The pipeline retrieves context, then your chosen model answers—with automatic fallback if a provider is unavailable."
                      : "Upload a PDF document to start asking questions about its content."}
                  </p>
                  {isLoaded && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-7xl">
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
                          className="px-3 py-2 rounded-2xl bg-white/[0.06] border border-purple-500/20 text-xs text-white/90 hover:bg-white/10 hover:border-purple-400/35 active:scale-[0.98] transition-colors duration-200 text-left leading-snug max-w-[11rem] sm:max-w-none"
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
          <div className="w-full min-w-0 p-4 sm:p-6 border-t border-white/10">
            {isLoading && useStreaming ? (
              <div className="flex w-full justify-center">
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

      <ConfirmAlertDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear all saved sessions?"
        description={
          <>
            This permanently deletes{" "}
            <strong className="text-white">{sessions.length}</strong> saved chat
            session{sessions.length === 1 ? "" : "s"} from IndexedDB in this
            browser. Exports on disk are not changed.
          </>
        }
        confirmLabel="Clear all"
        destructive
        onConfirm={handleClearAllConfirmed}
      />
      <ConfirmAlertDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
        title="Delete this saved session?"
        description={
          sessionToDelete ? (
            <>
              Remove saved messages for{" "}
              <span className="font-medium text-white">{sessionToDelete}</span>.
              It disappears from the saved list; the current chat view only
              changes if this PDF is the one you have open.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          const key = sessionToDelete;
          if (key) await handleDeleteSession(key);
        }}
      />
    </div>
  );
}
