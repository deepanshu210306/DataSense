"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signUpSchema } from "@/schemas/signUpSchema";
import { OtpInput } from "@/components/marketing/OtpInput";
import { cn } from "@/lib/utils";

type EmailAuthFormProps = {
  isLight: boolean;
  onSuccess?: () => void;
};

type Mode = "signIn" | "signUp";
type Step = "credentials" | "verify";

const RESEND_COOLDOWN = 30;

export function EmailAuthForm({ isLight, onSuccess }: EmailAuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStep("credentials");
    setShowPassword(false);
    setCode("");
    resetMessages();
  }

  async function finishSignIn(signInEmail: string, signInPassword: string) {
    const result = await signIn("credentials", {
      email: signInEmail,
      password: signInPassword,
      redirect: false,
    });
    if (!result?.ok) {
      setError("Verified! But sign-in failed — please sign in again.");
      return;
    }
    onSuccess?.();
    router.push("/chat");
    router.refresh();
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

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
        const body = (await res.json()) as {
          error?: string;
          requiresVerification?: boolean;
        };
        if (!res.ok) {
          setError(body.error ?? "Could not create account.");
          return;
        }
        setStep("verify");
        setCode("");
        setInfo(`We sent a 6-digit code to ${parsed.data.email}.`);
        setCooldown(RESEND_COOLDOWN);
        return;
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.code === "email_not_verified") {
        setStep("verify");
        setCode("");
        setInfo("Please verify your email. We're sending you a fresh code…");
        await requestCode(parsed.data.email, { silent: true });
        return;
      }

      if (!result?.ok) {
        setError("Invalid email or password.");
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

  async function requestCode(
    targetEmail: string,
    opts?: { silent?: boolean },
  ) {
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not send a code.");
        return;
      }
      setCooldown(RESEND_COOLDOWN);
      if (!opts?.silent) setInfo(`A new code is on its way to ${targetEmail}.`);
    } catch {
      setError("Could not send a code. Please try again.");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not verify the code.");
        return;
      }
      await finishSignIn(email, password);
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

  const cardClass = cn(
    "w-full max-w-sm rounded-2xl border p-6 text-left shadow-xl",
    isLight
      ? "border-black/[0.07] bg-white shadow-black/[0.04]"
      : "border-white/[0.08] bg-white/[0.025] shadow-black/40",
  );

  if (step === "verify") {
    return (
      <div className={cardClass}>
        <div className="mb-5 flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-3 flex h-11 w-11 items-center justify-center rounded-2xl",
              isLight
                ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                : "bg-indigo-500/12 text-indigo-300 ring-1 ring-indigo-500/20",
            )}
          >
            <MailCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Check your inbox
          </h2>
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed",
              isLight ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            Enter the 6-digit code we sent to{" "}
            <span className={isLight ? "text-neutral-800" : "text-neutral-300"}>
              {email}
            </span>
            .
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <OtpInput
            value={code}
            onChange={setCode}
            isLight={isLight}
            disabled={loading}
            onComplete={(full) => {
              setCode(full);
            }}
          />

          {error && (
            <p
              className={cn(
                "rounded-lg px-3 py-2 text-center text-sm",
                isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400",
              )}
            >
              {error}
            </p>
          )}
          {info && !error && (
            <p
              className={cn(
                "text-center text-xs",
                isLight ? "text-neutral-500" : "text-neutral-400",
              )}
            >
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              resetMessages();
            }}
            className={cn(
              "inline-flex items-center gap-1 transition",
              isLight
                ? "text-neutral-500 hover:text-neutral-800"
                : "text-neutral-400 hover:text-neutral-200",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <button
            type="button"
            disabled={cooldown > 0 || loading}
            onClick={() => void requestCode(email)}
            className={cn(
              "font-medium transition disabled:cursor-not-allowed",
              cooldown > 0
                ? isLight
                  ? "text-neutral-400"
                  : "text-neutral-600"
                : isLight
                  ? "text-indigo-600 hover:text-indigo-500"
                  : "text-indigo-400 hover:text-indigo-300",
            )}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
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
          onClick={() => switchMode("signIn")}
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
          onClick={() => switchMode("signUp")}
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

      <form onSubmit={handleCredentials} className="space-y-3">
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
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "signUp" ? "Create a password (min 8)" : "Password"
            }
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
              isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400",
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
