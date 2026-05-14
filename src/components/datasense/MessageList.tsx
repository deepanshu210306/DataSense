"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-2 sm:px-8">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <div key={m.id}>
            <MessageBubble message={m} />
          </div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  );
}
