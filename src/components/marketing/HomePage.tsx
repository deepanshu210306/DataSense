"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Database,
  MessageSquareText,
  Shield,
  Sparkles,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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
      "Paste a dataset URL or resource ID to add it. Build a personal library and pick before each chat.",
  },
  {
    icon: Database,
    title: "Grounded in real rows",
    description:
      "Answers are computed from live records fetched from data.gov.in — never vague, static summaries.",
  },
  {
    icon: BarChart3,
    title: "Shared catalog",
    description:
      "Resolved datasets are cached for everyone — add one once, and it's ready to reuse across chats.",
  },
  {
    icon: Shield,
    title: "Saved conversations",
    description:
      "Sign in to keep your chat history, revisit past questions, and continue right where you left off.",
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
          ? "bg-[#f6f7f9] text-neutral-900"
          : "bg-[#0a0a0f] text-neutral-100",
      )}
    >
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={cn(
            "absolute left-1/2 top-[-15%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-[120px]",
            isLight ? "bg-indigo-400/15" : "bg-indigo-600/15",
          )}
        />
        <div
          className={cn(
            "absolute -right-32 top-1/3 h-80 w-80 rounded-full blur-[100px]",
            isLight ? "bg-violet-300/20" : "bg-violet-500/10",
          )}
        />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Image
            src="/favicon.ico"
            alt="DataSense"
            width={30}
            height={30}
            className="rounded-lg"
            unoptimized
          />
          <span className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeSession?.user ? (
            <>
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Open app
                <ArrowRight className="h-3.5 w-3.5" />
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
          ) : null}
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-8 sm:pt-16">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className={cn(
              "mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium",
              isLight
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {HOME.badge}
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-[3.25rem] sm:leading-[1.05]">
            {HOME.heroTitle}
          </h1>
          <p
            className={cn(
              "mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg",
              isLight ? "text-neutral-600" : "text-neutral-400",
            )}
          >
            {HOME.heroDescription}
          </p>

          {!activeSession?.user && (
            <div className="mt-9 flex flex-col items-center">
              <EmailAuthForm isLight={isLight} />
            </div>
          )}

          {activeSession?.user && (
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Go to chat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </motion.section>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto mt-20 max-w-2xl text-center"
        >
          <p
            className={cn(
              "text-balance text-xl font-medium leading-snug tracking-tight sm:text-2xl",
              isLight ? "text-neutral-800" : "text-neutral-200",
            )}
          >
            &ldquo;{HOME.quote}&rdquo;
          </p>
          <footer
            className={cn(
              "mt-3 text-sm",
              isLight ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            {HOME.quoteAuthor}
          </footer>
        </motion.blockquote>

        {/* Features */}
        <section className="mt-20">
          <h2
            className={cn(
              "mb-8 text-center text-sm font-semibold uppercase tracking-[0.14em]",
              isLight ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            {HOME.featuresTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * index, duration: 0.35 }}
                className={cn(
                  "group rounded-2xl border p-6 transition-colors",
                  isLight
                    ? "border-black/[0.07] bg-white hover:border-indigo-300/70"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-indigo-500/25 hover:bg-white/[0.035]",
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    isLight
                      ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
                      : "bg-indigo-500/12 text-indigo-300 group-hover:bg-indigo-500/20",
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  {feature.title}
                </h3>
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
          </div>
        </section>
      </main>
    </div>
  );
}
