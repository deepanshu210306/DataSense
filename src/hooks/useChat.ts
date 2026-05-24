"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DatasetId } from "@/lib/datasets/types";
import type { ChatApiErrorBody, ChatHistoryMessage } from "@/lib/types/chat";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  /** When true, the assistant reply is still streaming */
  streaming?: boolean;
  /** Set when the API returns an error for this turn */
  error?: boolean;
};

function id() {
  return crypto.randomUUID?.() ?? `m-${Date.now()}-${Math.random()}`;
}

async function readErrorResponse(
  response: Response,
): Promise<ChatApiErrorBody> {
  try {
    const body = (await response.json()) as ChatApiErrorBody;
    if (body.error) return body;
  } catch {
    /* fall through */
  }
  return {
    error: `Request failed (${response.status})`,
    code: undefined,
  };
}

function formatAssistantError(body: ChatApiErrorBody): string {
  if (body.code === "GROQ_RATE_LIMIT") {
    return `### Service temporarily busy\n\n${body.error}`;
  }
  return `**Could not get an answer.** ${body.error}`;
}

export function useChat(datasetId: DatasetId) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => () => cancelRequest(), [cancelRequest]);

  const reset = useCallback(() => {
    cancelRequest();
    setMessages([]);
    setIsSending(false);
  }, [cancelRequest]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isSending) return;

      const userMsg: ChatMessage = { id: id(), role: "user", content: text };
      const assistantId = id();

      const history: ChatHistoryMessage[] = messages
        .filter((m) => !m.error && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          streaming: true,
        },
      ]);

      cancelRequest();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            datasetId,
            history,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await readErrorResponse(response);
          if (err.code === "GROQ_RATE_LIMIT") {
            toast.error("AI rate limit reached", {
              description:
                "Wait about a minute, then try again or start a new chat.",
              duration: 8000,
            });
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: formatAssistantError(err),
                    streaming: false,
                    error: true,
                  }
                : m,
            ),
          );
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream from server.");
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, streaming: true }
                : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Network error.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `**Could not get an answer.** ${message}`,
                  streaming: false,
                  error: true,
                }
              : m,
          ),
        );
      } finally {
        setIsSending(false);
        abortRef.current = null;
      }
    },
    [cancelRequest, datasetId, isSending, messages],
  );

  return { messages, isSending, sendMessage, reset };
}
