/**
 * HeroSection Component
 *
 * Main hero section for the landing page with:
 * - Animated headline and subtitle
 * - Feature badges
 * - CTA buttons
 */

import { useNavigate } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
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
import * as React from "react";

const stackVariants = {
  hidden: {},
  show: (direction: "up" | "down") => {
    const down = direction === "down";
    return {
      transition: {
        staggerChildren: 0.12,
        staggerDirection: down ? 1 : -1,
        delayChildren: 0.03,
      },
    };
  },
};

const itemVariants = {
  hidden: (direction: "up" | "down") => ({
    opacity: 0,
    y: direction === "down" ? 20 : -20,
  }),
  show: (_direction: "up" | "down") => {
    return {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    };
  },
};

export function HeroSection() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [direction, setDirection] = React.useState<"up" | "down">("down");

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? current;
    if (current === previous) return;
    setDirection(current > previous ? "down" : "up");
  });

  return (
    <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative z-10 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 xl:py-8 text-center"
        custom={direction}
        variants={stackVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        <motion.div custom={direction} variants={itemVariants}>
          <div className="flex justify-center mb-8">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm bg-transparent backdrop-blur-[2px] border-white/15"
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            >
              AI-Powered Document Intelligence
            </Badge>
          </div>
        </motion.div>

        <motion.div custom={direction} variants={itemVariants}>
          <h1 className="heading-1 text-white mb-6 text-balance">
            Chat with Your <span className="gradient-text">PDF Documents</span>
            <br />
            Using AI
          </h1>
        </motion.div>

        <motion.div custom={direction} variants={itemVariants}>
          <p className="body-large max-w-2xl mx-auto mb-8 text-pretty">
            Upload any PDF and instantly get accurate answers to your questions.
            Powered by Retrieval Augmented Generation for precise, context-aware
            responses.
          </p>
        </motion.div>

        <motion.div custom={direction} variants={itemVariants}>
          <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl mx-auto">
            {[
              { icon: FileText, text: "PDF Analysis" },
              { icon: Brain, text: "AI Understanding" },
              { icon: Zap, text: "Instant Answers" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                custom={direction}
                variants={itemVariants}
                animate={{ y: [0, -3, 0, 3, 0] }}
                whileInView={{ y: [0, -3, 0, 3, 0] }}
                viewport={{ once: false, amount: 0.4 }}
                style={{ willChange: "transform" }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  y: {
                    duration: 4 + index * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent backdrop-blur-[2px] border border-white/15 text-sm text-white/90"
              >
                <feature.icon className="w-4 h-4 text-purple-400" />
                {feature.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
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

        {/* State Trust indicators */}
        <motion.div custom={direction} variants={itemVariants}>
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto max-[height:860px]:mt-6 max-[height:860px]:gap-2">
            {[
              { value: "100%", label: "Open Source" },
              { value: "< 2s", label: "Response Time" },
              { value: "50MB", label: "Max File Size" },
              { value: "RAG", label: "Powered" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                custom={direction}
                variants={itemVariants}
                animate={{ y: [0, -2, 0, 2, 0] }}
                whileInView={{ y: [0, -2, 0, 2, 0] }}
                viewport={{ once: false, amount: 0.4 }}
                style={{ willChange: "transform" }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  y: {
                    duration: 4.5 + index * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="text-center"
              >
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/90 leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
