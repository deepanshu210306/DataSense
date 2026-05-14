"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div
      className={cn(
        "ds-shimmer rounded-lg ring-1",
        isLight ? "ring-black/[0.06]" : "ring-white/[0.05]",
        className,
      )}
    />
  );
}
