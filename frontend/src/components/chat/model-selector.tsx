/**
 * ModelSelector Component
 *
 * Dropdown for selecting which AI model to use for chat.
 * Displays available models with provider badges.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_MODELS } from "@/types";

export interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selected = AI_MODELS.find((m) => m.id === value) ?? AI_MODELS[0];

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
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm",
          "bg-white/5 border border-white/10 text-slate-300",
          "hover:bg-white/10 hover:border-white/20 transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden sm:inline">{selected.name}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 z-50 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-1.5">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left",
                    "hover:bg-white/10 transition-colors",
                    model.id === value && "bg-purple-500/15"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {model.name}
                      </span>
                      {model.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                          Default
                        </span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
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
