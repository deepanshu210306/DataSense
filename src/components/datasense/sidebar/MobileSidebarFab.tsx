"use client";

import { motion } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileSidebarFab({
  onOpen,
  theme,
}: {
  onOpen: () => void;
  theme: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className={cn(
        "fixed bottom-[5.25rem] left-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl lg:hidden",
        isLight
          ? "border-black/10 bg-white/85 text-neutral-800"
          : "border-white/10 bg-[#0a0a0c] text-neutral-100",
      )}
      aria-label="Open menu"
    >
      <PanelLeftOpen className="h-5 w-5" />
    </motion.button>
  );
}
