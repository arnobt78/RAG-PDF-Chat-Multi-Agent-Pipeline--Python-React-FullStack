/**
 * App Component
 *
 * Root application component that sets up:
 * - React Router for navigation
 * - Global providers (ChatProvider)
 * - Route definitions
 *
 * This is a Single Page Application (SPA) with client-side routing.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ChatProvider } from "@/context/chat-context";
import { HomePage } from "@/pages/home";
import { ChatPage } from "@/pages/chat";
import { AboutPage } from "@/pages/about";

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AnimatePresence>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
