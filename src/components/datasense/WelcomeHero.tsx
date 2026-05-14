"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function WelcomeHero() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full max-w-xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.06, duration: 0.4 }}
          className={cn(
            "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
            isLight
              ? "bg-blue-600/10 ring-blue-600/20"
              : "bg-blue-500/15 ring-blue-400/25",
          )}
        >
          <Sparkles
            className={cn(
              "h-7 w-7",
              isLight ? "text-blue-700" : "text-blue-400",
            )}
          />
        </motion.div>
        <h1
          className={cn(
            "text-balance text-3xl font-semibold tracking-tight sm:text-4xl",
            isLight ? "text-neutral-950" : "text-white",
          )}
        >
          Talk to Your Data
        </h1>
        <p
          className={cn(
            "mt-3 max-w-lg text-pretty text-base leading-relaxed sm:text-lg",
            isLight ? "text-neutral-600" : "text-neutral-400",
          )}
        >
          Ask questions, analyze datasets, and extract insights instantly.
        </p>

        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-10 flex w-full max-w-sm justify-center"
        >
          <svg
            viewBox="0 0 320 100"
            className="h-20 w-full text-blue-600/25 dark:text-blue-400/20"
            fill="none"
          >
            <defs>
              <linearGradient id="ds-hero-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(37,99,235)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="rgb(37,99,235)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect
              x="20"
              y="22"
              width="100"
              height="60"
              rx="14"
              stroke="url(#ds-hero-grad)"
              strokeWidth="1.5"
            />
            <path
              d="M40 42h60M40 54h44M40 66h52"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={isLight ? "text-black/10" : "text-white/10"}
            />
            <circle cx="248" cy="36" r="5" fill="rgb(37,99,235)" opacity="0.35" />
            <circle cx="268" cy="58" r="8" fill="rgb(37,99,235)" opacity="0.22" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
