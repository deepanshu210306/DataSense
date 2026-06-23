"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  formatAssistantError,
  readErrorResponse,
  readTextStream,
} from "@/lib/chat/stream-client";
import { decodeHeaderValue } from "@/lib/http-headers";
import type { ChatHistoryMessage } from "@/lib/types/chat";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  streaming?: boolean;
  error?: boolean;
  resolvedResourceId?: string;
  resolvedDatasetLabel?: string;
};

function localId() {
  return crypto.randomUUID?.() ?? `m-${Date.now()}-${Math.random()}`;
}

type UseChatOptions = {
  conversationId?: string | null;
  resourceId: string | null;
  onDatasetResolved?: (resourceId: string, label: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  onMessageComplete?: () => void;
};

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(options.conversationId),
  );
  const abortRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string | null>(
    options.conversationId ?? null,
  );

  const {
    resourceId,
    onDatasetResolved,
    onConversationCreated,
    onMessageComplete,
  } = options;

  useEffect(() => {
    conversationIdRef.current = options.conversationId ?? null;
  }, [options.conversationId]);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => () => cancelRequest(), [cancelRequest]);

  const fetchConversation = useCallback(
    async (conversationId: string) => {
      cancelRequest();
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error("Could not load conversation.");
        }
        const data = (await response.json()) as {
          messages: Array<{
            id: string;
            role: ChatRole;
            content: string;
            resolvedResourceId?: string;
            resolvedDatasetLabel?: string;
          }>;
        };
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            resolvedResourceId: m.resolvedResourceId ?? undefined,
            resolvedDatasetLabel: m.resolvedDatasetLabel ?? undefined,
          })),
        );
      } catch (error) {
        toast.error("Failed to load chat", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [cancelRequest],
  );

  useEffect(() => {
    if (!options.conversationId) return;

    let cancelled = false;
    const id = options.conversationId;

    queueMicrotask(() => {
      if (!cancelled) void fetchConversation(id);
    });

    return () => {
      cancelled = true;
    };
  }, [options.conversationId, fetchConversation]);

  const reset = useCallback(() => {
    cancelRequest();
    conversationIdRef.current = null;
    setMessages([]);
    setIsSending(false);
  }, [cancelRequest]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isSending) return;

      if (!resourceId) {
        toast.error("Select a dataset first", {
          description: "Open the profile menu and pick or add a dataset.",
        });
        return;
      }

      const userMsg: ChatMessage = {
        id: localId(),
        role: "user",
        content: text,
      };
      const assistantId = localId();

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
            resourceId,
            conversationId: conversationIdRef.current ?? undefined,
            history,
          }),
          signal: controller.signal,
        });

        const newConversationId = response.headers.get("X-Conversation-Id");
        if (newConversationId && !conversationIdRef.current) {
          conversationIdRef.current = newConversationId;
          onConversationCreated?.(newConversationId);
        }

        const resolvedResourceId =
          response.headers.get("X-Resolved-Dataset-Id") ?? undefined;
        const resolvedDatasetLabel = decodeHeaderValue(
          response.headers.get("X-Resolved-Dataset-Label"),
        );

        if (resolvedResourceId && resolvedDatasetLabel) {
          onDatasetResolved?.(resolvedResourceId, resolvedDatasetLabel);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    resolvedResourceId,
                    resolvedDatasetLabel,
                  }
                : m,
            ),
          );
        }

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

        if (!response.body) {
          throw new Error("No response stream from server.");
        }

        await readTextStream(response.body, (accumulated) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, streaming: true }
                : m,
            ),
          );
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
        onMessageComplete?.();
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
    [
      cancelRequest,
      resourceId,
      isSending,
      messages,
      onConversationCreated,
      onDatasetResolved,
      onMessageComplete,
    ],
  );

  return { messages, isSending, isLoading, sendMessage, reset };
}
