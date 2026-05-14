"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  /** When true, content is streamed into this message */
  streaming?: boolean;
};

const DEMO_ASSISTANT_MARKDOWN = `Here is a quick read on **revenue trends** from your selected dataset.

### Highlights
- North region grew **12.4%** quarter-over-quarter.
- Enterprise tier accounts for ~**58%** of recurring revenue.

### Sample query
You can slice by region with SQL-like filters in the dataset panel.

\`\`\`sql
SELECT region, SUM(revenue) AS total
FROM sales
WHERE quarter = 'Q2'
GROUP BY region
ORDER BY total DESC;
\`\`\`

> *Note: figures are illustrative for this demo UI.*

Would you like me to **compare quarterly growth** or surface **anomalies** next?`;

function id() {
  return crypto.randomUUID?.() ?? `m-${Date.now()}-${Math.random()}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const streamRef = useRef<number | null>(null);

  const clearStream = useCallback(() => {
    if (streamRef.current != null) {
      window.clearInterval(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => clearStream(), [clearStream]);

  const reset = useCallback(() => {
    clearStream();
    setMessages([]);
    setIsSending(false);
  }, [clearStream]);

  const sendMessage = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isSending) return;

      const userMsg: ChatMessage = { id: id(), role: "user", content: text };
      const assistantId = id();

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            streaming: true,
          },
        ]);

        const full = DEMO_ASSISTANT_MARKDOWN;
        let i = 0;
        const chunk = 2;
        const interval = 18;

        clearStream();
        streamRef.current = window.setInterval(() => {
          i += chunk;
          const slice = full.slice(0, i);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: slice, streaming: i < full.length }
                : m,
            ),
          );
          if (i >= full.length) {
            clearStream();
            setIsSending(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, streaming: false } : m,
              ),
            );
          }
        }, interval);
      }, 450);
    },
    [clearStream, isSending],
  );

  return { messages, isSending, sendMessage, reset };
}
