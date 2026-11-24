"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { CHAT } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type DeleteChatDialogProps = {
  /** Title of the chat awaiting confirmation; `null` keeps the dialog closed. */
  chatTitle: string | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteChatDialog({
  chatTitle,
  deleting,
  onCancel,
  onConfirm,
}: DeleteChatDialogProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const open = chatTitle !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={CHAT.deleteChatCancel}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!deleting) onCancel();
            }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            aria-describedby="delete-chat-description"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 z-[70] w-[min(92vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 shadow-2xl ring-1 backdrop-blur-2xl",
              isLight
                ? "border-black/10 bg-white/95 ring-black/5"
                : "border-white/10 bg-neutral-950/95 ring-black/40",
            )}
          >
            <div className="flex gap-3.5">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isLight
                    ? "bg-red-500/10 text-red-600"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                <Trash2 className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div className="min-w-0 pt-0.5">
                <h2
                  id="delete-chat-title"
                  className={cn(
                    "text-base font-semibold",
                    isLight ? "text-neutral-900" : "text-neutral-100",
                  )}
                >
                  {CHAT.deleteChatTitle}
                </h2>
                <p
                  id="delete-chat-description"
                  className="mt-1.5 break-words text-sm leading-relaxed text-neutral-500"
                >
                  {CHAT.deleteChatDescription(chatTitle)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={onCancel}
                disabled={deleting}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
                  isLight
                    ? "border-black/10 text-neutral-700 hover:bg-black/[0.04]"
                    : "border-white/10 text-neutral-200 hover:bg-white/[0.06]",
                )}
              >
                {CHAT.deleteChatCancel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? CHAT.deleteChatPending : CHAT.deleteChatConfirm}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
