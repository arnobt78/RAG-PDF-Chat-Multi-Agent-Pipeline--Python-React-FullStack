/**
 * ModelSelector Component
 *
 * Dropdown for selecting which AI model to use for chat.
 * Fetches live models from backend on mount, falls back to static list.
 *
 * If ``/models`` fails (offline backend), the static ``AI_MODELS`` list still lets devs click around.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_MODELS, type AIModel } from "@/types";
import { API_ENDPOINTS, joinApiUrl } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ModelSelectorProps {
  value: string;
  onChange: (model: AIModel) => void;
  disabled?: boolean;
}

const providerColor: Record<string, string> = {
  openrouter: "text-blue-400",
  groq: "text-orange-400",
  openai: "text-green-400",
  gemini: "text-cyan-400",
  huggingface: "text-yellow-400",
};

export function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [models, setModels] = React.useState<AIModel[]>(AI_MODELS);
  const ref = React.useRef<HTMLDivElement>(null);

  // Fetch available models from backend once
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(joinApiUrl(API_ENDPOINTS.MODELS));
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          Array.isArray(data.models) &&
          data.models.length > 0
        ) {
          // Normalize backend schema to frontend AIModel shape.
          const live: AIModel[] = data.models.map(
            (m: {
              id: string;
              name: string;
              provider: string;
              is_default: boolean;
            }) => ({
              id: m.id,
              name: m.name,
              provider: m.provider,
              isDefault: m.is_default,
            }),
          );
          setModels(live);
        }
      } catch {
        /* keep static fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = models.find((m) => m.id === value) ?? models[0];
  // Fallback ensures UI stays stable if persisted value is no longer offered.

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Tooltip>
        {/* Span trigger: disabled <button> does not receive pointer events in
            some browsers; the wrapper still gets hover so the tooltip works. */}
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex rounded-xl align-middle",
              disabled && "cursor-not-allowed",
            )}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm",
                "bg-white/5 border border-white/10 text-white/90",
                "hover:bg-white/10 hover:border-white/20 transition-all",
                "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              aria-label={`Chat model: ${selected?.name ?? "Select model"}. Open menu to change.`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" aria-hidden />
              <span className="hidden sm:inline max-w-[120px] truncate">
                {selected?.name ?? "Select model"}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform shrink-0",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-[18rem]">
          <p className="font-medium text-white">Chat model</p>
          <p className="mt-1 text-[11px] text-white/80 leading-snug">
            Choose which LLM generates answers for this thread. The menu
            prefers models returned by the backend; offline, a static list is
            used. Active:{" "}
            <span className="font-medium text-white/95">
              {selected?.name ?? "—"}
            </span>
            .
          </p>
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-[min(20rem,calc(100vw-1rem))] sm:w-72 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden max-h-[min(20rem,58vh)] overflow-y-auto scrollbar-hide"
          >
            <div className="p-1.5">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (model.id !== value) onChange(model);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left",
                    "hover:bg-white/10 transition-colors",
                    model.id === value && "bg-purple-500/15",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {model.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full bg-white/5",
                          providerColor[model.provider] ?? "text-white/90",
                        )}
                      >
                        {model.provider}
                      </span>
                      {model.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                          Default
                        </span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-xs text-slate-300 mt-0.5 truncate">
                        {model.description}
                      </p>
                    )}
                  </div>
                  {model.id === value && (
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
