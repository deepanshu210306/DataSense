"use client";

import { useState } from "react";
import { PanelLeftClose, Search, SquarePen, X } from "lucide-react";
import type { ConversationSummary } from "@/lib/conversations/types";
import type { DatasetSummary } from "@/lib/datasets/types";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { ConversationList } from "./sidebar/ConversationList";
import { DatasetPicker } from "./sidebar/DatasetPicker";
import { MobileSidebarDrawer } from "./sidebar/MobileSidebarDrawer";
import { MobileSidebarFab } from "./sidebar/MobileSidebarFab";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarUserMenu } from "./sidebar/SidebarUserMenu";
import { getSidebarBar } from "./sidebar/sidebarStyles";

export { MobileSidebarDrawer, MobileSidebarFab };

type SidebarProps = {
  collapsed: boolean;
  resourceId: string | null;
  onResourceIdChange: (resourceId: string) => void;
  datasets: DatasetSummary[];
  datasetsLoading: boolean;
  onDatasetsRefresh: () => void;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSearch: () => void;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export function Sidebar({
  collapsed,
  resourceId,
  onResourceIdChange,
  datasets,
  datasetsLoading,
  onDatasetsRefresh,
  onToggleCollapse,
  onNewChat,
  onSearch,
  conversations,
  activeConversationId,
  onSelectConversation,
  user,
  onSignOut,
  mobile,
  onCloseMobile,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const bar = getSidebarBar(isLight);
  const [datasetOpen, setDatasetOpen] = useState(false);

  const headerRow = (
    <div
      className={cn(
        "flex shrink-0 items-center px-2 pt-2",
        mobile ? "justify-between pb-2" : "justify-between pb-1",
        mobile && cn("border-b", bar.border),
      )}
    >
      {mobile ? (
        <>
          <div className="flex items-center gap-2 pl-0.5">
            <SidebarLogo size={26} />
          </div>
          <button
            type="button"
            onClick={() => onCloseMobile?.()}
            className={cn(
              "rounded-full p-2 transition-colors",
              bar.ghost,
              bar.muted,
            )}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </>
      ) : collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            bar.ghost,
          )}
          aria-label="Expand sidebar"
        >
          <SidebarLogo size={26} />
        </button>
      ) : (
        <>
          <div className="flex items-center pl-0.5">
            <SidebarLogo size={28} />
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "rounded-full p-2 transition-colors",
              bar.ghost,
              bar.muted,
            )}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5 stroke-[1.5]" />
          </button>
        </>
      )}
    </div>
  );

  const inner = (
    <>
      {headerRow}

      <div className="flex min-h-0 flex-1 flex-col overflow-visible px-2">
        <div
          className={cn("space-y-1", collapsed && !mobile ? "mt-2" : "mt-1")}
        >
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (mobile) onCloseMobile?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-full py-2.5 text-sm font-normal transition-colors",
              bar.pill,
              bar.text,
              collapsed && !mobile ? "justify-center px-0" : "px-3",
            )}
          >
            <SquarePen className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
            {(!collapsed || mobile) && <span>New chat</span>}
          </button>
          <DatasetPicker
            resourceId={resourceId}
            onResourceIdChange={onResourceIdChange}
            datasets={datasets}
            datasetsLoading={datasetsLoading}
            onDatasetsRefresh={onDatasetsRefresh}
            open={datasetOpen}
            onOpenChange={setDatasetOpen}
            isLight={isLight}
            bar={bar}
            collapsed={collapsed}
            mobile={mobile}
            onCloseMobile={onCloseMobile}
          />
          <button
            type="button"
            onClick={() => {
              onSearch();
              if (mobile) onCloseMobile?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-full py-2.5 text-sm font-normal transition-colors",
              bar.ghost,
              bar.text,
              collapsed && !mobile ? "justify-center px-0" : "px-3",
            )}
          >
            <Search className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
            {(!collapsed || mobile) && <span>Search chats</span>}
          </button>
        </div>

        {(!collapsed || mobile) && (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            bar={bar}
            mobile={mobile}
            onCloseMobile={onCloseMobile}
          />
        )}

        {collapsed && !mobile && <div className="min-h-0 flex-1" aria-hidden />}

        <SidebarUserMenu
          collapsed={collapsed}
          mobile={mobile}
          onSignOut={onSignOut}
          onCloseMobile={onCloseMobile}
          onToggleTheme={toggleTheme}
          isLight={isLight}
          bar={bar}
          user={user}
        />
      </div>
    </>
  );

  const shell = cn(
    "flex h-full min-h-0 flex-col border-r",
    bar.bg,
    bar.border,
  );

  if (mobile) {
    return <div className={shell}>{inner}</div>;
  }

  return (
    <aside
      className={cn(
        "relative hidden h-full min-h-0 shrink-0 flex-col overflow-visible transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
        shell,
        collapsed ? "w-20" : "w-[260px]",
      )}
    >
      {inner}
    </aside>
  );
}
