/**
 * HowItWorksSection Component
 *
 * Step-by-step explanation of the RAG process:
 * 1. Upload PDF (enters from left)
 * 2. AI Processing (enters from bottom)
 * 3. Ask Questions (enters from right)
 *
 * Bottom tech strip: slow opacity ease-in-out reveal.
 */

import { motion } from "framer-motion";
import { Upload, Cpu, MessageCircle, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const stepIcons: LucideIcon[] = [Upload, Cpu, MessageCircle];

const stepIconGradients = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
];

/** Index 0: from left, 1: from bottom, 2: from right — opacity 1 throughout */
const stepCardVariants = {
  hidden: (index: number) => ({
    opacity: 1,
    x: index === 0 ? -56 : index === 2 ? 56 : 0,
    y: index === 1 ? 52 : 0,
    transition: {
      duration: 0.42,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.78,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const techStripVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.85,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden" />
      </div>

      <div className="relative z-10 w-full">
        <div className="mb-8 text-center md:mb-10 xl:mb-12">
          <ScrollReveal direction="up">
            <h2 className="heading-2 mb-4 text-white">
              How It <span className="gradient-text">Works</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.08}>
            <p className="body-large mx-auto max-w-3xl">
              Three simple steps to start chatting with your documents
            </p>
          </ScrollReveal>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-white/15 lg:block" />

          <div className="grid grid-cols-1 gap-5 px-1 sm:gap-8 sm:px-0 lg:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              const isLast = index === HOW_IT_WORKS_STEPS.length - 1;
              const gradient = stepIconGradients[index % stepIconGradients.length];

              return (
                <motion.div
                  key={step.step}
                  custom={index}
                  variants={stepCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.28, margin: "0px 0px -8% 0px" }}
                  className="min-w-0"
                >
                  <div className="relative">
                    <GlassCard variant="hover" padding="lg" className="h-full">
                      <GlassCardContent className="text-center">
                        <motion.div
                          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center"
                          whileHover={{ scale: 1.06, rotate: 4 }}
                          transition={{ type: "spring", stiffness: 320 }}
                        >
                          <div
                            className={`h-full w-full rounded-full bg-gradient-to-br ${gradient} p-[1.5px] shadow-lg shadow-black/25`}
                          >
                            <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-slate-950/80 backdrop-blur-sm">
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </motion.div>

                        <div className="mb-2 text-sm font-medium text-purple-400">
                          Step {step.step}
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                        <p className="text-white/90">{step.description}</p>
                      </GlassCardContent>
                    </GlassCard>

                    {!isLast && (
                      <div className="flex justify-center py-4 lg:hidden">
                        <ArrowRight className="h-6 w-6 rotate-90 text-purple-500/50" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          variants={techStripVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.35, margin: "0px 0px -10% 0px" }}
          className="mt-8 md:mt-10 xl:mt-12"
        >
          <GlassCard variant="default" padding="lg">
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
              <div>
                <div className="mb-1 text-2xl font-bold text-white">LangChain</div>
                <div className="text-sm text-white/90">
                  Document processing & RAG pipeline
                </div>
              </div>
              <div>
                <div className="mb-1 text-2xl font-bold text-white">FAISS</div>
                <div className="text-sm text-white/90">
                  Vector similarity search
                </div>
              </div>
              <div>
                <div className="mb-1 text-2xl font-bold text-white">
                  Multi-Model AI
                </div>
                <div className="text-sm text-white/90">Answer generation</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
