/**
 * ModelInfoToggle
 *
 * Collapsible panel summarizing AI models, active selection, and backend API key hints.
 *
 * ``providerEnv`` maps UI provider slug → typical env var name (documentation only, not read from env in the browser).
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_MODELS } from "@/types";

const providerEnv: Record<string, string> = {
  openrouter: "OPENROUTER_API_KEY",
  groq: "GROQ_API_KEY",
  gemini: "GOOGLE_API_KEY",
  openai: "OPENAI_DIRECT_API_KEY",
  huggingface: "HF_API_KEY",
};

const providerBadge: Record<string, string> = {
  openrouter: "border-blue-400/40 text-blue-300 bg-blue-500/10",
  groq: "border-orange-400/40 text-orange-200 bg-orange-500/10",
  openai: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
  gemini: "border-cyan-400/40 text-cyan-200 bg-cyan-500/10",
  huggingface: "border-amber-400/40 text-amber-200 bg-amber-500/10",
};

export interface ModelInfoToggleProps {
  selectedModel: string;
}

export function ModelInfoToggle({ selectedModel }: ModelInfoToggleProps) {
  const [open, setOpen] = React.useState(false);
  const selected = AI_MODELS.find((m) => m.id === selectedModel) ?? AI_MODELS[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-r from-sky-500/15 via-sky-400/8 to-transparent px-4 shadow-[0_0_24px_-8px_rgba(56,189,248,0.38)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-300/80 to-sky-500/40" />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center justify-between gap-3 py-3 pl-2 text-left transition-colors hover:bg-sky-500/[0.06]"
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15">
            <Sparkles className="h-5 w-5 text-sky-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">
                Models and API setup
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  providerBadge[selected.provider] ?? "border-white/20 text-white/90",
                )}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Active: {selected.name}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-white/90">
              See which provider each model uses and which env keys your backend needs.
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-sky-200/90 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-sky-400/20"
          >
            <div className="max-h-[min(22rem,50vh)] space-y-3 overflow-y-auto pb-3 pt-1 scrollbar-hide">
              <p className="text-[11px] leading-relaxed text-white/90">
                Answers use your selected model. If a provider key is missing or over quota,
                the backend may fall back to another configured provider—quality and latency
                can change. Configure keys in the backend environment (e.g.{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-[10px] text-sky-200">
                  .env
                </code>
                ).
              </p>
              <ul className="space-y-2">
                {AI_MODELS.map((model) => {
                  const isActive = model.id === selectedModel;
                  const env = providerEnv[model.provider] ?? "OPENROUTER_API_KEY";
                  return (
                    <li
                      key={model.id}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 transition-colors",
                        isActive
                          ? "border-sky-400/45 bg-sky-500/10"
                          : "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Cpu className="h-3.5 w-3.5 shrink-0 text-sky-300" />
                        <span className="text-sm font-medium text-white">{model.name}</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            providerBadge[model.provider] ?? "border-white/20 text-white/90",
                          )}
                        >
                          {model.provider}
                        </span>
                        {isActive && (
                          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                            Selected
                          </span>
                        )}
                        {model.isDefault && !isActive && (
                          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/90">
                            Default
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="mt-1 text-xs text-white/90">{model.description}</p>
                      )}
                      <p className="mt-1.5 font-mono text-[10px] text-slate-400">
                        Key: {env}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
