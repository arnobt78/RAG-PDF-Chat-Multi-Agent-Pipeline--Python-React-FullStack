/**
 * Textarea Component
 *
 * A styled multi-line text input with glassmorphism design.
 *
 * Features:
 * - Auto-resize option
 * - Focus ring animation
 * - Error state styling
 * - Character count option
 *
 * Usage:
 * <Textarea placeholder="Enter message..." rows={4} />
 * <Textarea autoResize maxLength={500} showCount />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Show error state styling */
  error?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Show character count */
  showCount?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      autoResize,
      showCount,
      maxLength,
      wrapperClassName,
      disabled,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Handle change with character count
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    // Update count on initial value
    React.useEffect(() => {
      if (showCount && typeof value === "string") {
        setCharCount(value.length);
      }
    }, [value, showCount]);

    return (
      <div className={cn("relative min-w-0", wrapperClassName)}>
        <textarea
          ref={textareaRef}
          className={cn(
            // Base styles
            "block min-h-[100px] w-full max-w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-300",
            // Focus styles
            "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
            // Transition
            "transition-all duration-200",
            // Disabled styles
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Error styles
            error
              ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
              : "border-white/20",
            // Resize behavior
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            // Bottom padding for character count
            showCount && "pb-8",
            className,
          )}
          disabled={disabled}
          onChange={handleChange}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        {/* Character count display */}
        {showCount && (
          <div
            className={cn(
              "absolute bottom-2 right-3 text-xs",
              maxLength && charCount >= maxLength
                ? "text-red-400"
                : "text-slate-300",
            )}
          >
            {charCount}
            {maxLength && ` / ${maxLength}`}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
