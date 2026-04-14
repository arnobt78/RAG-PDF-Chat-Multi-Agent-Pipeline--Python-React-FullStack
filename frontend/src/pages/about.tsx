/**
 * About Page
 *
 * Detailed information about the project architecture, the multi-agent
 * pipeline, and the technologies used.
 */

import { motion } from "framer-motion";
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
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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

export function AboutPage() {
  return (
    <PageWrapper showBackground showFooter className="w-full overflow-x-clip">
      <SectionWrapper>
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-16">
          <Badge
            variant="default"
            className="mb-4"
            icon={<BookOpen className="w-3 h-3" />}
          >
            Project Deep Dive
          </Badge>
          <h1 className="heading-1 text-white mb-6">
            About <span className="gradient-text">{APP_CONFIG.name}</span>
          </h1>
          <p className="body-large max-w-3xl mx-auto">
            An open-source showcase of Retrieval Augmented Generation built with
            a real-world multi-agent pipeline, multi-model support, and a
            production-ready deployment setup.
          </p>
        </ScrollReveal>

        {/* Architecture Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 md:mb-12 xl:mb-16">
          {architectureHighlights.map((item, index) => (
            <ScrollReveal key={item.title} direction="up" delay={index * 0.08}>
              <GlassCard variant="hover" padding="lg" className="h-full">
                <GlassCardContent>
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-5"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <item.icon className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {item.description}
                  </p>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Source link */}
        <ScrollReveal direction="up">
          <GlassCard variant="default" padding="lg" className="text-center">
            <GlassCardContent>
              <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Open Source
              </h2>
              <p className="text-white/90 text-sm mb-4 max-w-md mx-auto">
                Explore the full source code, file an issue, or contribute on
                GitHub.
              </p>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all"
              >
                <GitBranch className="w-4 h-4" />
                View on GitHub
              </a>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </SectionWrapper>
    </PageWrapper>
  );
}

export default AboutPage;
