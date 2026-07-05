"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CHAT } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "What is the total population in the sample?",
  "Compare literacy rates across states",
  "Break down population by age and sex",
] as const;

type WelcomeHeroProps = {
  onTryExample?: (prompt: string) => void;
};

export function WelcomeHero({ onTryExample }: WelcomeHeroProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full max-w-2xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className={cn(
            "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl",
            isLight
              ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
              : "bg-indigo-500/12 text-indigo-300 ring-1 ring-indigo-500/20",
          )}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>

        <h1
          className={cn(
            "text-balance text-2xl font-semibold tracking-tight sm:text-3xl",
            isLight ? "text-neutral-950" : "text-white",
          )}
        >
          {CHAT.emptyTitle}
        </h1>
        <p
          className={cn(
            "mt-3 max-w-md text-pretty text-sm leading-relaxed",
            isLight ? "text-neutral-500" : "text-neutral-400",
          )}
        >
          {CHAT.emptyDescription}
        </p>

        <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-1">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <motion.button
              key={prompt}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.28 }}
              onClick={() => onTryExample?.(prompt)}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-colors",
                isLight
                  ? "border-black/[0.07] bg-white text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                  : "border-white/[0.07] bg-white/[0.02] text-neutral-300 hover:border-indigo-500/25 hover:bg-white/[0.04]",
              )}
            >
              <span>{prompt}</span>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
                  isLight ? "text-indigo-500" : "text-indigo-400",
                )}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
