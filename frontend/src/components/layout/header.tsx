/**
 * Header Component
 *
 * Main navigation header with logo, navigation links, mobile menu,
 * and live backend health indicator.
 */

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, MessageSquare, Info, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { useHealth } from "@/hooks/use-health";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();
  const { status } = useHealth();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const healthColor =
    status === "connected"
      ? "bg-emerald-400"
      : status === "disconnected"
        ? "bg-red-400"
        : "bg-yellow-400 animate-pulse";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-lg border-b border-white/10 shadow-lg"
          : "bg-transparent",
      )}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img src="/logo.svg" alt="RAG PDF Chat" className="h-8 w-8 sm:h-10 sm:w-10" />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              RAG PDF Chat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              const iconMap: Record<string, typeof FileText> = {
                "/": FileText,
                "/chat": MessageSquare,
                "/about": Info,
              };
              const Icon = iconMap[link.href] ?? FileText;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive ? "text-purple-400" : "text-slate-300 hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Health dot */}
            <div className="flex items-center gap-1.5" title={`Backend: ${status}`}>
              <span className={cn("w-2 h-2 rounded-full", healthColor)} />
              <span className="text-xs text-slate-500 hidden lg:inline">
                {status === "connected" ? "Online" : status === "disconnected" ? "Offline" : "..."}
              </span>
            </div>

            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>

            <Button variant="default" size="sm" withShine asChild>
              <Link to="/chat">Start Chatting</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-lg border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.href;
                const mobileIconMap: Record<string, typeof FileText> = {
                  "/": FileText,
                  "/chat": MessageSquare,
                  "/about": Info,
                };
                const Icon = mobileIconMap[link.href] ?? FileText;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Health status in mobile menu */}
              <div className="flex items-center gap-2 px-4 py-2">
                <span className={cn("w-2 h-2 rounded-full", healthColor)} />
                <span className="text-xs text-slate-400">
                  Backend {status === "connected" ? "online" : status === "disconnected" ? "offline" : "checking..."}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10">
                <Button variant="default" className="w-full" withShine asChild>
                  <Link to="/chat">Start Chatting</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
