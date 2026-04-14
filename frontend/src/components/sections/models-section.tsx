/**
 * ModelsSection Component
 *
 * Showcases the multi-model / multi-provider support.
 * Displays supported AI providers with their available models.
 */

import { motion } from "framer-motion";
import {
  Cpu,
  Globe,
  Zap,
  Server,
  RefreshCw,
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionWrapper } from "@/components/layout/page-wrapper";

const providers = [
  {
    name: "OpenRouter",
    icon: Globe,
    color: "from-blue-500 to-purple-500",
    description: "Unified gateway to hundreds of AI models via a single API endpoint.",
    models: ["GPT-4o", "GPT-4o Mini", "Claude 3.5 Sonnet", "Llama 3.1 70B"],
    badge: "Primary",
  },
  {
    name: "Groq",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    description: "Ultra-fast inference on LPU hardware with sub-second latency.",
    models: ["Llama 3.1 70B", "Llama 3.1 8B", "Mixtral 8x7B"],
    badge: "Fallback",
  },
  {
    name: "OpenAI Direct",
    icon: Cpu,
    color: "from-emerald-500 to-teal-500",
    description: "Direct OpenAI API access when you have your own API key.",
    models: ["GPT-4o", "GPT-4o Mini", "GPT-4 Turbo"],
    badge: "Optional",
  },
];

export function ModelsSection() {
  return (
    <SectionWrapper id="models">
      <ScrollReveal direction="up" className="text-center mb-8 md:mb-10 xl:mb-12">
        <Badge variant="info" className="mb-4" icon={<Server className="w-3 h-3" />}>
          Multi-Provider Support
        </Badge>
        <h2 className="heading-2 text-white mb-4">
          Powered by <span className="gradient-text">Multiple AI Models</span>
        </h2>
        <p className="body-large max-w-2xl mx-auto">
          Automatic fallback across providers ensures your questions always
          get answered — even when one provider is unavailable.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {providers.map((provider, index) => (
          <ScrollReveal key={provider.name} direction="up" delay={index * 0.12}>
            <GlassCard variant="hover" padding="lg" className="h-full">
              <GlassCardContent>
                <div className="flex items-start gap-4 mb-6">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-transparent backdrop-blur-[2px] border border-white/15 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <provider.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {provider.name}
                    </h3>
                    <Badge variant="outline" size="sm">
                      {provider.badge}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {provider.description}
                </p>

                <div className="space-y-1.5 min-w-0">
                  {provider.models.map((model) => (
                    <div
                      key={model}
                      className="flex items-center gap-2 text-sm text-slate-300 break-words"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {model}
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal direction="up" delay={0.4}>
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-400">
          <RefreshCw className="w-4 h-4 text-purple-400" />
          Automatic failover between providers for maximum reliability
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}
