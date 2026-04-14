/**
 * CTASection Component
 *
 * Call-to-action section encouraging users to try the app.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

export function CTASection() {
  return (
    <SectionWrapper>
      <ScrollReveal direction="up">
        <div className="relative overflow-hidden rounded-[28px] bg-transparent backdrop-blur-[2px] border border-white/10 p-4 md:p-6 xl:p-8">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="hidden"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <ScrollReveal direction="up">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent backdrop-blur-[2px] border border-white/15 text-sm text-purple-300 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.7 }}
              >
                <Sparkles className="w-4 h-4" />
                Ready to get started?
              </motion.div>
            </ScrollReveal>

            <h2 className="heading-2 text-white mb-4 text-balance">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.7 }}
                transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                Start Chatting with Your
              </motion.span>
              <motion.span
                className="block gradient-text"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.7 }}
                transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                Documents Today
              </motion.span>
            </h2>

            <ScrollReveal direction="up" delay={0.16}>
              <p className="body-large max-w-xl mx-auto mb-8 text-pretty">
                Upload your first PDF and experience the power of AI-driven
                document analysis. No signup required.
              </p>
            </ScrollReveal>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                withShine
                className="w-full sm:w-auto sm:min-w-[200px] rounded-[8rem] border border-white/30 font-medium"
                asChild
              >
                <span className="inline-flex items-center gap-2">
                  <Link to="/chat">Try It Now - Free</Link>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
              {[
                "No signup required",
                "100% open source",
                "Your data stays private",
              ].map((item, index) => (
                <ScrollReveal key={item} direction="up" delay={index * 0.08}>
                  <span className="flex items-center gap-2">✓ {item}</span>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}
