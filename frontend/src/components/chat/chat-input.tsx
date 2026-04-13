/**
 * ChatInput Component
 * 
 * Chat input area with:
 * - Auto-resizing textarea
 * - Send button with keyboard shortcut
 * - Disabled state when no PDF loaded
 * 
 * Usage:
 * <ChatInput 
 *   onSend={handleSend} 
 *   disabled={!pdfLoaded} 
 *   isLoading={false} 
 * />
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ChatInputProps {
  /** Callback when message is sent */
  onSend: (message: string) => void;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether a message is being processed */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Ask a question about your PDF...",
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when enabled
  React.useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Handle send action
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isLoading) return;

    onSend(trimmedMessage);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !isLoading;

  return (
    <div className="relative">
      {/* Input container with glassmorphism */}
      <div
        className={cn(
          "relative flex items-end gap-3 p-3 rounded-2xl",
          "bg-white/5 backdrop-blur-sm border border-white/10",
          "transition-all duration-300",
          "focus-within:border-purple-500/50 focus-within:bg-white/10"
        )}
      >
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Upload a PDF first..." : placeholder}
          disabled={disabled || isLoading}
          autoResize
          className={cn(
            "flex-1 min-h-[44px] max-h-[200px] resize-none",
            "bg-transparent border-none focus:ring-0",
            "text-white placeholder:text-slate-500"
          )}
          rows={1}
        />

        {/* Send button */}
        <motion.div
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
        >
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className={cn(
              "shrink-0 w-11 h-11 rounded-xl transition-all",
              canSend
                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/30"
                : "bg-white/10 text-slate-500"
            )}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400">Enter</kbd> to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
