"use client";

import { Trash2 } from "lucide-react";
import type { ConversationSummary } from "@/lib/conversations/types";
import { CHAT } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { SidebarBar } from "./sidebarStyles";

type ConversationListProps = {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (conversation: ConversationSummary) => void;
  bar: SidebarBar;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
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
          conversations.map((t) => {
            const isActive = activeConversationId === t.id;
            return (
              <li key={t.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(t.id);
                    if (mobile) onCloseMobile?.();
                  }}
                  className={cn(
                    "w-full truncate rounded-full py-2 pl-3 pr-10 text-left text-sm transition-colors",
                    isActive ? bar.active : cn(bar.text, bar.rowHover),
                  )}
                >
                  {t.title}
                </button>
                {/* Touch screens can't hover, so the button only hides for mouse users. */}
                <button
                  type="button"
                  onClick={() => onDeleteConversation(t)}
                  aria-label={`${CHAT.deleteChat}: ${t.title}`}
                  title={CHAT.deleteChat}
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 rounded-full transition-[color,background-color,opacity]",
                    mobile ? "p-2" : "p-1.5",
                    bar.muted,
                    bar.danger,
                    !isActive &&
                      "pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100",
                  )}
                >
                  <Trash2 className="h-4 w-4 stroke-[1.75]" />
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
