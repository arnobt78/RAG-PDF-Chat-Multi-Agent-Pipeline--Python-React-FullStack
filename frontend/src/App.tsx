/**
 * App Component
 *
 * Root application component that sets up:
 * - Sentry ErrorBoundary for crash reporting
 * - React Router for navigation
 * - Global providers (ChatProvider)
 * - Route definitions
 *
 * Route map: ``/`` marketing shell, ``/chat`` interactive RAG UI, ``/about`` deeper copy.
 * Unknown paths fall back to Home (SPA-friendly).
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sentry } from "@/lib/sentry";
import { ChatProvider } from "@/context/chat-context";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { HomePage } from "@/pages/home";
import { ChatPage } from "@/pages/chat";
import { AboutPage } from "@/pages/about";
import { ApiStatusPage } from "@/pages/api-status";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
        <p className="text-white/90 mb-6">
          An unexpected error occurred. The issue has been reported
          automatically.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<AppFallback />} showDialog>
      <BrowserRouter>
        <TooltipProvider delayDuration={350}>
          <Toaster />
          <ScrollToTop />
          <ChatProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/api-status" element={<ApiStatusPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </AnimatePresence>
          </ChatProvider>
        </TooltipProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;
