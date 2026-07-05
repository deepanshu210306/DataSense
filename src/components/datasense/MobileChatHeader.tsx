"use client";

import { Menu } from "lucide-react";
import { APP_NAME } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type MobileChatHeaderProps = {
  onOpenMenu: () => void;
  datasetLabel?: string | null;
};

export function MobileChatHeader({
  onOpenMenu,
  datasetLabel,
}: MobileChatHeaderProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 border-b px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden",
        isLight
          ? "border-black/[0.08] bg-white/90 backdrop-blur-md"
          : "border-white/[0.08] bg-[#0d0d0d]/90 backdrop-blur-md",
      )}
    >
      <button
        type="button"
        onClick={onOpenMenu}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          isLight
            ? "text-neutral-700 hover:bg-black/[0.05]"
            : "text-neutral-200 hover:bg-white/[0.08]",
        )}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isLight ? "text-neutral-900" : "text-white",
          )}
        >
          {APP_NAME}
        </p>
        {datasetLabel && (
          <p
            className={cn(
              "truncate text-[11px]",
              isLight ? "text-neutral-500" : "text-neutral-400",
            )}
          >
            {datasetLabel}
          </p>
        )}
      </div>
    </header>
  );
}
