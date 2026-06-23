"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/hooks/useChat";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            // Start a fresh visual block (with a divider) at each new user turn.
            const startsNewTurn = m.role === "user" && i > 0;
            return (
              <div
                key={m.id}
                className={cn(
                  "w-full",
                  startsNewTurn && "mt-6 border-t pt-6",
                  startsNewTurn &&
                    (isLight ? "border-black/[0.07]" : "border-white/[0.07]"),
                )}
              >
                <MessageBubble message={m} />
              </div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
      </div>
    </div>
  );
}
