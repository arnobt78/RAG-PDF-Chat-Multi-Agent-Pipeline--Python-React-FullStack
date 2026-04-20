import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function scrollWindowToTopSmooth() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });
}

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
    return undefined;
  }, []);

  useLayoutEffect(() => {
    scrollWindowToTopSmooth();
  }, [pathname]);

  return null;
}
