"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Paperclip, SendHorizontal } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask anything about your data…",
}: ChatInputProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const submit = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }, [disabled, onSend, value]);

  return (
    <div
      className={cn(
        "shrink-0 border-t px-3 pb-4 pt-3 sm:px-6",
        isLight
          ? "border-black/[0.06] bg-gradient-to-t from-[#f2f4f9] via-[#f2f4f9]/92 to-transparent"
          : "border-white/[0.06] bg-gradient-to-t from-[#09090c]/95 via-[#09090c]/75 to-transparent",
      )}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={cn(
            "relative rounded-[1.25rem] p-1.5 shadow-lg ring-1 backdrop-blur-2xl transition-shadow duration-300",
            isLight
              ? "bg-white/80 ring-black/[0.08]"
              : "bg-white/[0.04] ring-white/[0.08]",
            focused &&
              "shadow-[0_0_0_1px_rgba(37,99,235,0.35)] ring-blue-600/35 dark:ring-blue-500/35",
          )}
        >
          <div className="flex items-end gap-1.5 sm:gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                toast.message("Attach dataset", {
                  description: "Wire your upload flow to this action.",
                })
              }
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                isLight
                  ? "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-800"
                  : "text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-100",
              )}
              aria-label="Attach dataset"
            >
              <Paperclip className="h-5 w-5" />
            </motion.button>
            <div className="relative min-h-[44px] min-w-0 flex-1 py-2">
              <textarea
                rows={1}
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={placeholder}
                className={cn(
                  "max-h-40 min-h-[24px] w-full resize-none bg-transparent text-[0.9375rem] leading-relaxed placeholder:text-neutral-500 focus:outline-none disabled:opacity-50",
                  isLight ? "text-neutral-900" : "text-neutral-100",
                )}
              />
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                toast.message("Voice input", {
                  description: "Connect speech-to-text when ready.",
                })
              }
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                isLight
                  ? "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-800"
                  : "text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-100",
              )}
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              disabled={disabled || !value.trim()}
              whileHover={{ scale: disabled || !value.trim() ? 1 : 1.04 }}
              whileTap={{ scale: disabled || !value.trim() ? 1 : 0.96 }}
              onClick={submit}
              className={cn(
                "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white",
                "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:bg-blue-500",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
              )}
              aria-label="Send message"
            >
              <AnimatePresence>
                {!disabled && value.trim() && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              <SendHorizontal className="relative h-5 w-5" />
            </motion.button>
          </div>
        </div>
        <p
          className={cn(
            "mt-2 text-center text-[11px]",
            isLight ? "text-neutral-500" : "text-neutral-600",
          )}
        >
          DataSense can make mistakes. Verify important figures against your source
          of truth.
        </p>
      </div>
    </div>
  );
}
