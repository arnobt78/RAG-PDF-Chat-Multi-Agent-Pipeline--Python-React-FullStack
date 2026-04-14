import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on every pathname change.
 *
 * Uses a temporary `scroll-behavior: auto` override because `globals.css`
 * sets `html { scroll-behavior: smooth }`, which otherwise lets smooth
 * scroll-to-top get interrupted when the DOM swaps to a shorter route (e.g.
 * Home → Chat), leaving the viewport off the top.
 */
function scrollWindowToTopImmediate() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    html.style.scrollBehavior = previous;
  });
}

export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    scrollWindowToTopImmediate();
  }, [pathname]);

  return null;
}
