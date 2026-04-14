/**
 * HeroSection Component
 *
 * Main hero section for the landing page with:
 * - Parallax content (unchanged)
 * - Pets / models-style staircase reveals (opacity 1 + clip-path), nested staggers
 * - Feature badges, CTA (slow opacity ease-in-out), trust stats
 */

import { useNavigate } from "react-router-dom";
import { motion, useTransform, useScroll } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Brain,
  Zap,
  ScanText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Root: orchestrates major blocks in order */
const heroStaggerRoot = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

/** Headline or body: two lines in sequence */
const heroLineGroup = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

/** Row of feature pills */
const heroPillStrip = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

/** Stat grid cells */
const heroStatStrip = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const heroStairItem = {
  hidden: {
    opacity: 1,
    x: -14,
    y: 8,
    clipPath: "inset(0 100% 0 0)",
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.56,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/** CTA block: matches models footer / how-it-works tech strip opacity ease */
const heroCtaReveal = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 1.85,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

export function HeroSection() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 900], [0, 54]);
  const contentOpacity = useTransform(scrollY, [0, 900], [1, 0.9]);

  return (
    <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative z-10 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 xl:py-8 text-center flex flex-col items-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          variants={heroStaggerRoot}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className="flex w-full flex-col items-center"
        >
          <motion.div variants={heroStairItem} className="mb-8 flex justify-center">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm bg-transparent border-white/15"
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            >
              AI-Powered Document Intelligence
            </Badge>
          </motion.div>

          <motion.h1
            variants={heroLineGroup}
            className="heading-1 text-white mb-6 text-balance space-y-1 sm:space-y-1.5"
          >
            <motion.span
              variants={heroStairItem}
              className="block hero-stair-line"
            >
              Chat with Your{" "}
              <span className="gradient-text">PDF Documents</span>
            </motion.span>
            <motion.span variants={heroStairItem} className="block hero-stair-line">
              Using AI
            </motion.span>
          </motion.h1>

          <motion.p
            variants={heroLineGroup}
            className="body-large max-w-3xl mx-auto mb-8 text-pretty"
          >
            <motion.span
              variants={heroStairItem}
              className="block hero-stair-copy-line"
            >
              Upload any PDF and instantly get accurate answers to your
              questions.
            </motion.span>
            <motion.span
              variants={heroStairItem}
              className="block hero-stair-copy-line"
            >
              Powered by Retrieval Augmented Generation for precise,
              context-aware responses using OpenRouter, Groq, Gemini,
              HuggingFace, and OpenAI.
            </motion.span>
          </motion.p>

          <motion.div
            variants={heroPillStrip}
            className="mb-10 flex max-w-3xl flex-wrap justify-center gap-3 mx-auto"
          >
            {[
              { icon: FileText, text: "PDF Analysis" },
              { icon: Brain, text: "AI Understanding" },
              { icon: Zap, text: "Instant Answers" },
            ].map((feature) => (
              <motion.div
                key={feature.text}
                variants={heroStairItem}
                className="hero-pet-badge"
              >
                <feature.icon className="w-4 h-4 text-purple-400" />
                {feature.text}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={heroCtaReveal} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <Button
                size="lg"
                className="shine-debug group w-full sm:w-auto sm:min-w-[200px] rounded-[8rem] border border-white/30 !bg-[linear-gradient(90deg,#7e22ce_0%,#2563eb_45%,#0284c7_100%)] font-medium"
                onClick={() => navigate("/chat")}
              >
                <span className="inline-flex items-center gap-2 md:gap-2.5">
                  <ScanText className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="md:hidden">Let's Get Started</span>
                  <span className="hidden md:inline">
                    Let's Get Started - Scrape & Chat Your First Document
                  </span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={heroStatStrip}
            className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto w-full max-[height:860px]:mt-6 max-[height:860px]:gap-2"
          >
            {[
              { value: "100%", label: "Open Source" },
              { value: "< 2s", label: "Response Time" },
              { value: "50MB", label: "Max File Size" },
              { value: "RAG", label: "Powered" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={heroStairItem}
                className="text-center"
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1 hero-stat-value">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/90 leading-tight hero-stat-label">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
