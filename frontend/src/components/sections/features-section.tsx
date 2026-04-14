/**
 * FeaturesSection Component
 *
 * Features showcase section with:
 * - Grid of feature cards
 * - Icons and descriptions
 * - Scroll reveal animations
 */

import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Brain,
  Layers,
  Workflow,
  Radio,
  RefreshCw,
  BookOpen,
  HardDrive,
  Container,
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";
import { FEATURES } from "@/lib/constants";

const featureIcons = [
  FileText,
  Search,
  Brain,
  Layers,
  Workflow,
  Radio,
  RefreshCw,
  BookOpen,
  HardDrive,
  Container,
];

export function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      {/* Section Header */}
      <ScrollReveal direction="up" className="text-center mb-8 md:mb-10 xl:mb-12">
        <h2 className="heading-2 text-white mb-4">
          Powerful <span className="gradient-text">Features</span>
        </h2>
        <p className="body-large max-w-2xl mx-auto">
          Everything you need to chat with your documents intelligently
        </p>
      </ScrollReveal>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = featureIcons[index % featureIcons.length];

          return (
            <ScrollReveal
              key={feature.title}
              direction="up"
              delay={index * 0.1}
            >
              <GlassCard
                variant="hover"
                className="h-full group"
                padding="lg"
              >
                <GlassCardContent>
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-transparent backdrop-blur-[2px] border border-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-7 h-7 text-purple-400" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
