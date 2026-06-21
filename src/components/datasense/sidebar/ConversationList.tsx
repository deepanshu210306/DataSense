"use client";

import type { ConversationSummary } from "@/lib/conversations/types";
import { CHAT } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { SidebarBar } from "./sidebarStyles";

type ConversationListProps = {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  bar: SidebarBar;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  bar,
  mobile,
  onCloseMobile,
}: ConversationListProps) {
  return (
    <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-2">
      <p
        className={cn(
          "px-3 pb-2 text-[11px] font-semibold tracking-wide",
          bar.muted,
        )}
      >
        {CHAT.recentsLabel}
      </p>
      <ul className="space-y-0.5">
        {conversations.length === 0 ? (
          <li className={cn("px-3 py-2 text-xs", bar.muted)}>
            {CHAT.recentsEmpty}
          </li>
        ) : (
          conversations.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onSelectConversation(t.id);
                  if (mobile) onCloseMobile?.();
                }}
                className={cn(
                  "w-full truncate rounded-full px-3 py-2 text-left text-sm transition-colors",
                  activeConversationId === t.id
                    ? bar.active
                    : cn(bar.text, bar.ghost),
                )}
              >
                {t.title}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
