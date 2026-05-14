"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { CHAT_THREADS } from "@/lib/chatThreads";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type SearchChatsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchChatsDialog({ open, onClose }: SearchChatsDialogProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filtered = CHAT_THREADS.filter((t) =>
    t.title.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close search"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-chats-title"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed left-1/2 top-[min(18%,100px)] z-[70] w-[min(92vw,440px)] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl ring-1 backdrop-blur-2xl",
              isLight
                ? "border-black/10 bg-white/95 ring-black/5"
                : "border-white/10 bg-neutral-950/95 ring-black/40",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 border-b px-3 py-2",
                isLight ? "border-black/[0.06]" : "border-white/[0.06]",
              )}
            >
              <Search
                className={cn(
                  "h-4 w-4 shrink-0",
                  isLight ? "text-neutral-500" : "text-neutral-500",
                )}
              />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search conversations…"
                className={cn(
                  "min-w-0 flex-1 bg-transparent py-2 text-sm placeholder:text-neutral-500 focus:outline-none",
                  isLight ? "text-neutral-900" : "text-neutral-100",
                )}
              />
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  isLight
                    ? "text-neutral-500 hover:bg-black/[0.05]"
                    : "text-neutral-500 hover:bg-white/[0.06]",
                )}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              <p id="search-chats-title" className="sr-only">
                Search chats
              </p>
              {filtered.length === 0 ? (
                <p
                  className={cn(
                    "px-2 py-6 text-center text-sm",
                    isLight ? "text-neutral-500" : "text-neutral-500",
                  )}
                >
                  No chats match your search.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          isLight
                            ? "text-neutral-700 hover:bg-black/[0.04] hover:text-neutral-950"
                            : "text-neutral-300 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        <span className="truncate font-medium">{t.title}</span>
                        <span
                          className={cn(
                            "shrink-0 pl-2 text-[11px]",
                            isLight ? "text-neutral-500" : "text-neutral-600",
                          )}
                        >
                          {t.updated}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
