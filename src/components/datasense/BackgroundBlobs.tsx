"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function BackgroundBlobs() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden opacity-60"
    >
      <div
        className={cn(
          "absolute inset-0",
          isLight
            ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,0,0,0.03),transparent)]"
            : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.03),transparent)]",
        )}
      />
    </div>
  );
}
