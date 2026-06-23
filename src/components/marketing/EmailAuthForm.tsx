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

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border p-5 shadow-sm",
        isLight
          ? "border-black/[0.08] bg-white/90"
          : "border-white/[0.08] bg-white/[0.04]",
      )}
    >
      <div className="mb-4 flex rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.06]">
        <button
          type="button"
          onClick={() => {
            setMode("signIn");
            setShowPassword(false);
            setError(null);
          }}
          className={cn(
            "flex-1 rounded-full py-1.5 text-sm transition",
            mode === "signIn"
              ? "bg-blue-600 font-medium text-white"
              : isLight
                ? "text-neutral-600"
                : "text-neutral-400",
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
            "flex-1 rounded-full py-1.5 text-sm transition",
            mode === "signUp"
              ? "bg-blue-600 font-medium text-white"
              : isLight
                ? "text-neutral-600"
                : "text-neutral-400",
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
            placeholder="Email"
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20",
              isLight
                ? "border-black/[0.1] bg-white text-neutral-900"
                : "border-white/[0.1] bg-black/20 text-neutral-100",
            )}
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
            placeholder={mode === "signUp" ? "Password (min 8 chars)" : "Password"}
            className={cn(
              "w-full rounded-xl border py-2.5 pl-3 pr-10 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20",
              isLight
                ? "border-black/[0.1] bg-white text-neutral-900"
                : "border-white/[0.1] bg-black/20 text-neutral-100",
            )}
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
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signUp"
              ? "Create account"
              : "Sign in with email"}
        </button>
      </form>
    </div>
  );
}
