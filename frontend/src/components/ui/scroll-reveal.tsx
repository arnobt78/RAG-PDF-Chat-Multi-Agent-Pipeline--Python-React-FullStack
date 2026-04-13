/**
 * ScrollReveal Component
 * 
 * Animates children when they enter the viewport using Framer Motion.
 * Supports multiple animation directions and customizable timing.
 * 
 * Features:
 * - Viewport-based triggering
 * - Multiple animation directions (up, down, left, right)
 * - Customizable delay and duration
 * - Only animates once by default
 * 
 * Usage:
 * <ScrollReveal direction="up" delay={0.2}>
 *   <YourComponent />
 * </ScrollReveal>
 */

import * as React from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AnimationDirection } from "@/types";

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation direction */
  direction?: AnimationDirection;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Additional className */
  className?: string;
  /** Trigger animation only once */
  once?: boolean;
  /** Viewport margin for trigger */
  margin?: `${number}px` | `${number}%` | `${number}px ${number}px` | `${number}px ${number}px ${number}px ${number}px`;
}

/**
 * Get animation variants based on direction
 */
function getVariants(direction: AnimationDirection, duration: number): Variants {
  const distance = 50;

  const directions: Record<AnimationDirection, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const offset = directions[direction];

  return {
    hidden: {
      opacity: 0,
      ...offset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smooth easing
      },
    },
  };
}

const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    {
      children,
      direction = "up",
      delay = 0,
      duration = 0.6,
      className,
      once = true,
      margin = "-100px" as const,
    },
    ref
  ) => {
    // Create internal ref if none provided
    const internalRef = React.useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    // Track if element is in viewport
    const isInView = useInView(resolvedRef, {
      once,
      margin,
    });

    // Get animation variants
    const variants = getVariants(direction, duration);

    return (
      <motion.div
        ref={resolvedRef}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
        transition={{ delay }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";

/**
 * StaggerReveal Component
 * 
 * Wrapper for staggered animations of multiple children.
 * Each child animates with a progressive delay.
 */
export interface StaggerRevealProps {
  children: React.ReactNode;
  /** Base delay before first animation */
  baseDelay?: number;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Animation direction */
  direction?: AnimationDirection;
  /** Additional className */
  className?: string;
}

export function StaggerReveal({
  children,
  baseDelay = 0,
  staggerDelay = 0.1,
  direction = "up",
  className,
}: StaggerRevealProps) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={cn(className)}>
      {childArray.map((child, index) => (
        <ScrollReveal
          key={index}
          direction={direction}
          delay={baseDelay + index * staggerDelay}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

export { ScrollReveal };
