"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronDown,
  Database,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { isResourceId } from "@/schemas/resourceIdSchema";
import { CHAT } from "@/lib/copy";
import type { DatasetSummary } from "@/lib/datasets/types";
import { cn } from "@/lib/utils";
import type { SidebarBar } from "./sidebarStyles";

type DatasetPickerProps = {
  resourceId: string | null;
  onResourceIdChange: (resourceId: string) => void;
  datasets: DatasetSummary[];
  datasetsLoading: boolean;
  onDatasetsRefresh: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLight: boolean;
  bar: SidebarBar;
  collapsed?: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

function matchesDataset(dataset: DatasetSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    dataset.title.toLowerCase().includes(q) ||
    dataset.portalUrl.toLowerCase().includes(q) ||
    dataset.resourceId.toLowerCase().includes(q)
  );
}

function normalizePortalPath(url: string): string | null {
  try {
    return new URL(url.trim()).pathname.replace(/\/$/, "").toLowerCase();
  } catch {
    return null;
  }
}

function findExistingDataset(
  datasets: DatasetSummary[],
  input: string,
): DatasetSummary | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  if (isResourceId(trimmed)) {
    return datasets.find(
      (d) => d.resourceId.toLowerCase() === trimmed.toLowerCase(),
    );
  }

  const inputPath = normalizePortalPath(trimmed);
  const lower = trimmed.toLowerCase();

  return datasets.find((d) => {
    if (d.portalUrl.toLowerCase() === lower) return true;
    const portalPath = normalizePortalPath(d.portalUrl);
    return Boolean(inputPath && portalPath && inputPath === portalPath);
  });
}

export function DatasetPicker({
  resourceId,
  onResourceIdChange,
  datasets,
  datasetsLoading,
  onDatasetsRefresh,
  open,
  onOpenChange,
  isLight,
  bar,
  collapsed,
  mobile,
  onCloseMobile,
}: DatasetPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const activeDataset = datasets.find((d) => d.resourceId === resourceId);

  const filteredDatasets = useMemo(
    () => datasets.filter((d) => matchesDataset(d, searchQuery)),
    [datasets, searchQuery],
  );

  const existingFromAddInput = useMemo(
    () => findExistingDataset(datasets, addInput),
    [addInput, datasets],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setSearchQuery("");
        setShowAdd(false);
        setAddInput("");
        setResolveError(null);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const selectDataset = useCallback(
    (id: string) => {
      onResourceIdChange(id);
      handleOpenChange(false);
      if (mobile) onCloseMobile?.();
    },
    [handleOpenChange, mobile, onCloseMobile, onResourceIdChange],
  );

  // Open the add form automatically when the catalog is empty.
  useEffect(() => {
    if (open && !datasetsLoading && datasets.length === 0) {
      setShowAdd(true);
    }
  }, [open, datasets.length, datasetsLoading]);

  const resolveDataset = useCallback(async () => {
    const trimmed = addInput.trim();
    if (!trimmed) return;

    const existing = findExistingDataset(datasets, trimmed);
    if (existing) {
      selectDataset(existing.resourceId);
      setAddInput("");
      setShowAdd(false);
      return;
    }

    setResolving(true);
    setResolveError(null);
    try {
      const body = isResourceId(trimmed)
        ? { resourceId: trimmed }
        : { url: trimmed };

      const response = await fetch("/api/datasets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        dataset?: { resourceId: string; title: string };
        error?: string;
      };

      if (!response.ok) {
        setResolveError(data.error ?? "Could not resolve dataset.");
        return;
      }

      if (data.dataset) {
        selectDataset(data.dataset.resourceId);
        onDatasetsRefresh();
        setAddInput("");
        setShowAdd(false);
      }
    } catch {
      setResolveError("Network error. Try again.");
    } finally {
      setResolving(false);
    }
  }, [addInput, datasets, onDatasetsRefresh, selectDataset]);

  const panelShell = cn(
    "overflow-hidden rounded-xl border shadow-lg",
    isLight
      ? "border-black/10 bg-white shadow-black/5"
      : "border-white/10 bg-[#141416] shadow-black/40",
    collapsed && !mobile
      ? "absolute left-full top-0 z-[60] ml-2 w-[min(300px,calc(100vw-1.5rem))]"
      : "mt-1",
  );

  return (
    <div className={cn("relative", collapsed && !mobile && "flex justify-center")}>
      <button
        type="button"
        onClick={() => handleOpenChange(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border py-2.5 text-left text-sm transition-colors",
          isLight
            ? "border-black/[0.08] bg-black/[0.02] hover:bg-black/[0.04]"
            : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]",
          open &&
            (isLight
              ? "border-blue-500/30 bg-blue-50/50"
              : "border-blue-500/25 bg-blue-500/10"),
          collapsed && !mobile ? "justify-center border-transparent px-0" : "px-3",
        )}
        aria-expanded={open}
        title={
          collapsed && !mobile
            ? activeDataset?.title ?? CHAT.datasetPickerLabel
            : undefined
        }
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isLight ? "bg-blue-600/10" : "bg-blue-500/15",
          )}
        >
          <BarChart3
            className={cn(
              "h-4 w-4 stroke-[1.5]",
              isLight ? "text-blue-700" : "text-blue-400",
            )}
          />
        </span>
        {(!collapsed || mobile) && (
          <>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-xs font-medium", bar.muted)}>
                {CHAT.datasetPickerLabel}
              </span>
              <span className={cn("block truncate text-sm", bar.text)}>
                {activeDataset?.title ?? CHAT.datasetPickerNone}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 opacity-60 transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={panelShell}
          >
            <div className="space-y-3 p-3">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isLight ? "text-neutral-900" : "text-white",
                  )}
                >
                  {CHAT.datasetPickerLabel}
                </p>
                {!datasetsLoading && datasets.length > 0 && (
                  <p className={cn("mt-1 text-[11px]", bar.muted)}>
                    {CHAT.datasetPickerCount(datasets.length)}
                  </p>
                )}
              </div>

              <div className="relative">
                <Search
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                    bar.muted,
                  )}
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={CHAT.datasetSearchPlaceholder}
                  disabled={datasetsLoading}
                  className={cn(
                    "w-full rounded-lg border py-2 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60",
                    isLight
                      ? "border-black/10 bg-white text-neutral-900 placeholder:text-neutral-400"
                      : "border-white/10 bg-black/30 text-neutral-100 placeholder:text-neutral-500",
                  )}
                />
              </div>

              <div className="max-h-52 space-y-1 overflow-y-auto">
                {datasetsLoading ? (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-3 text-xs",
                      bar.muted,
                    )}
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading datasets…
                  </div>
                ) : datasets.length === 0 ? (
                  <div
                    className={cn(
                      "rounded-lg border border-dashed px-3 py-4 text-center text-xs leading-relaxed",
                      isLight
                        ? "border-black/10 text-neutral-500"
                        : "border-white/10 text-neutral-400",
                    )}
                  >
                    <Database
                      className={cn(
                        "mx-auto mb-2 h-5 w-5 opacity-50",
                        bar.muted,
                      )}
                    />
                    {CHAT.datasetPickerEmpty}
                  </div>
                ) : filteredDatasets.length === 0 ? (
                  <p className={cn("px-2 py-2 text-xs", bar.muted)}>
                    {CHAT.datasetSearchEmpty}
                  </p>
                ) : (
                  filteredDatasets.map((d) => {
                    const isActive = resourceId === d.resourceId;
                    return (
                      <button
                        key={d.resourceId}
                        type="button"
                        onClick={() => selectDataset(d.resourceId)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                          isActive
                            ? isLight
                              ? "bg-blue-50 text-blue-900 ring-1 ring-blue-500/20"
                              : "bg-blue-500/15 text-blue-100 ring-1 ring-blue-400/25"
                            : isLight
                              ? "text-neutral-700 hover:bg-black/[0.04]"
                              : "text-white/80 hover:bg-white/[0.06]",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {d.title}
                          </span>
                        </span>
                        {isActive && (
                          <Check
                            className={cn(
                              "mt-0.5 h-3.5 w-3.5 shrink-0",
                              isLight ? "text-blue-600" : "text-blue-400",
                            )}
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div
                className={cn(
                  "h-px",
                  isLight ? "bg-black/10" : "bg-white/10",
                )}
              />

              <div className="space-y-2">
                {!showAdd ? (
                  <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition-colors",
                      isLight
                        ? "border-black/15 text-blue-700 hover:bg-black/[0.03]"
                        : "border-white/15 text-blue-400 hover:bg-white/[0.04]",
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add a dataset
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={addInput}
                      onChange={(e) => setAddInput(e.target.value)}
                      placeholder="https://data.gov.in/resource/… or UUID"
                      className={cn(
                        "w-full rounded-lg border px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/30",
                        isLight
                          ? "border-black/10 bg-white text-neutral-900"
                          : "border-white/10 bg-black/30 text-neutral-100",
                      )}
                    />
                    {existingFromAddInput && (
                      <div
                        className={cn(
                          "rounded-lg border px-2.5 py-2 text-xs",
                          isLight
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                        )}
                      >
                        <p>{CHAT.datasetAlreadyExists}</p>
                        <button
                          type="button"
                          onClick={() => {
                            selectDataset(existingFromAddInput.resourceId);
                            setAddInput("");
                            setShowAdd(false);
                          }}
                          className="mt-1 font-medium underline underline-offset-2"
                        >
                          Select “{existingFromAddInput.title}”
                        </button>
                      </div>
                    )}
                    {resolveError && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {resolveError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdd(false);
                          setAddInput("");
                          setResolveError(null);
                        }}
                        className={cn(
                          "flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors",
                          isLight
                            ? "border-black/10 text-neutral-600 hover:bg-black/[0.03]"
                            : "border-white/10 text-neutral-400 hover:bg-white/[0.04]",
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={
                          resolving ||
                          !addInput.trim() ||
                          Boolean(existingFromAddInput)
                        }
                        onClick={() => void resolveDataset()}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {resolving && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {resolving ? "Resolving…" : "Add dataset"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
