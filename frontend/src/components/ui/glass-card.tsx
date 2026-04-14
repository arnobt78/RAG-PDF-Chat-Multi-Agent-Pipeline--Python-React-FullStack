/**
 * GlassCard Component
 *
 * A glassmorphism-styled card component with backdrop blur effect.
 * Perfect for creating modern, translucent UI elements.
 *
 * Features:
 * - Backdrop blur effect
 * - Multiple variants (default, hover, glow)
 * - Customizable padding and border radius
 * - Optional header and footer sections
 *
 * Usage:
 * <GlassCard variant="hover">
 *   <GlassCardHeader>Title</GlassCardHeader>
 *   <GlassCardContent>Content here</GlassCardContent>
 * </GlassCard>
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Card variant styles
const glassCardVariants = cva(
  // Base glassmorphism styles
  "relative bg-transparent backdrop-blur-[2px] border border-white/10 overflow-hidden",
  {
    variants: {
      variant: {
        default: "shadow-glass",
        hover:
          "shadow-glass transition-all duration-300 hover:border-white/20 hover:shadow-glass-lg hover:scale-[1.02]",
        glow: "shadow-glow animate-pulse-glow",
        outline: "bg-transparent border-2",
      },
      radius: {
        default: "rounded-[20px]",
        sm: "rounded-xl",
        lg: "rounded-[28px]",
        full: "rounded-full",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "default",
      padding: "default",
    },
  },
);

export interface GlassCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, radius, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, radius, padding }), className)}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";

/**
 * GlassCardHeader Component
 */
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

/**
 * GlassCardTitle Component
 */
const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-white",
      className,
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

/**
 * GlassCardDescription Component
 */
const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-white/90", className)} {...props} />
));
GlassCardDescription.displayName = "GlassCardDescription";

/**
 * GlassCardContent Component
 */
const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-white", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

/**
 * GlassCardFooter Component
 */
const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-white/10", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  glassCardVariants,
};
