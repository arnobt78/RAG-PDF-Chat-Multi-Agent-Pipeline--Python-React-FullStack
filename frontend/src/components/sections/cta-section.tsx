/**
 * CTASection Component
 *
 * Call-to-action with: glass card + outer glow, shell ease-in-out fade,
 * staggered line fades, CTA button (sparkles + ripple + shine-debug like hero).
 */

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { SectionWrapper } from "@/components/layout/page-wrapper";

const ctaCardShellVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.95,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const ctaContentStaggerVariants = {
  hidden: {},
  visible: {
    transition: {
      /** Shorter wait than before so lines follow the shell sooner (same easing). */
      delayChildren: 0.52,
      staggerChildren: 0.1,
    },
  },
};

const ctaLineFadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.95,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

/** One stagger slot in the main column, then three trust lines one by one */
const trustRowStaggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.04,
    },
  },
};

const trustItems: { label: string; className: string }[] = [
  {
    label: "No signup required",
    className:
      "rounded-full border border-cyan-400/30 bg-white/[0.06] px-4 py-2 shadow-[0_0_26px_rgba(34,211,238,0.32)]",
  },
  {
    label: "100% open source",
    className:
      "rounded-full border border-purple-400/30 bg-white/[0.06] px-4 py-2 shadow-[0_0_26px_rgba(192,132,252,0.36)]",
  },
  {
    label: "Your data stays private",
    className:
      "rounded-full border border-emerald-400/30 bg-white/[0.06] px-4 py-2 shadow-[0_0_26px_rgba(52,211,153,0.3)]",
  },
];

export function CTASection() {
  const navigate = useNavigate();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(rootRef, {
    once: false,
    amount: 0.22,
    margin: "0px 0px 14% 0px",
  });

  return (
    <SectionWrapper id="cta">
      <div ref={rootRef} className="mx-auto max-w-5xl">
        <motion.div
          variants={ctaCardShellVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="rounded-[28px] shadow-glass-lg shadow-purple-500/25"
        >
          <GlassCard
            variant="default"
            radius="lg"
            padding="lg"
            className="border-white/15 !shadow-none"
          >
            <GlassCardContent className="text-center">
              <h2 className="sr-only">
                Start Chatting with Your Documents Today
              </h2>

              <motion.div
                variants={ctaContentStaggerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex flex-col items-center gap-5 md:gap-6"
              >
                <motion.div
                  variants={ctaLineFadeVariants}
                  className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-purple-200 backdrop-blur-[2px]"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-purple-300" />
                  Ready to get started?
                </motion.div>

                <div className="max-w-2xl space-y-1 text-balance">
                  <motion.span
                    variants={ctaLineFadeVariants}
                    className="heading-2 block text-white"
                  >
                    Start Chatting with Your
                  </motion.span>
                  <motion.span
                    variants={ctaLineFadeVariants}
                    className="heading-2 block gradient-text"
                  >
                    Documents Today
                  </motion.span>
                </div>

                <motion.p
                  variants={ctaLineFadeVariants}
                  className="body-large max-w-xl text-pretty text-white/90"
                >
                  Upload your first PDF and experience the power of AI-driven
                  document analysis. No signup required.
                </motion.p>

                <motion.div variants={ctaLineFadeVariants} className="w-full">
                  <Button
                    size="lg"
                    variant="default"
                    withRipple
                    icon={
                      <Sparkles className="h-4 w-4 shrink-0 text-white/95" />
                    }
                    className="shine-debug group w-full rounded-[8rem] border border-white/30 !bg-[linear-gradient(90deg,#7e22ce_0%,#2563eb_45%,#0284c7_100%)] font-medium sm:w-auto sm:min-w-[220px]"
                    onClick={() => navigate("/chat")}
                  >
                    Try It Now - Free
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </motion.div>

                <motion.div
                  variants={trustRowStaggerVariants}
                  className="mt-1 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4"
                >
                  {trustItems.map((item) => (
                    <motion.span
                      key={item.label}
                      variants={ctaLineFadeVariants}
                      className={`inline-flex items-center gap-2 text-sm text-white/90 ${item.className}`}
                    >
                      <span className="text-emerald-400/90">✓</span>
                      {item.label}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
