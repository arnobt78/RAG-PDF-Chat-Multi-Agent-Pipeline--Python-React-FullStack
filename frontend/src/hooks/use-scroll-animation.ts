/**
 * useScrollAnimation Hook
 * 
 * Custom hook for scroll-based animations and parallax effects.
 * Uses Intersection Observer for performance.
 * 
 * Usage:
 * const { ref, isInView, scrollY } = useScrollAnimation();
 */

import * as React from "react";

interface UseScrollAnimationOptions {
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Root margin for intersection */
  rootMargin?: string;
  /** Trigger only once */
  once?: boolean;
}

interface UseScrollAnimationReturn<T extends HTMLElement> {
  /** Ref to attach to the element */
  ref: React.RefObject<T>;
  /** Whether element is in view */
  isInView: boolean;
  /** Current scroll progress (0-1) for the element */
  scrollProgress: number;
}

/**
 * Hook for scroll-based animations
 * 
 * @param options - Configuration options
 * @returns Ref and animation state
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn<T> {
  const { threshold = 0.1, rootMargin = "-100px", once = true } = options;

  const ref = React.useRef<T>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const hasTriggered = React.useRef(false);

  // Intersection Observer for visibility
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasTriggered.current) return;
          setIsInView(true);
          hasTriggered.current = true;
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  // Scroll progress calculation
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress from element entering view to leaving
      const start = windowHeight;
      const end = -rect.height;
      const current = rect.top;

      const progress = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, isInView, scrollProgress };
}

/**
 * useParallax Hook
 * 
 * Simpler hook for parallax effects based on scroll position.
 */
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return offset;
}
