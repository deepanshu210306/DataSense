"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CircleHelp,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import type { DatasetSummary } from "@/lib/datasets/types";
import { cn } from "@/lib/utils";
import { DatasetPicker } from "./DatasetPicker";
import type { SidebarBar } from "./sidebarStyles";

type SidebarUserMenuProps = {
  collapsed: boolean;
  mobile?: boolean;
  resourceId: string | null;
  onResourceIdChange: (resourceId: string) => void;
  datasets: DatasetSummary[];
  datasetsLoading: boolean;
  onDatasetsRefresh: () => void;
  onSettings: () => void;
  onSignOut: () => void;
  onCloseMobile?: () => void;
  onToggleTheme: () => void;
  isLight: boolean;
  bar: SidebarBar;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

function ProfileAvatar({
  compact,
  isLight,
  image,
  name,
  className,
}: {
  compact: boolean;
  isLight: boolean;
  image?: string | null;
  name?: string | null;
  className?: string;
}) {
  const outer = compact ? "h-9 w-9" : "h-8 w-8";
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "Profile"}
        width={compact ? 36 : 32}
        height={compact ? 36 : 32}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1",
          outer,
          className,
        )}
        unoptimized
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1",
        outer,
        isLight
          ? "bg-blue-600/10 text-blue-700 ring-blue-600/15"
          : "bg-blue-500/15 text-blue-300 ring-blue-400/20",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function SidebarUserMenu({
  collapsed,
  mobile,
  resourceId,
  onResourceIdChange,
  datasets,
  datasetsLoading,
  onDatasetsRefresh,
  onSettings,
  onSignOut,
  onCloseMobile,
  onToggleTheme,
  isLight,
  bar,
  user,
}: SidebarUserMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? "Signed in user";
  const displayEmail = user?.email ?? "";

  const closeProfile = () => {
    setProfileOpen(false);
    setDatasetOpen(false);
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        closeProfile();
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }
  }, [profileOpen]);

  return (
    <div
      className={cn(
        "relative z-20 mt-auto shrink-0 overflow-visible px-2 pb-2 pt-1",
      )}
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
        <ProfileAvatar
          compact={Boolean(collapsed && !mobile)}
          isLight={isLight}
          image={user?.image}
          name={user?.name}
          className={cn(collapsed && !mobile && "mx-auto")}
        />
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", bar.text)}>
              {displayName}
            </p>
            {displayEmail && (
              <p className={cn("truncate text-xs", bar.muted)}>
                {displayEmail}
              </p>
            )}
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
                closeProfile();
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
              Dataset preferences
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleTheme();
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
                window.location.href = "/";
                closeProfile();
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
              About DataSense
            </button>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                closeProfile();
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

            <DatasetPicker
              resourceId={resourceId}
              onResourceIdChange={onResourceIdChange}
              datasets={datasets}
              datasetsLoading={datasetsLoading}
              onDatasetsRefresh={onDatasetsRefresh}
              open={datasetOpen}
              onOpenChange={setDatasetOpen}
              isLight={isLight}
              bar={bar}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
