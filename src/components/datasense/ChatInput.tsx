"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { CHAT } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  resourceId?: string | null;
  datasetLabel?: string | null;
};

export function ChatInput({
  onSend,
  disabled,
  resourceId,
  datasetLabel,
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

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="pointer-events-none shrink-0 px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto mx-auto w-full max-w-4xl">
        <div
          className={cn(
            "relative flex flex-col rounded-[1.75rem] border shadow-lg transition-shadow duration-200",
            isLight
              ? "border-black/[0.08] bg-white shadow-black/[0.04]"
              : "border-white/[0.08] bg-[#2f2f2f] shadow-black/40",
            focused &&
              (isLight
                ? "shadow-black/[0.08]"
                : "border-white/[0.12] shadow-black/60"),
          )}
        >
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
            placeholder={CHAT.inputPlaceholder}
            className={cn(
              "max-h-40 min-h-[52px] w-full resize-none bg-transparent px-5 pb-2 pt-4 text-[0.9375rem] leading-relaxed placeholder:text-neutral-500 focus:outline-none disabled:opacity-50",
              isLight ? "text-neutral-900" : "text-neutral-100",
            )}
          />

          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <p
              className={cn(
                "min-w-0 truncate pl-2 text-[11px]",
                !resourceId
                  ? isLight
                    ? "text-amber-600"
                    : "text-amber-400/90"
                  : isLight
                    ? "text-neutral-400"
                    : "text-neutral-500",
              )}
            >
              {!resourceId
                ? CHAT.datasetNone
                : datasetLabel
                  ? CHAT.datasetSelected(datasetLabel)
                  : CHAT.datasetSelectedShort}
            </p>

            <motion.button
              type="button"
              disabled={!canSend}
              whileHover={{ scale: canSend ? 1.04 : 1 }}
              whileTap={{ scale: canSend ? 0.96 : 1 }}
              onClick={submit}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                canSend
                  ? isLight
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-white text-black hover:bg-neutral-200"
                  : isLight
                    ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                    : "cursor-not-allowed bg-white/[0.08] text-neutral-600",
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
            </motion.button>
          </div>
        </div>

        <p
          className={cn(
            "mt-2.5 text-center text-[11px] leading-relaxed",
            isLight ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          {CHAT.inputHint} {CHAT.verifyDisclaimer}
        </p>
      </div>
    </div>
  );
}
