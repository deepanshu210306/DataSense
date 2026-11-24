"use client";

import { useCallback, useEffect, useState } from "react";
import { readErrorResponse } from "@/lib/chat/stream-client";
import {
  formatRelativeTime,
  type ConversationSummary,
} from "@/lib/conversations/types";

type ApiConversation = {
  id: string;
  title: string;
  updatedAt: string;
  resourceId: string;
};

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) return;
      const data = (await response.json()) as {
        conversations: ApiConversation[];
      };
      setConversations(
        data.conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: formatRelativeTime(c.updatedAt),
          resourceId: c.resourceId,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const response = await fetch(
      `/api/conversations/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    // 404 means it's already gone (e.g. deleted in another tab).
    if (!response.ok && response.status !== 404) {
      const err = await readErrorResponse(response);
      throw new Error(err.error);
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  return { conversations, loading, refresh, deleteConversation };
}
