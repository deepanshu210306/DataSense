"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SquarePen,
  Search,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CHAT_THREADS } from "@/lib/chatThreads";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSearch: () => void;
  onSettings: () => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

const DATASETS = [
  { id: "sales", label: "Sales — FY26" },
  { id: "crm", label: "CRM — Feedback" },
  { id: "ops", label: "Operations — Logs" },
] as const;

function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/favicon.ico"
      alt="DataSense"
      width={size}
      height={size}
      className={cn("rounded-md object-contain", className)}
      unoptimized
      priority
    />
  );
}

function ProfileFavicon({
  compact,
  isLight,
  className,
}: {
  compact: boolean;
  isLight: boolean;
  className?: string;
}) {
  const outer = compact ? "h-9 w-9" : "h-8 w-8";
  const inner = compact ? 22 : 20;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1",
        outer,
        isLight
          ? "bg-white ring-black/[0.08] shadow-sm"
          : "bg-neutral-900 ring-white/[0.12]",
        className,
      )}
    >
      <LogoMark size={inner} className="rounded-full" />
    </span>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNewChat,
  onSearch,
  onSettings,
  mobile,
  onCloseMobile,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const [activeId, setActiveId] = useState<string>(CHAT_THREADS[0].id);
  const [profileOpen, setProfileOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [datasetId, setDatasetId] = useState<(typeof DATASETS)[number]["id"]>(
    DATASETS[0].id,
  );
  const profileRef = useRef<HTMLDivElement>(null);

  const activeDataset = DATASETS.find((d) => d.id === datasetId)!;

  useEffect(() => {
    if (!profileOpen) setDatasetOpen(false);
  }, [profileOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
        setDatasetOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }
  }, [profileOpen]);

  const bar = {
    bg: isLight ? "bg-[#f0f2f6]" : "bg-[#0a0a0c]",
    border: isLight ? "border-neutral-200/90" : "border-white/[0.07]",
    text: isLight ? "text-neutral-900" : "text-neutral-100",
    muted: isLight ? "text-neutral-500" : "text-neutral-500",
    hover: isLight ? "hover:bg-black/[0.05]" : "hover:bg-white/[0.06]",
    pill: isLight
      ? "bg-black/[0.05] hover:bg-black/[0.08]"
      : "bg-white/[0.07] hover:bg-white/[0.1]",
    ghost: isLight ? "hover:bg-black/[0.05]" : "hover:bg-white/[0.06]",
    active: isLight ? "bg-black/[0.07]" : "bg-white/[0.09]",
  };

  const headerRow = (
    <div
      className={cn(
        "flex shrink-0 items-center px-2 pt-2",
        mobile ? "justify-between pb-2" : "justify-between pb-1",
        mobile && cn("border-b", bar.border),
      )}
    >
      {mobile ? (
        <>
          <div className="flex items-center gap-2 pl-0.5">
            <LogoMark size={26} />
          </div>
          <button
            type="button"
            onClick={() => onCloseMobile?.()}
            className={cn(
              "rounded-full p-2 transition-colors",
              bar.ghost,
              bar.muted,
            )}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </>
      ) : collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            bar.ghost,
          )}
          aria-label="Expand sidebar"
        >
          <LogoMark size={26} />
        </button>
      ) : (
        <>
          <div className="flex items-center pl-0.5">
            <LogoMark size={28} />
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "rounded-full p-2 transition-colors",
              bar.ghost,
              bar.muted,
            )}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5 stroke-[1.5]" />
          </button>
        </>
      )}
    </div>
  );

  const profileBlock = (
    <div
      className={cn("relative z-20 mt-auto shrink-0 overflow-visible px-2 pb-2 pt-1")}
      ref={profileRef}
    >
      <button
        type="button"
        onClick={() => {
          setProfileOpen((o) => !o);
          setDatasetOpen(false);
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded-full px-2 py-2 text-left transition-colors",
          bar.ghost,
          profileOpen && bar.active,
          collapsed && !mobile && "justify-center px-0 py-1.5",
        )}
        aria-expanded={profileOpen}
        aria-haspopup="true"
      >
        <ProfileFavicon
          compact={Boolean(collapsed && !mobile)}
          isLight={isLight}
          className={cn(collapsed && !mobile && "mx-auto")}
        />
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", bar.text)}>
              Jordan Lee
            </p>
            <p className={cn("truncate text-xs", bar.muted)}>
              jordan@company.gov
            </p>
          </div>
        )}
        {(!collapsed || mobile) && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              bar.muted,
              profileOpen && "rotate-180",
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute bottom-full z-[60] mb-2 overflow-hidden rounded-xl border py-1 shadow-2xl",
              collapsed && !mobile
                ? "left-0 w-[min(280px,calc(100vw-1.5rem))]"
                : "left-2 right-2",
              isLight
                ? "border-black/10 bg-white shadow-black/5"
                : "border-white/10 bg-[#141416] shadow-black/40",
            )}
          >
            <button
              type="button"
              onClick={() => {
                onSettings();
                setProfileOpen(false);
                if (mobile) onCloseMobile?.();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                isLight
                  ? "text-neutral-800 hover:bg-black/[0.04]"
                  : "text-white/90 hover:bg-white/[0.06]",
              )}
            >
              <Settings className="h-4 w-4 shrink-0 opacity-70" />
              Settings
            </button>
            <button
              type="button"
              onClick={() => {
                toggleTheme();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                isLight
                  ? "text-neutral-800 hover:bg-black/[0.04]"
                  : "text-white/90 hover:bg-white/[0.06]",
              )}
            >
              {isLight ? (
                <Moon className="h-4 w-4 shrink-0 opacity-70" />
              ) : (
                <Sun className="h-4 w-4 shrink-0 opacity-70" />
              )}
              {isLight ? "Dark mode" : "Light mode"}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.message("Help", {
                  description: "Documentation and support options open here.",
                });
                setProfileOpen(false);
                if (mobile) onCloseMobile?.();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                isLight
                  ? "text-neutral-800 hover:bg-black/[0.04]"
                  : "text-white/90 hover:bg-white/[0.06]",
              )}
            >
              <CircleHelp className="h-4 w-4 shrink-0 opacity-70" />
              Help
            </button>
            <button
              type="button"
              onClick={() => {
                toast.message("Signed out", {
                  description: "You would be redirected to the sign-in page.",
                });
                setProfileOpen(false);
                if (mobile) onCloseMobile?.();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                isLight
                  ? "text-neutral-800 hover:bg-black/[0.04]"
                  : "text-white/90 hover:bg-white/[0.06]",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-70" />
              Log out
            </button>

            <div
              className={cn(
                "mx-2 my-1 h-px",
                isLight ? "bg-black/10" : "bg-white/10",
              )}
            />

            <div className="px-2 pb-1 pt-1">
              <p
                className={cn(
                  "px-1 pb-1 text-[10px] font-medium uppercase tracking-wide",
                  bar.muted,
                )}
              >
                Dataset
              </p>
              <button
                type="button"
                onClick={() => setDatasetOpen((d) => !d)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  isLight
                    ? "text-neutral-800 hover:bg-black/[0.04]"
                    : "text-white/90 hover:bg-white/[0.06]",
                )}
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="min-w-0 flex-1 truncate">
                  {activeDataset.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 opacity-60 transition-transform",
                    datasetOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {datasetOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 pt-1">
                      {DATASETS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDatasetId(d.id);
                            setDatasetOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                            isLight
                              ? "text-neutral-700 hover:bg-black/[0.04]"
                              : "text-white/80 hover:bg-white/[0.06]",
                          )}
                        >
                          <span className="flex-1 truncate">{d.label}</span>
                          {d.id === datasetId && (
                            <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const inner = (
    <>
      {headerRow}

      <div className="flex min-h-0 flex-1 flex-col overflow-visible px-2">
        <div className={cn("space-y-1", collapsed && !mobile ? "mt-2" : "mt-1")}>
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (mobile) onCloseMobile?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-full py-2.5 text-sm font-normal transition-colors",
              bar.pill,
              bar.text,
              collapsed && !mobile ? "justify-center px-0" : "px-3",
            )}
          >
            <SquarePen className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
            {(!collapsed || mobile) && <span>New chat</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              onSearch();
              if (mobile) onCloseMobile?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-full py-2.5 text-sm font-normal transition-colors",
              bar.ghost,
              bar.text,
              collapsed && !mobile ? "justify-center px-0" : "px-3",
            )}
          >
            <Search className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
            {(!collapsed || mobile) && <span>Search chats</span>}
          </button>
        </div>

        {(!collapsed || mobile) && (
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-2">
            <p
              className={cn(
                "px-3 pb-2 text-[11px] font-semibold tracking-wide",
                bar.muted,
              )}
            >
              Recents
            </p>
            <ul className="space-y-0.5">
              {CHAT_THREADS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(t.id);
                      if (mobile) onCloseMobile?.();
                    }}
                    className={cn(
                      "w-full truncate rounded-full px-3 py-2 text-left text-sm transition-colors",
                      activeId === t.id ? bar.active : cn(bar.text, bar.ghost),
                    )}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {collapsed && !mobile && <div className="min-h-0 flex-1" aria-hidden />}

        {profileBlock}
      </div>
    </>
  );

  const shell = cn(
    "flex h-full min-h-0 flex-col border-r",
    bar.bg,
    bar.border,
  );

  if (mobile) {
    return <div className={shell}>{inner}</div>;
  }

  return (
    <aside
      className={cn(
        "relative hidden h-full min-h-0 shrink-0 flex-col overflow-visible transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
        shell,
        collapsed ? "w-20" : "w-[260px]",
      )}
    >
      {inner}
    </aside>
  );
}

export function MobileSidebarFab({
  onOpen,
  theme,
}: {
  onOpen: () => void;
  theme: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className={cn(
        "fixed bottom-[5.25rem] left-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl lg:hidden",
        isLight
          ? "border-black/10 bg-white/85 text-neutral-800"
          : "border-white/10 bg-[#0a0a0c] text-neutral-100",
      )}
      aria-label="Open menu"
    >
      <PanelLeftOpen className="h-5 w-5" />
    </motion.button>
  );
}

export function MobileSidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-[min(88vw,280px)] overflow-hidden shadow-2xl lg:hidden"
          >
            <div className="flex h-full min-h-0 flex-col">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
