/**
 * PipelineSection Component
 *
 * Visual representation of the 7-agent RAG pipeline architecture.
 * Shows each agent as a step with animated connectors.
 */

import { motion } from "framer-motion";
import {
  Download,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Brain,
  ShieldCheck,
  Package,
  ArrowDown,
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

const pipelineSteps = [
  {
    name: "Extractor",
    description: "Retrieves the most relevant document chunks from the FAISS vector store using similarity search.",
    icon: Download,
    color: "from-blue-500 to-cyan-500",
    badge: "Retrieval",
  },
  {
    name: "Analyzer",
    description: "Filters out low-quality and duplicate chunks; scores remaining chunks for relevance.",
    icon: Filter,
    color: "from-cyan-500 to-teal-500",
    badge: "Quality",
  },
  {
    name: "Preprocessor",
    description: "Normalizes unicode, collapses whitespace, and trims excessively long chunks for consistency.",
    icon: Sparkles,
    color: "from-teal-500 to-emerald-500",
    badge: "Clean",
  },
  {
    name: "Optimizer",
    description: "Reorders chunks by estimated relevance and trims context to fit the token budget.",
    icon: SlidersHorizontal,
    color: "from-emerald-500 to-green-500",
    badge: "Optimize",
  },
  {
    name: "Synthesizer",
    description: "Generates a comprehensive answer using the LLM based on optimized context and question.",
    icon: Brain,
    color: "from-purple-500 to-violet-500",
    badge: "Generate",
  },
  {
    name: "Validator",
    description: "Quality-checks the generated answer for length, coherence, and uncertainty markers.",
    icon: ShieldCheck,
    color: "from-violet-500 to-pink-500",
    badge: "Verify",
  },
  {
    name: "Assembler",
    description: "Packages the final answer with source citations, model metadata, and pipeline telemetry.",
    icon: Package,
    color: "from-pink-500 to-rose-500",
    badge: "Output",
  },
];

export function PipelineSection() {
  return (
    <SectionWrapper id="pipeline">
      <ScrollReveal direction="up" className="text-center mb-16">
        <Badge variant="default" className="mb-4">
          Multi-Agent Architecture
        </Badge>
        <h2 className="heading-2 text-white mb-4">
          7-Agent <span className="gradient-text">RAG Pipeline</span>
        </h2>
        <p className="body-large max-w-2xl mx-auto">
          Every question passes through a production-grade pipeline of
          specialized AI agents, each responsible for a single task.
        </p>
      </ScrollReveal>

      <div className="relative max-w-3xl mx-auto">
        {pipelineSteps.map((step, index) => {
          const isLast = index === pipelineSteps.length - 1;

          return (
            <ScrollReveal
              key={step.name}
              direction="up"
              delay={index * 0.08}
            >
              <div className="relative flex items-start gap-6 mb-2">
                {/* Step number + icon column */}
                <div className="flex flex-col items-center shrink-0 w-16">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {!isLast && (
                    <motion.div
                      className="flex flex-col items-center py-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <ArrowDown className="w-4 h-4 text-white/30" />
                    </motion.div>
                  )}
                </div>

                {/* Content card */}
                <GlassCard variant="hover" padding="default" className="flex-1">
                  <GlassCardContent>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold text-white">
                        {step.name}
                      </h3>
                      <Badge variant="outline" size="sm">
                        {step.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </GlassCardContent>
                </GlassCard>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
