"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signUpSchema } from "@/schemas/signUpSchema";
import { cn } from "@/lib/utils";

type EmailAuthFormProps = {
  isLight: boolean;
  onSuccess?: () => void;
};

export function EmailAuthForm({ isLight, onSuccess }: EmailAuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const schema = mode === "signUp" ? signUpSchema : signInSchema;
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signUp") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          setError(body.error ?? "Could not create account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          mode === "signUp"
            ? "Account created but sign-in failed. Try signing in."
            : "Invalid email or password.",
        );
        return;
      }

      onSuccess?.();
      router.push("/chat");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = cn(
    "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20",
    isLight
      ? "border-black/[0.1] bg-white text-neutral-900 placeholder:text-neutral-400"
      : "border-white/[0.1] bg-white/[0.03] text-neutral-100 placeholder:text-neutral-500",
  );

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border p-6 text-left shadow-xl",
        isLight
          ? "border-black/[0.07] bg-white shadow-black/[0.04]"
          : "border-white/[0.08] bg-white/[0.025] shadow-black/40",
      )}
    >
      <div className="mb-1.5 text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          {mode === "signUp" ? "Create your account" : "Welcome back"}
        </h2>
        <p
          className={cn(
            "mt-1 text-xs",
            isLight ? "text-neutral-500" : "text-neutral-500",
          )}
        >
          {mode === "signUp"
            ? "Start exploring open data in seconds."
            : "Sign in to continue your conversations."}
        </p>
      </div>

      <div
        className={cn(
          "mb-4 mt-4 flex rounded-full p-1",
          isLight ? "bg-black/[0.04]" : "bg-white/[0.05]",
        )}
      >
        <button
          type="button"
          onClick={() => {
            setMode("signIn");
            setShowPassword(false);
            setError(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-sm font-medium transition",
            mode === "signIn"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
              : isLight
                ? "text-neutral-600 hover:text-neutral-900"
                : "text-neutral-400 hover:text-neutral-200",
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signUp");
            setShowPassword(false);
            setError(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-sm font-medium transition",
            mode === "signUp"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
              : isLight
                ? "text-neutral-600 hover:text-neutral-900"
                : "text-neutral-400 hover:text-neutral-200",
          )}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="auth-email" className="sr-only">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div className="relative">
          <label htmlFor="auth-password" className="sr-only">
            Password
          </label>
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            autoComplete={
              mode === "signUp" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signUp" ? "Create a password (min 8)" : "Password"}
            className={cn(inputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={cn(
              "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition",
              isLight
                ? "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-700"
                : "text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200",
            )}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        {error && (
          <p
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              isLight
                ? "bg-red-50 text-red-600"
                : "bg-red-500/10 text-red-400",
            )}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signUp"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}
