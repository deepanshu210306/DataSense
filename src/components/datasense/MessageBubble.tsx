"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[min(100%,720px)] rounded-2xl px-4 py-3 shadow-md ring-1 backdrop-blur-xl",
          isUser
            ? "bg-blue-600 text-white ring-blue-500/30"
            : isError
              ? isLight
                ? "border-amber-200/80 bg-amber-50 text-amber-950 ring-amber-300/50"
                : "border-amber-500/25 bg-amber-500/[0.08] text-amber-50 ring-amber-400/20"
              : isLight
                ? "bg-white text-neutral-900 ring-black/[0.08] shadow-black/5"
                : "bg-white/[0.05] text-neutral-100 ring-white/[0.08]",
        )}
      >
        {!isUser && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 text-xs font-medium",
              isLight ? "text-neutral-500" : "text-neutral-400",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg ring-1",
                isLight
                  ? "bg-blue-600/10 ring-blue-600/20"
                  : "bg-blue-500/20 ring-blue-400/25",
              )}
            >
              <Sparkles
                className={cn(
                  "h-3.5 w-3.5",
                  isLight ? "text-blue-700" : "text-blue-300",
                )}
              />
            </span>
            <span>DataSense</span>
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">
            {message.content}
          </p>
        ) : isStreamingAssistant ? (
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-3 w-[88%]" />
            <Skeleton className="h-3 w-[72%]" />
            <Skeleton className="h-3 w-[64%]" />
            <div className="flex gap-1 pt-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-blue-500"
                  animate={{ opacity: [0.35, 1, 0.35] }}
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
          <div className="relative">
            <MarkdownMessage content={message.content} />
            {message.streaming && (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 rounded-full bg-blue-500"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
