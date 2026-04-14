/**
 * Badge Component
 *
 * A small label component for displaying status, tags, or categories.
 *
 * Features:
 * - Multiple color variants
 * - Optional icon support
 * - Animated entrance option
 *
 * Usage:
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" icon={<AlertIcon />}>Warning</Badge>
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Badge variant styles
const badgeVariants = cva(
  // Base styles
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
        secondary: "bg-slate-500/20 text-white/90 border border-slate-500/30",
        success:
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        destructive: "bg-red-500/20 text-red-300 border border-red-500/30",
        outline: "bg-transparent text-white border border-white/30",
        info: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon to display before text */
  icon?: React.ReactNode;
  /** Whether to show with pulse animation */
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, pulse, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && "animate-pulse",
          className,
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
