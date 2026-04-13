/**
 * Button Component with Ripple Effect
 * 
 * A versatile button component featuring:
 * - Multiple variants (default, destructive, outline, secondary, ghost, link)
 * - Size options (default, sm, lg, icon)
 * - Ripple click effect animation
 * - Optional CTA shine wrapper for primary actions
 * 
 * Usage:
 * <Button variant="default" size="lg" withRipple>Click Me</Button>
 * <Button variant="outline" withShine>CTA Button</Button>
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Button variant styles using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105",
        outline:
          "border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
        ghost:
          "text-white hover:bg-white/10",
        link:
          "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Button props interface extending HTML button attributes
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Enable ripple click effect */
  withRipple?: boolean;
  /** Enable CTA shine animation wrapper */
  withShine?: boolean;
  /** Custom icon to display before text */
  icon?: React.ReactNode;
  /** Render as child component (for Link wrapping) */
  asChild?: boolean;
}

/**
 * Creates a ripple effect at click position
 * 
 * @param event - Mouse event from button click
 * @param button - Button element reference
 */
function createRipple(
  event: React.MouseEvent<HTMLButtonElement>,
  button: HTMLButtonElement
): void {
  // Calculate ripple position relative to button
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  // Create ripple element
  const ripple = document.createElement("span");
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.className = "ripple";

  // Add to button and remove after animation
  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      withRipple = true,
      withShine = false,
      icon,
      children,
      onClick,
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Handle click with optional ripple effect
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple && !asChild) {
        createRipple(event, event.currentTarget);
      }
      onClick?.(event);
    };

    const buttonClasses = cn(
      buttonVariants({ variant, size }),
      withRipple && !asChild && "ripple-container",
      className
    );

    // If asChild, render children with button styles
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(buttonClasses, (children as React.ReactElement<{ className?: string }>).props.className),
      });
    }

    // Base button element
    const buttonElement = (
      <button
        className={buttonClasses}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );

    // Wrap with shine effect if enabled
    if (withShine && variant === "default") {
      return <div className="cta-shine-wrap">{buttonElement}</div>;
    }

    return buttonElement;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
