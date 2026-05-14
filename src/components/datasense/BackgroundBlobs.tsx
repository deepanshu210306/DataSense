"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function BackgroundBlobs() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0",
          isLight
            ? "bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(37,99,235,0.06),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_0%,rgba(15,23,42,0.04),transparent)]"
            : "bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(37,99,235,0.12),transparent_50%),radial-gradient(ellipse_50%_40%_at_100%_10%,rgba(59,130,246,0.06),transparent)]",
        )}
      />
      <div
        className={cn(
          "ds-blob absolute -left-40 top-0 h-[420px] w-[420px] rounded-full blur-[120px]",
          isLight ? "bg-blue-400/[0.07]" : "bg-blue-600/[0.08]",
        )}
      />
      <div
        className={cn(
          "ds-blob ds-blob-delay absolute -right-32 top-1/4 h-[360px] w-[360px] rounded-full blur-[110px]",
          isLight ? "bg-slate-300/[0.12]" : "bg-blue-500/[0.05]",
        )}
      />
      <div
        className={cn(
          "ds-blob ds-blob-delay-2 absolute bottom-[-10%] left-1/2 h-[320px] w-[min(80vw,480px)] -translate-x-1/2 rounded-full blur-[100px]",
          isLight ? "bg-white/[0.7]" : "bg-neutral-900/[0.5]",
        )}
      />
    </div>
  );
}
