/**
 * Footer Component
 *
 * Site footer with links, social media, and copyright information.
 * Glass-friendly area; columns ease-in-out with stagger when scrolled into view.
 */

import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import {
  APP_CONFIG,
  NAV_LINKS,
  SOCIAL_LINKS,
  TECH_STACK,
} from "@/lib/constants";

const footerStaggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.05,
    },
  },
};

const footerBlockVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.88,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

export function Footer() {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const isInView = useInView(rootRef, {
    once: false,
    amount: 0.12,
    margin: "0px 0px 16% 0px",
  });

  return (
    <footer ref={rootRef} className="relative mt-auto backdrop-blur-xs">
      <motion.div
        variants={footerStaggerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mx-auto grid max-w-9xl auto-rows-auto grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8"
      >
        {/* Brand */}
        <motion.div variants={footerBlockVariants} className="md:col-span-2">
          <Link to="/" className="mb-4 flex items-center gap-3">
            <img src="/logo.svg" alt="RAG PDF Chat" className="h-10 w-10" />
            <span className="text-xl font-medium text-white">
              {APP_CONFIG.name}
            </span>
          </Link>
          <p className="mb-4 max-w-md text-sm text-white/80">
            {APP_CONFIG.description}
          </p>

          <div className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-white"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-white"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div variants={footerBlockVariants}>
          <h3 className="mb-4 font-medium text-white">Navigation</h3>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tech stack */}
        <motion.div variants={footerBlockVariants}>
          <h3 className="mb-4 font-medium text-white">Built With</h3>
          <ul className="space-y-2">
            {TECH_STACK.slice(0, 5).map((tech) => (
              <li key={tech.name}>
                <span className="flex items-center gap-2 text-sm text-white/80">
                  {tech.name}
                  <span className="text-xs capitalize text-sky-500">
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
                className="flex items-center gap-1 text-sm text-purple-400 transition-colors hover:text-purple-300"
              >
                View Source
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          variants={footerBlockVariants}
          className="col-span-full mt-2 flex flex-col items-center justify-center border-t border-white/10 pt-6 sm:flex-row"
        >
          <span className="text-center text-sm text-white/70">
            &copy; {new Date().getFullYear()}. All rights reserved.
          </span>
        </motion.div>
      </motion.div>
    </footer>
  );
}
