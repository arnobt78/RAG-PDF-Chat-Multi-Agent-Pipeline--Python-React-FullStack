/**
 * HeroSection Component
 *
 * Main hero section for the landing page with:
 * - Animated headline and subtitle
 * - Feature badges
 * - CTA buttons
 * - Background effects
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="hidden"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="hidden"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 xl:py-8 text-center">
        {/* Top badge */}
        <ScrollReveal direction="down" delay={0}>
          <div className="flex justify-center mb-8">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm bg-transparent backdrop-blur-[2px] border-white/15"
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            >
              AI-Powered Document Intelligence
            </Badge>
          </div>
        </ScrollReveal>

        {/* Main headline */}
        <ScrollReveal direction="up" delay={0.1}>
          <h1 className="heading-1 text-white mb-6 text-balance">
            Chat with Your <span className="gradient-text">PDF Documents</span>
            <br />
            Using AI
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal direction="up" delay={0.2}>
          <p className="body-large max-w-2xl mx-auto mb-8 text-pretty">
            Upload any PDF and instantly get accurate answers to your questions.
            Powered by Retrieval Augmented Generation for precise, context-aware
            responses.
          </p>
        </ScrollReveal>

        {/* Feature pills */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl mx-auto">
            {[
              { icon: FileText, text: "PDF Analysis" },
              { icon: Brain, text: "AI Understanding" },
              { icon: Zap, text: "Instant Answers" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent backdrop-blur-[2px] border border-white/15 text-sm text-slate-200"
              >
                <feature.icon className="w-4 h-4 text-purple-400" />
                {feature.text}
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <Button
              size="lg"
              withShine
              className="group w-full sm:w-auto sm:min-w-[200px] border-2 border-white/20 rounded-[8rem]"
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
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto max-[height:860px]:mt-6 max-[height:860px]:gap-2">
            {[
              { value: "100%", label: "Open Source" },
              { value: "< 2s", label: "Response Time" },
              { value: "50MB", label: "Max File Size" },
              { value: "RAG", label: "Powered" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
