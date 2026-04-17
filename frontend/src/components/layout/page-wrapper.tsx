/**
 * PageWrapper Component
 *
 * Consistent page layout wrapper with:
 * - Background image/pattern
 * - Overlay gradient
 * - Max width container
 * - Header spacing
 *
 * Usage:
 * <PageWrapper>
 *   <YourPageContent />
 * </PageWrapper>
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Footer } from "./footer";

export interface PageWrapperProps {
  children: React.ReactNode;
  /** Show the background pattern/image */
  showBackground?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Additional className for the main content area */
  className?: string;
  /** Disable page transition animation */
  noAnimation?: boolean;
  /**
   * When true (default), root uses overflow-x-clip to avoid horizontal scroll bleed.
   * Set false on pages with large outer box-shadows (e.g. chat) so glows are not clipped.
   */
  clipHorizontal?: boolean;
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 1,
    y: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

export function PageWrapper({
  children,
  showBackground = true,
  showFooter = true,
  className,
  noAnimation = false,
  clipHorizontal = true,
}: PageWrapperProps) {
  const content = <main className={cn("flex-1", className)}>{children}</main>;

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col relative",
        clipHorizontal ? "overflow-x-clip" : "overflow-x-visible",
        showBackground && "bg-pattern",
      )}
    >
      {/* Header */}
      <Header />

      {/* Main Content with Animation */}
      {noAnimation ? (
        content
      ) : (
        <motion.div
          className="flex-1 flex flex-col"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          {content}
        </motion.div>
      )}

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}

/**
 * SectionWrapper Component
 *
 * Consistent section container with max-width and padding.
 */
export interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({
  children,
  className,
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 xl:py-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
