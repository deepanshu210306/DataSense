"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
        className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className={cn(
            "mb-6 flex h-11 w-11 items-center justify-center rounded-full",
            isLight ? "bg-neutral-100 text-neutral-600" : "bg-white/[0.08] text-neutral-300",
          )}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>

        <h1
          className={cn(
            "text-balance text-2xl font-semibold tracking-tight sm:text-[1.75rem]",
            isLight ? "text-neutral-950" : "text-white",
          )}
        >
          {CHAT.emptyTitle}
        </h1>
        <p
          className={cn(
            "mt-2 max-w-md text-pretty text-sm leading-relaxed",
            isLight ? "text-neutral-500" : "text-neutral-400",
          )}
        >
          {CHAT.emptyDescription}
        </p>

        <div className="mt-8 flex w-full max-w-2xl flex-col gap-2">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <motion.button
              key={prompt}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04, duration: 0.28 }}
              onClick={() => onTryExample?.(prompt)}
              className={cn(
                "rounded-2xl px-4 py-3 text-left text-sm leading-relaxed transition",
                isLight
                  ? "bg-white text-neutral-600 shadow-sm shadow-black/[0.04] hover:bg-neutral-50"
                  : "bg-[#2f2f2f] text-neutral-300 hover:bg-[#383838]",
              )}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
