/**
 * Spinner Component
 * 
 * A loading spinner with multiple size and color options.
 * 
 * Usage:
 * <Spinner />
 * <Spinner size="lg" color="purple" />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: "sm" | "default" | "lg" | "xl";
  /** Color variant */
  color?: "default" | "white" | "purple" | "blue";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", color = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4 border-2",
      default: "w-6 h-6 border-2",
      lg: "w-8 h-8 border-3",
      xl: "w-12 h-12 border-4",
    };

    const colorClasses = {
      default: "border-slate-600 border-t-slate-300",
      white: "border-white/30 border-t-white",
      purple: "border-purple-900 border-t-purple-400",
      blue: "border-blue-900 border-t-blue-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full animate-spin",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };
