/**
 * HowItWorksSection Component
 * 
 * Step-by-step explanation of the RAG process:
 * 1. Upload PDF
 * 2. AI Processing
 * 3. Ask Questions
 */

import { motion } from "framer-motion";
import { Upload, Cpu, MessageCircle, ArrowRight } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

// Step icons
const stepIcons = [Upload, Cpu, MessageCircle];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" className="text-center mb-16">
          <h2 className="heading-2 text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            Three simple steps to start chatting with your documents
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              const isLast = index === HOW_IT_WORKS_STEPS.length - 1;

              return (
                <ScrollReveal
                  key={step.step}
                  direction="up"
                  delay={index * 0.2}
                >
                  <div className="relative">
                    <GlassCard variant="hover" padding="lg" className="h-full">
                      <GlassCardContent className="text-center">
                        {/* Step number */}
                        <motion.div
                          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Step indicator */}
                        <div className="text-sm font-medium text-purple-400 mb-2">
                          Step {step.step}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-400">
                          {step.description}
                        </p>
                      </GlassCardContent>
                    </GlassCard>

                    {/* Arrow connector (mobile and tablet) */}
                    {!isLast && (
                      <div className="flex justify-center py-4 lg:hidden">
                        <ArrowRight className="w-6 h-6 text-purple-500/50 rotate-90" />
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Technical details */}
        <ScrollReveal direction="up" delay={0.6}>
          <GlassCard variant="default" className="mt-16" padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  LangChain
                </div>
                <div className="text-sm text-slate-400">
                  Document processing & RAG pipeline
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  FAISS
                </div>
                <div className="text-sm text-slate-400">
                  Vector similarity search
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  GPT-4o Mini
                </div>
                <div className="text-sm text-slate-400">
                  Answer generation
                </div>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </SectionWrapper>
  );
}
