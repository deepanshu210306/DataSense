"use client";

import { useCallback, useEffect, useState } from "react";
import type { DatasetSummary } from "@/lib/datasets/types";

export function useDatasets() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/datasets");
      if (!response.ok) {
        throw new Error("Could not load datasets.");
      }
      const data = (await response.json()) as { datasets: DatasetSummary[] };
      setDatasets(data.datasets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load datasets.");
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { datasets, loading, error, refresh };
}
