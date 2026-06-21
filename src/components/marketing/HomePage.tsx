"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Database,
  MessageSquareText,
  Shield,
  Sparkles,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { EmailAuthForm } from "@/components/marketing/EmailAuthForm";
import { APP_NAME, HOME } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type HomePageProps = {
  session: Session | null;
};

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Any data.gov.in dataset",
    description:
      "Paste a dataset URL or resource ID to add it. Pick from your library before each chat.",
  },
  {
    icon: Database,
    title: "Government open data",
    description:
      "Answers are grounded in live rows fetched from data.gov.in — not static summaries.",
  },
  {
    icon: BarChart3,
    title: "Shared dataset library",
    description:
      "Resolved datasets are cached for everyone — add once, reuse across chats.",
  },
  {
    icon: Shield,
    title: "Your chat history",
    description:
      "Sign in to save conversations, revisit recent chats, and continue where you left off.",
  },
] as const;

export function HomePage({ session: initialSession }: HomePageProps) {
  const { data: session } = useSession();
  const activeSession = session ?? initialSession;
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-x-hidden",
        isLight
          ? "bg-gradient-to-b from-[#f7f8fc] via-white to-[#eef1f8] text-neutral-900"
          : "bg-gradient-to-b from-[#0b0b0e] via-[#09090c] to-[#070708] text-neutral-100",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={cn(
            "absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl",
            isLight ? "bg-blue-400/20" : "bg-blue-600/15",
          )}
        />
        <div
          className={cn(
            "absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl",
            isLight ? "bg-indigo-300/20" : "bg-indigo-500/10",
          )}
        />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="DataSense"
            width={32}
            height={32}
            className="rounded-lg"
            unoptimized
          />
          <span className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeSession?.user ? (
            <>
              <Link
                href="/chat"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
              >
                Open app
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  isLight
                    ? "text-neutral-600 hover:bg-black/[0.04]"
                    : "text-neutral-300 hover:bg-white/[0.06]",
                )}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 sm:pt-14">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className={cn(
              "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
              isLight
                ? "bg-blue-600/10 ring-blue-600/15"
                : "bg-blue-500/15 ring-blue-400/20",
            )}
          >
            <Sparkles
              className={cn(
                "h-7 w-7",
                isLight ? "text-blue-700" : "text-blue-400",
              )}
            />
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {HOME.heroTitle}
          </h1>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg",
              isLight ? "text-neutral-600" : "text-neutral-400",
            )}
          >
            {HOME.heroDescription}
          </p>

          {!activeSession?.user && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/chat" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <GoogleMark />
                Continue with Google
              </button>
              <p
                className={cn(
                  "text-xs",
                  isLight ? "text-neutral-500" : "text-neutral-500",
                )}
              >
                or use email
              </p>
              <EmailAuthForm isLight={isLight} />
            </div>
          )}

          {activeSession?.user && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Go to chat
              </Link>
            </div>
          )}
        </motion.section>

        <section className="mt-20 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.35 }}
              className={cn(
                "rounded-2xl border p-5 shadow-sm",
                isLight
                  ? "border-black/[0.06] bg-white/80"
                  : "border-white/[0.06] bg-white/[0.03]",
              )}
            >
              <feature.icon
                className={cn(
                  "mb-3 h-5 w-5",
                  isLight ? "text-blue-700" : "text-blue-400",
                )}
              />
              <h2 className="text-base font-medium">{feature.title}</h2>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  isLight ? "text-neutral-600" : "text-neutral-400",
                )}
              >
                {feature.description}
              </p>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#fff"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#fff"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#fff"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#fff"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
