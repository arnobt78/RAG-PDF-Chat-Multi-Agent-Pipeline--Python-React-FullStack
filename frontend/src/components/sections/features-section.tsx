/**
 * FeaturesSection Component
 *
 * Features showcase section with:
 * - Grid of feature cards
 * - Gradient-framed icons (models-section style), varied colors per card
 * - Scroll-driven card entrance + in-card stagger (icon → title → description)
 */

import * as React from "react";
import { motion, useInView } from "framer-motion";
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
import type { LucideIcon } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";
import { FEATURES } from "@/lib/constants";

const featureIcons: LucideIcon[] = [
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

/** Distinct gradient rings — cycles if feature count grows */
const featureIconGradients = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-orange-600",
];

const featureCardVariants = {
  hidden: (index: number) => ({
    opacity: 1,
    y: 18,
    transition: {
      duration: 0.38,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const featureContentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.14,
    },
  },
};

const featureRowVariants = {
  hidden: {
    opacity: 1,
    x: -14,
    y: 6,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.56,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

type FeatureItem = (typeof FEATURES)[number];

function FeatureCard({
  feature,
  index,
  Icon,
  iconGradient,
}: {
  feature: FeatureItem;
  index: number;
  Icon: LucideIcon;
  iconGradient: string;
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardRef, {
    once: false,
    amount: 0.28,
    margin: "0px 0px -8% 0px",
  });

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={featureCardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="min-w-0"
    >
      <GlassCard variant="hover" className="h-full" padding="lg">
        <GlassCardContent>
          <motion.div
            variants={featureContentVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              variants={featureRowVariants}
              className="mb-6 w-fit"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 320 }}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} p-[1px] shadow-lg shadow-black/25`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-[13px] border border-white/10 bg-slate-950/80 backdrop-blur-sm">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h3
              variants={featureRowVariants}
              className="mb-3 text-xl font-semibold text-white"
            >
              {feature.title}
            </motion.h3>
            <motion.p
              variants={featureRowVariants}
              className="leading-relaxed text-white/90"
            >
              {feature.description}
            </motion.p>
          </motion.div>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      <div className="mb-8 text-center md:mb-10 xl:mb-12">
        <ScrollReveal direction="up">
          <h2 className="heading-2 mb-4 text-white">
            Powerful <span className="gradient-text">Features</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.08}>
          <p className="body-large mx-auto max-w-3xl">
            Everything you need to chat with your documents intelligently
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 sm:gap-6 sm:px-0 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = featureIcons[index % featureIcons.length];
          const iconGradient =
            featureIconGradients[index % featureIconGradients.length];

          return (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              Icon={Icon}
              iconGradient={iconGradient}
            />
          );
        })}
      </div>
    </SectionWrapper>
  );
}
