/**
 * ChatMessage Component
 *
 * Individual chat message bubble with:
 * - User/Assistant styling
 * - Animated entrance
 * - Timestamp display
 * - Copy functionality
 * - Optional source citations & model badge
 *
 * ``sources`` are page hints from the pipeline — surfaced when the user enables "include sources".
 */

import * as React from "react";
import { motion } from "framer-motion";
import { User, Bot, Copy, Check, FileText, Cpu } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

/** Soft halo (not edge lines): dark forest green, diffuse box-shadow */
const assistantBubbleGlowClass =
  "shadow-[0_18px_48px_0_rgba(2,44,38,0.5),0_10px_36px_0_rgba(4,60,48,0.28),0_0_56px_0_rgba(6,95,70,0.18)]";

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
  isLatest: _isLatest = false,
  index: _index = 0,
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

  const formattedSources = React.useMemo(() => {
    if (!sources) return [];
    return sources.map((src) => {
      const raw = String(src).trim();
      // Backend often stores page metadata as zero-based ints; present one-based pages in UI.
      if (/^\d+$/.test(raw)) {
        const pageNum = Number.parseInt(raw, 10) + 1;
        return `Page ${pageNum}`;
      }
      return raw;
    });
  }, [sources]);

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
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
      <div
        className={cn(
          "relative max-w-[80%] sm:max-w-[70%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-3xl",
            isUser
              ? "message-user rounded-br-sm drop-shadow-[0_10px_32px_rgba(56,189,248,0.55)]"
              : "message-assistant rounded-bl-sm shadow-[0_8px_36px_-4px_rgba(16,185,129,0.5),0_0_32px_-8px_rgba(16,185,129,0.35)]",
          )}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Source citations collapsible */}
        {!isUser && formattedSources.length > 0 && (
          <div className="mt-1.5">
            <button
              onClick={() => setSourcesOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {sourcesOpen ? "Hide" : "Show"} {formattedSources.length} source
              {formattedSources.length > 1 ? "s" : ""}
            </button>
            {sourcesOpen && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {formattedSources.map((src, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center text-xs text-white/90 bg-white/5 rounded-full px-2.5 py-1 border border-white/10"
                  >
                    {src}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer with timestamp, model badge, and copy button */}
        {/* Model badge uses response metadata to expose backend fallback decisions. */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-1 flex-wrap",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {timestamp && (
            <span className="text-xs text-slate-300">
              {formatRelativeTime(timestamp)}
            </span>
          )}

          {!isUser && modelUsed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 rounded-full px-2 py-0.5">
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
                <Copy className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TypingIndicator / StreamingIndicator
 *
 * Shows animated dots or streaming text while assistant is generating.
 */
export const TypingIndicator = React.forwardRef<
  HTMLDivElement,
  { streamingText?: string | null }
>(function TypingIndicator({ streamingText }, ref) {
  return (
    <div ref={ref} className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>

      <div
        className={cn(
          "message-assistant rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] sm:max-w-[70%]",
          assistantBubbleGlowClass,
        )}
      >
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
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
TypingIndicator.displayName = "TypingIndicator";
