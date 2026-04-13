/**
 * Footer Component
 * 
 * Site footer with links, social media, and copyright information.
 * Features glassmorphism styling consistent with the overall design.
 */

import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Heart, ExternalLink } from "lucide-react";
import { APP_CONFIG, NAV_LINKS, SOCIAL_LINKS, TECH_STACK } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/logo.svg"
                alt="RAG PDF Chat"
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-white">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-4 max-w-md">
              {APP_CONFIG.description}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-semibold mb-4">Built With</h3>
            <ul className="space-y-2">
              {TECH_STACK.slice(0, 5).map((tech) => (
                <li key={tech.name}>
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    {tech.name}
                    <span className="text-xs text-purple-400 capitalize">
                      ({tech.category})
                    </span>
                  </span>
                </li>
              ))}
              <li>
                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
                >
                  View Source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center sm:text-left">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by{" "}
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {APP_CONFIG.author}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
