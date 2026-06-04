"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AttributionModel, type ReportFilter } from "@/lib/types";

interface FiltersContextValue {
  filter: ReportFilter;
  /** Mezcla parcial (un eje a la vez) y conserva el resto. */
  patch: (partial: Partial<ReportFilter>) => void;
  /** Reemplaza todos los filtros (lo usa el modo conversacional). */
  replace: (next: ReportFilter) => void;
  reset: () => void;
}

const DEFAULT_FILTER: ReportFilter = { model: AttributionModel.LINEAR };

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);

  const patch = useCallback((partial: Partial<ReportFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const replace = useCallback((next: ReportFilter) => {
    setFilter({ model: next.model ?? AttributionModel.LINEAR, ...next });
  }, []);

  const reset = useCallback(() => setFilter(DEFAULT_FILTER), []);

  const value = useMemo(
    () => ({ filter, patch, replace, reset }),
    [filter, patch, replace, reset],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error("useFilters debe usarse dentro de <FiltersProvider>");
  }
  return ctx;
}
