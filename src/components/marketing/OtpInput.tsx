"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isLight: boolean;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
};

/** Segmented numeric code input with paste, backspace and arrow-key support. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  isLight,
  onComplete,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !joined.includes("")) {
      onComplete?.(joined);
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setDigit(index, digit);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputs.current[focusIndex]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-11 rounded-xl border text-center text-lg font-semibold outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60",
            isLight
              ? "border-black/[0.12] bg-white text-neutral-900"
              : "border-white/[0.12] bg-white/[0.03] text-neutral-100",
          )}
        />
      ))}
    </div>
  );
}
