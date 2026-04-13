/**
 * HeroSection Component
 * 
 * Main hero section for the landing page with:
 * - Animated headline and subtitle
 * - Feature badges
 * - CTA buttons
 * - Background effects
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Brain,
  Zap,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SOCIAL_LINKS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
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
      <div className="relative z-10 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Top badge */}
        <ScrollReveal direction="down" delay={0}>
          <div className="flex justify-center mb-8">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm bg-white/5 backdrop-blur-sm"
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            >
              AI-Powered Document Intelligence
            </Badge>
          </div>
        </ScrollReveal>

        {/* Main headline */}
        <ScrollReveal direction="up" delay={0.1}>
          <h1 className="heading-1 text-white mb-6">
            Chat with Your{" "}
            <span className="gradient-text">PDF Documents</span>
            <br />
            Using AI
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal direction="up" delay={0.2}>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Upload any PDF and instantly get accurate answers to your questions.
            Powered by Retrieval Augmented Generation for precise, context-aware responses.
          </p>
        </ScrollReveal>

        {/* Feature pills */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300"
              >
                <feature.icon className="w-4 h-4 text-purple-400" />
                {feature.text}
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              withShine
              className="min-w-[200px]"
              icon={<ArrowRight className="w-5 h-5" />}
              asChild
            >
              <Link to="/chat">Start Chatting</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px]"
              icon={<Github className="w-5 h-5" />}
              asChild
            >
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source
              </a>
            </Button>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
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
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
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
