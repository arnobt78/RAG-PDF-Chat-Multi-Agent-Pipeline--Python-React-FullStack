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
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-purple-600/20 border border-white/10 p-8 sm:p-12 lg:p-16">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
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
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-purple-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4" />
              Ready to get started?
            </motion.div>

            <h2 className="heading-2 text-white mb-4">
              Start Chatting with Your
              <br />
              <span className="gradient-text">Documents Today</span>
            </h2>

            <p className="body-large max-w-xl mx-auto mb-8">
              Upload your first PDF and experience the power of AI-driven document analysis.
              No signup required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                withShine
                className="min-w-[200px]"
                icon={<ArrowRight className="w-5 h-5" />}
                asChild
              >
                <Link to="/chat">Try It Now - Free</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                ✓ No signup required
              </span>
              <span className="flex items-center gap-2">
                ✓ 100% open source
              </span>
              <span className="flex items-center gap-2">
                ✓ Your data stays private
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}
