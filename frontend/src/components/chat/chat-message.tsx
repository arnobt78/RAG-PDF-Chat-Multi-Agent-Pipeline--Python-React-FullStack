/**
 * ChatMessage Component
 * 
 * Individual chat message bubble with:
 * - User/Assistant styling
 * - Animated entrance
 * - Timestamp display
 * - Copy functionality
 * 
 * Usage:
 * <ChatMessage role="user" content="Hello!" />
 * <ChatMessage role="assistant" content="Hi there!" />
 */

import * as React from "react";
import { motion } from "framer-motion";
import { User, Bot, Copy, Check } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface ChatMessageProps {
  /** Message sender role */
  role: "user" | "assistant";
  /** Message content */
  content: string;
  /** Timestamp of message */
  timestamp?: Date;
  /** Whether this is the latest message (for animation) */
  isLatest?: boolean;
  /** Index for stagger animation */
  index?: number;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isLatest = false,
  index = 0,
}: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = role === "user";

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Animation variants
  const messageVariants = {
    hidden: {
      opacity: 0,
      x: isUser ? 20 : -20,
      y: 10,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        delay: isLatest ? 0 : index * 0.05,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
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
            : "bg-white/10 border border-white/20"
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
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "message-user rounded-br-md"
              : "message-assistant rounded-bl-md"
          )}
        >
          {/* Content with whitespace preserved */}
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Footer with timestamp and copy button */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          {timestamp && (
            <span className="text-xs text-slate-500">
              {formatRelativeTime(timestamp)}
            </span>
          )}

          {/* Copy button (only for assistant messages) */}
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
 * TypingIndicator Component
 * 
 * Shows animated dots while assistant is typing/thinking.
 */
export function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
        <Bot className="w-4 h-4 text-purple-400" />
      </div>

      {/* Typing dots */}
      <div className="message-assistant rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
