/**
 * ChatMessage Component
 *
 * Individual chat message bubble with:
 * - User/Assistant styling
 * - Animated entrance
 * - Timestamp display
 * - Copy functionality
 * - Optional source citations & model badge
 */

import * as React from "react";
import { motion } from "framer-motion";
import { User, Bot, Copy, Check, FileText, Cpu } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isLatest?: boolean;
  index?: number;
  sources?: string[];
  modelUsed?: string;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isLatest = false,
  index = 0,
  sources,
  modelUsed,
}: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const isUser = role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: isUser ? 20 : -20, y: 10 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.4, delay: isLatest ? 0 : index * 0.05, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-500"
            : "bg-white/10 border border-white/20",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("relative max-w-[80%] sm:max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser ? "message-user rounded-br-md" : "message-assistant rounded-bl-md",
          )}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Source citations collapsible */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-1.5">
            <button
              onClick={() => setSourcesOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {sourcesOpen ? "Hide" : "Show"} {sources.length} source
              {sources.length > 1 ? "s" : ""}
            </button>
            {sourcesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-1 space-y-1"
              >
                {sources.map((src, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5"
                  >
                    {src}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Footer with timestamp, model badge, and copy button */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-1 flex-wrap",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {timestamp && (
            <span className="text-xs text-slate-500">{formatRelativeTime(timestamp)}</span>
          )}

          {!isUser && modelUsed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 rounded-full px-2 py-0.5">
              <Cpu className="w-2.5 h-2.5" />
              {modelUsed.split("/").pop()}
            </span>
          )}

          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * TypingIndicator / StreamingIndicator
 *
 * Shows animated dots or streaming text while assistant is generating.
 */
export function TypingIndicator({ streamingText }: { streamingText?: string | null }) {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>

      <div className="message-assistant rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] sm:max-w-[70%]">
        {streamingText ? (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {streamingText}
            <motion.span
              className="inline-block w-2 h-4 ml-0.5 bg-purple-400 rounded-sm"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </p>
        ) : (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
