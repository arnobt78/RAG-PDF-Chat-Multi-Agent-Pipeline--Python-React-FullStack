import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position on navigation and load.
 * - First paint (including hard refresh): instant jump to top so the view starts at the hero.
 * - In-app route changes: smooth scroll to top.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstPaint = useRef(true);

  useLayoutEffect(() => {
    if (isFirstPaint.current) {
      isFirstPaint.current = false;
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
