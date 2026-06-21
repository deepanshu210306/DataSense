"use client";

import { useCallback, useEffect, useState } from "react";
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, loading, refresh };
}
