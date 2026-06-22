"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronDown,
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
}: DatasetPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const activeLabel =
    datasets.find((d) => d.resourceId === resourceId)?.title ??
    (resourceId ? `Resource ${resourceId.slice(0, 8)}…` : "Select a dataset");

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

  const resolveDataset = useCallback(async () => {
    const trimmed = addInput.trim();
    if (!trimmed) return;

    const existing = findExistingDataset(datasets, trimmed);
    if (existing) {
      onResourceIdChange(existing.resourceId);
      setAddInput("");
      setShowAdd(false);
      handleOpenChange(false);
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
        onResourceIdChange(data.dataset.resourceId);
        onDatasetsRefresh();
        setAddInput("");
        setShowAdd(false);
        handleOpenChange(false);
      }
    } catch {
      setResolveError("Network error. Try again.");
    } finally {
      setResolving(false);
    }
  }, [addInput, datasets, handleOpenChange, onDatasetsRefresh, onResourceIdChange]);

  return (
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
        onClick={() => handleOpenChange(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
          isLight
            ? "text-neutral-800 hover:bg-black/[0.04]"
            : "text-white/90 hover:bg-white/[0.06]",
        )}
      >
        <BarChart3 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span className="min-w-0 flex-1 truncate">{activeLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 opacity-60 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {!datasetsLoading && datasets.length > 0 && (
                <div className="relative px-1">
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
                    className={cn(
                      "w-full rounded-lg border py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/30",
                      isLight
                        ? "border-black/10 bg-white text-neutral-900 placeholder:text-neutral-400"
                        : "border-white/10 bg-black/30 text-neutral-100 placeholder:text-neutral-500",
                    )}
                  />
                </div>
              )}

              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {datasetsLoading ? (
                  <p className={cn("px-2 py-2 text-xs", bar.muted)}>
                    Loading datasets…
                  </p>
                ) : datasets.length === 0 ? (
                  <p className={cn("px-2 py-2 text-xs", bar.muted)}>
                    No datasets yet. Add one below.
                  </p>
                ) : filteredDatasets.length === 0 ? (
                  <p className={cn("px-2 py-2 text-xs", bar.muted)}>
                    {CHAT.datasetSearchEmpty}
                  </p>
                ) : (
                  filteredDatasets.map((d) => (
                    <button
                      key={d.resourceId}
                      type="button"
                      onClick={() => {
                        onResourceIdChange(d.resourceId);
                        handleOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                        isLight
                          ? "text-neutral-700 hover:bg-black/[0.04]"
                          : "text-white/80 hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{d.title}</span>
                      {resourceId === d.resourceId && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  isLight
                    ? "text-blue-700 hover:bg-black/[0.04]"
                    : "text-blue-400 hover:bg-white/[0.06]",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add a dataset
              </button>

              {showAdd && (
                <div className="space-y-2 px-1 pb-1 pt-1">
                  <input
                    type="text"
                    value={addInput}
                    onChange={(e) => setAddInput(e.target.value)}
                    placeholder="Paste data.gov.in URL or resource UUID"
                    className={cn(
                      "w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/30",
                      isLight
                        ? "border-black/10 bg-white text-neutral-900"
                        : "border-white/10 bg-black/30 text-neutral-100",
                    )}
                  />
                  {existingFromAddInput && (
                    <div
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs",
                        isLight
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                      )}
                    >
                      <p>{CHAT.datasetAlreadyExists}</p>
                      <button
                        type="button"
                        onClick={() => {
                          onResourceIdChange(existingFromAddInput.resourceId);
                          setAddInput("");
                          setShowAdd(false);
                          handleOpenChange(false);
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
                  <button
                    type="button"
                    disabled={
                      resolving || !addInput.trim() || Boolean(existingFromAddInput)
                    }
                    onClick={() => void resolveDataset()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {resolving && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {resolving ? "Resolving…" : "Resolve & add"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
