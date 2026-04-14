/**
 * ModelsSection Component
 *
 * Multi-provider model support aligned with backend `AI_PROVIDERS` /
 * `PROVIDER_PRIORITY`. Cards use scroll-driven stagger (features-style).
 */

import * as React from "react";
import { motion, useInView } from "framer-motion";
import {
  Cpu,
  Globe,
  Zap,
  Sparkles,
  Library,
  RefreshCw,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

type ProviderBlock = {
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  models: string[];
  badge: string;
};

/** Mirrors backend/app/config.py — display names for marketing UI */
const providers: ProviderBlock[] = [
  {
    name: "OpenRouter",
    icon: Globe,
    color: "from-blue-500 to-purple-500",
    description:
      "Primary gateway: GPT-4o, Claude, Llama, and Gemini routes through one OpenAI-compatible API.",
    models: [
      "GPT-4o Mini",
      "GPT-4o",
      "Claude 3 Haiku",
      "Claude 3.7 Sonnet",
      "Llama 3.3 70B",
      "Gemini 2.0 Flash",
    ],
    badge: "Primary",
  },
  {
    name: "Groq",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    description:
      "LPU-backed inference for sub-second answers when OpenRouter is slow or unavailable.",
    models: ["Llama 3.3 70B", "Llama 3.1 8B", "Mixtral 8x7B"],
    badge: "Fast fallback",
  },
  {
    name: "Google Gemini",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-600",
    description:
      "Native Gemini models including 2.5 Flash, Flash-Lite, Pro, and 2.0 Flash endpoints.",
    models: [
      "Gemini 2.5 Flash",
      "Gemini 2.5 Flash-Lite",
      "Gemini 2.5 Pro",
      "Gemini Flash (latest)",
      "Gemini 2.0 Flash",
    ],
    badge: "Fallback",
  },
  {
    name: "Hugging Face",
    icon: Library,
    color: "from-yellow-500 to-amber-600",
    description:
      "Open-weight models via the Hugging Face router for extra resilience without closed APIs.",
    models: ["Mistral 7B", "Zephyr 7B", "Llama 3 8B Instruct"],
    badge: "Fallback",
  },
  {
    name: "OpenAI Direct",
    icon: Cpu,
    color: "from-emerald-500 to-teal-500",
    description:
      "Optional direct api.openai.com access when you set OPENAI_DIRECT_API_KEY (chat failover only).",
    models: ["GPT-4o Mini", "GPT-4o", "GPT-4 Turbo"],
    badge: "Optional",
  },
];

const PROVIDER_COUNT = providers.length;
const CARD_STAGGER_S = 0.12;

const modelCardVariants = {
  hidden: (index: number) => ({
    opacity: 1,
    y: 20,
    transition: {
      duration: 0.42,
      delay: index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      delay: index * CARD_STAGGER_S,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const modelListVariants = {
  hidden: {},
  visible: (index: number) => ({
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.14 + index * 0.045,
    },
  }),
};

const modelItemVariants = {
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

/** Footer note: slow opacity ease-in-out (matches how-it-works tech strip) */
const modelsFooterNoteVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

function ProviderCard({
  provider,
  index,
}: {
  provider: ProviderBlock;
  index: number;
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardRef, {
    once: false,
    amount: 0.24,
    margin: "0px 0px -8% 0px",
  });

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={modelCardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="min-w-0"
    >
      <GlassCard variant="hover" padding="lg" className="h-full">
        <GlassCardContent>
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} p-[1px] shadow-lg shadow-black/25`}
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: "spring", stiffness: 320 }}
            >
              <div className="w-full h-full rounded-[11px] bg-slate-950/80 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <provider.icon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white">
                {provider.name}
              </h3>
              <Badge variant="outline" size="sm" className="mt-1.5">
                {provider.badge}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            {provider.description}
          </p>

          <motion.ul
            custom={index}
            className="space-y-1.5 min-w-0 list-none p-0 m-0"
            variants={modelListVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {provider.models.map((model) => (
              <motion.li
                key={model}
                variants={modelItemVariants}
                className="flex items-center gap-2 text-sm text-white/90 break-words"
              >
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-purple-400" />
                {model}
              </motion.li>
            ))}
          </motion.ul>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}

export function ModelsSection() {
  return (
    <SectionWrapper id="models">
      <div className="text-center mb-8 md:mb-10 xl:mb-12">
        <ScrollReveal direction="up">
          <Badge
            variant="info"
            className="mb-4"
            icon={<Server className="w-3 h-3" />}
          >
            Multi-Provider Support
          </Badge>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.08}>
          <h2 className="heading-2 text-white mb-4">
            Powered by <span className="gradient-text">Multiple AI Models</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.14}>
          <p className="body-large max-w-3xl mx-auto">
            Failover order matches the backend: OpenRouter, then Groq, Gemini,
            Hugging Face, and optional direct OpenAI — so answers keep flowing
            when a provider errors or rate-limits.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-0">
        {providers.map((provider, index) => (
          <ProviderCard key={provider.name} provider={provider} index={index} />
        ))}
      </div>

      <motion.div
        variants={modelsFooterNoteVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.22, margin: "0px 0px 14% 0px" }}
        className="mx-auto mt-10 flex max-w-9xl flex-wrap items-center justify-center gap-2 text-center text-sm text-white/90"
      >
        <RefreshCw className="h-4 w-4 shrink-0 text-sky-400" />
        <span>
          Up to {PROVIDER_COUNT} providers with ordered retries — the chat UI
          loads live models from the{" "}
          <code className="text-xs text-white/80">/models</code> endpoint on
          your configured API base URL when the backend is reachable.
        </span>
      </motion.div>
    </SectionWrapper>
  );
}
