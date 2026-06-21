"use client";

import { motion } from "framer-motion";
import { Database, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";
import { CHAT } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./MarkdownMessage";
import { Skeleton } from "./ui/Skeleton";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isUser = message.role === "user";
  const isStreamingAssistant =
    message.role === "assistant" && message.streaming && !message.content;
  const isError = !isUser && message.error;

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="group flex w-full justify-end py-1"
      >
        <div
          className={cn(
            "max-w-[min(88%,48rem)] rounded-[1.25rem] px-4 py-2.5 text-[0.9375rem] leading-relaxed",
            isLight
              ? "bg-neutral-100 text-neutral-900"
              : "bg-[#2f2f2f] text-neutral-100",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full gap-3 py-2 sm:gap-4"
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isError
            ? isLight
              ? "bg-amber-100 text-amber-700"
              : "bg-amber-500/15 text-amber-400"
            : isLight
              ? "bg-neutral-100 text-neutral-600"
              : "bg-white/[0.08] text-neutral-300",
        )}
        aria-hidden
      >
        <Sparkles className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        {message.resolvedDatasetLabel && !isStreamingAssistant && (
          <p
            className={cn(
              "mb-2 flex items-center gap-1.5 text-[11px] leading-none",
              isLight ? "text-neutral-400" : "text-neutral-500",
            )}
          >
            <Database className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">
              {CHAT.analystUsing(message.resolvedDatasetLabel)}
            </span>
          </p>
        )}

        {isStreamingAssistant ? (
          <div className="flex flex-col gap-2 py-0.5">
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-3 w-full max-w-sm" />
            <div className="flex gap-1 pt-0.5">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isLight ? "bg-neutral-300" : "bg-neutral-600",
                  )}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: d * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative w-full",
              isError &&
                (isLight
                  ? "rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2.5"
                  : "rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2.5"),
            )}
          >
            <MarkdownMessage content={message.content} />
            {message.streaming && (
              <motion.span
                aria-hidden
                className={cn(
                  "ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 rounded-full",
                  isLight ? "bg-neutral-400" : "bg-neutral-500",
                )}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
