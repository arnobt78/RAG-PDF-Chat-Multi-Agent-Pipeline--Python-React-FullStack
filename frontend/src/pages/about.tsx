/**
 * About Page
 *
 * Detailed information about the project architecture, the multi-agent
 * pipeline, and the technologies used.
 *
 * Mostly static educational JSX — good place for readers to understand design decisions.
 */

import * as React from "react";
import { motion, useInView } from "framer-motion";
import {
  GitBranch,
  Layers,
  Shield,
  Cpu,
  Database,
  Globe,
  Code2,
  BookOpen,
} from "lucide-react";
import { PageWrapper, SectionWrapper } from "@/components/layout/page-wrapper";
import { CTASection } from "@/components/sections";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG, SOCIAL_LINKS } from "@/lib/constants";

const architectureHighlights = [
  {
    icon: Layers,
    title: "7-Agent Pipeline",
    description:
      "Every question flows through Extractor, Analyzer, Preprocessor, Optimizer, Synthesizer, Validator, and Assembler agents for production-grade reliability.",
  },
  {
    icon: Globe,
    title: "Multi-Provider Fallback",
    description:
      "Automatically switches between OpenRouter, Groq, and OpenAI when a provider is unavailable, ensuring maximum uptime.",
  },
  {
    icon: Database,
    title: "FAISS Vector Store",
    description:
      "Facebook AI Similarity Search enables sub-millisecond retrieval across millions of document chunks.",
  },
  {
    icon: Shield,
    title: "Validation Layer",
    description:
      "The Validator agent checks every generated answer for length, coherence, and uncertainty before it reaches the user.",
  },
  {
    icon: Code2,
    title: "TypeScript + FastAPI",
    description:
      "End-to-end type safety from the React frontend through Pydantic models in the Python backend.",
  },
  {
    icon: Cpu,
    title: "Docker Ready",
    description:
      "Production Dockerfile with non-root user, health checks, and layer-cached dependency installation.",
  },
];

const highlightIconGradients = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
];

const aboutShellReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.78,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const aboutHeaderStagger = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.08,
    },
  },
};

const aboutLineFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.72,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const highlightCardVariants = {
  hidden: (index: number) => ({
    opacity: 1,
    y: 18,
    transition: {
      duration: 0.38,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const highlightContentStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const highlightRowReveal = {
  hidden: {
    opacity: 1,
    x: -14,
    y: 6,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
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

function ArchitectureCard({
  item,
  index,
}: {
  item: (typeof architectureHighlights)[number];
  index: number;
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardRef, {
    once: false,
    amount: 0.28,
    margin: "0px 0px -8% 0px",
  });

  const iconGradient =
    highlightIconGradients[index % highlightIconGradients.length];

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={highlightCardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="min-w-0"
    >
      <GlassCard variant="hover" padding="lg" className="h-full">
        <GlassCardContent>
          <motion.div
            variants={highlightContentStagger}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              variants={highlightRowReveal}
              className="mb-5 w-fit"
              whileHover={{ rotate: 4, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 320 }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} p-[1px] shadow-lg shadow-black/25`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-[11px] border border-white/10 bg-slate-950/80 backdrop-blur-sm">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h3
              variants={highlightRowReveal}
              className="mb-2 text-lg font-semibold text-white"
            >
              {item.title}
            </motion.h3>
            <motion.p
              variants={highlightRowReveal}
              className="text-sm leading-relaxed text-white/90"
            >
              {item.description}
            </motion.p>
          </motion.div>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}

export function AboutPage() {
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const sourceRef = React.useRef<HTMLDivElement | null>(null);

  const headerInView = useInView(headerRef, {
    once: false,
    amount: 0.25,
    margin: "0px 0px 14% 0px",
  });
  const sourceInView = useInView(sourceRef, {
    once: false,
    amount: 0.32,
    margin: "0px 0px -12% 0px",
  });

  return (
    <PageWrapper showBackground showFooter className="w-full overflow-x-clip">
      <SectionWrapper>
        {/* Header */}
        <div ref={headerRef} className="mx-auto mb-16 max-w-5xl">
          <motion.div
            variants={aboutShellReveal}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="rounded-[28px] shadow-glass-lg shadow-purple-500/20"
          >
            <GlassCard
              variant="default"
              radius="lg"
              padding="lg"
              className="border-white/15 !shadow-none text-center"
            >
              <GlassCardContent>
                <motion.div
                  variants={aboutHeaderStagger}
                  initial="hidden"
                  animate={headerInView ? "visible" : "hidden"}
                  className="flex flex-col items-center"
                >
                  <motion.div variants={aboutLineFade}>
                    <Badge
                      variant="default"
                      className="mb-4"
                      icon={<BookOpen className="w-3 h-3" />}
                    >
                      Project Deep Dive
                    </Badge>
                  </motion.div>
                  <motion.h1
                    variants={aboutLineFade}
                    className="heading-1 mb-6 text-white"
                  >
                    About{" "}
                    <span className="gradient-text">{APP_CONFIG.name}</span>
                  </motion.h1>
                  <motion.p
                    variants={aboutLineFade}
                    className="body-large mx-auto max-w-3xl"
                  >
                    An open-source showcase of Retrieval Augmented Generation
                    built with a real-world multi-agent pipeline, multi-model
                    support, and a production-ready deployment setup.
                  </motion.p>
                </motion.div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </div>

        {/* Architecture Highlights */}
        <div className="mb-10 grid grid-cols-1 gap-4 px-1 sm:mb-12 sm:gap-6 sm:px-0 md:grid-cols-2 xl:mb-16 lg:grid-cols-3">
          {architectureHighlights.map((item, index) => (
            <ArchitectureCard key={item.title} item={item} index={index} />
          ))}
        </div>

        {/* Source link */}
        <div ref={sourceRef} className="mx-auto max-w-4xl">
          <motion.div
            variants={aboutShellReveal}
            initial="hidden"
            animate={sourceInView ? "visible" : "hidden"}
            className="rounded-[28px] shadow-glass-lg shadow-purple-500/25"
          >
            <GlassCard
              variant="default"
              radius="lg"
              padding="lg"
              className="border-white/15 !shadow-none text-center"
            >
              <GlassCardContent>
                <motion.div
                  variants={aboutHeaderStagger}
                  initial="hidden"
                  animate={sourceInView ? "visible" : "hidden"}
                >
                  <motion.div variants={aboutLineFade}>
                    <GitBranch className="mx-auto mb-4 h-8 w-8 text-purple-400" />
                  </motion.div>
                  <motion.h2
                    variants={aboutLineFade}
                    className="mb-2 text-xl font-semibold text-white"
                  >
                    Open Source
                  </motion.h2>
                  <motion.p
                    variants={aboutLineFade}
                    className="mx-auto mb-4 max-w-md text-sm text-white/90"
                  >
                    Explore the full source code, file an issue, or contribute
                    on GitHub.
                  </motion.p>
                  <motion.a
                    variants={aboutLineFade}
                    href={SOCIAL_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
                  >
                    <GitBranch className="w-4 h-4" />
                    View on GitHub
                  </motion.a>
                </motion.div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </div>
      </SectionWrapper>

      <CTASection />
    </PageWrapper>
  );
}

export default AboutPage;
