/**
 * PipelineSection Component
 *
 * Visual representation of the 7-agent RAG pipeline architecture.
 * Shows each agent as a step with animated connectors.
 */

import * as React from "react";
import { motion, useInView } from "framer-motion";
import {
  Download,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Brain,
  ShieldCheck,
  Package,
  ArrowDown,
  Workflow,
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

const pipelineSteps = [
  {
    name: "Extractor",
    description:
      "Retrieves the most relevant document chunks from the FAISS vector store using similarity search.",
    icon: Download,
    color: "from-blue-500 to-cyan-500",
    badge: "Retrieval",
  },
  {
    name: "Analyzer",
    description:
      "Filters out low-quality and duplicate chunks; scores remaining chunks for relevance.",
    icon: Filter,
    color: "from-cyan-500 to-teal-500",
    badge: "Quality",
  },
  {
    name: "Preprocessor",
    description:
      "Normalizes unicode, collapses whitespace, and trims excessively long chunks for consistency.",
    icon: Sparkles,
    color: "from-teal-500 to-emerald-500",
    badge: "Clean",
  },
  {
    name: "Optimizer",
    description:
      "Reorders chunks by estimated relevance and trims context to fit the token budget.",
    icon: SlidersHorizontal,
    color: "from-emerald-500 to-green-500",
    badge: "Optimize",
  },
  {
    name: "Synthesizer",
    description:
      "Generates a comprehensive answer using the LLM based on optimized context and question.",
    icon: Brain,
    color: "from-purple-500 to-violet-500",
    badge: "Generate",
  },
  {
    name: "Validator",
    description:
      "Quality-checks the generated answer for length, coherence, and uncertainty markers.",
    icon: ShieldCheck,
    color: "from-violet-500 to-pink-500",
    badge: "Verify",
  },
  {
    name: "Assembler",
    description:
      "Packages the final answer with source citations, model metadata, and pipeline telemetry.",
    icon: Package,
    color: "from-pink-500 to-rose-500",
    badge: "Output",
  },
];

const PIPELINE_STEP_COUNT = pipelineSteps.length;
const PIPELINE_ROW_STAGGER_S = 0.09;

type PipelineStep = (typeof pipelineSteps)[number];

const pipelineRowReveal = {
  hidden: (index: number) => ({
    opacity: 1,
    x: -10,
    y: 8,
    rotate: index % 2 === 0 ? -0.55 : -0.25,
    clipPath: "inset(0 100% 0 0)",
    transition: {
      duration: 0.55,
      delay: (PIPELINE_STEP_COUNT - 1 - index) * PIPELINE_ROW_STAGGER_S,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.72,
      delay: index * PIPELINE_ROW_STAGGER_S,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function PipelineStepRow({
  step,
  index,
  isLast,
}: {
  step: PipelineStep;
  index: number;
  isLast: boolean;
}) {
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(rowRef, {
    once: false,
    amount: 0.22,
    margin: "0px 0px -8% 0px",
  });

  return (
    <div ref={rowRef} className="relative flex items-start gap-3 sm:gap-6">
      {/* Step number + icon column */}
      <div className="flex flex-col items-center shrink-0 w-12 sm:w-16">
        <motion.div
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-transparent backdrop-blur-[2px] border border-white/15 flex items-center justify-center shadow-lg shadow-black/20"
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <step.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
        </motion.div>

        {!isLast && (
          <div className="flex flex-col items-center">
            <div className="w-px h-6 sm:h-8 bg-white/20" />
            <ArrowDown className="w-4 h-4 text-white/35 border-2 border-white/15 rounded-full" />
            <div className="w-px h-6 sm:h-8 bg-white/12" />
          </div>
        )}
      </div>

      {/* Shadow on outer wrapper so clip-path on inner motion does not clip the glow */}
      <div className="flex-1 min-w-0 rounded-[20px] shadow-glass transition-[box-shadow,transform] duration-300 hover:shadow-glass-lg">
        <motion.div
          className="rounded-[20px]"
          custom={index}
          variants={pipelineRowReveal}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <GlassCard
            variant="hover"
            padding="default"
            className="h-full border-white/10 shadow-none hover:shadow-none"
          >
            <GlassCardContent>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {step.name}
                </h3>
                <Badge variant="outline" size="sm">
                  {step.badge}
                </Badge>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                {step.description}
              </p>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

export function PipelineSection() {
  return (
    <SectionWrapper id="pipeline">
      <div className="text-center mb-8 md:mb-10 xl:mb-12">
        <ScrollReveal direction="up">
          <Badge
            variant="default"
            className="mb-4"
            icon={<Workflow className="w-3.5 h-3.5" />}
          >
            Multi-Agent Architecture
          </Badge>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.08}>
          <h2 className="heading-2 text-white mb-4">
            7-Agent <span className="gradient-text">RAG Pipeline</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.14}>
          <p className="body-large max-w-3xl mx-auto">
            Every question passes through a production-grade pipeline of
            specialized AI agents, each responsible for a single task.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative flex w-full max-w-4xl flex-col gap-5 mx-auto px-2 sm:px-4">
        {pipelineSteps.map((step, index) => {
          const isLast = index === pipelineSteps.length - 1;

          return (
            <PipelineStepRow
              key={step.name}
              step={step}
              index={index}
              isLast={isLast}
            />
          );
        })}
      </div>
    </SectionWrapper>
  );
}
