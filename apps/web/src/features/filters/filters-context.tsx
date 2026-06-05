"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AttributionModel,
  type AudienceOrigin,
  type ReportFilter,
} from "@/lib/types";

/** Estado de filtros tal como lo expone la UI (modelo, ventana, rango, etc.). */
export interface DashFilters {
  model: AttributionModel;
  /** Ventana de atribución en días (slider 3–90); recalcula en el backend. */
  windowDays: number;
  /** Rango de fechas del reporte en días (7 / 30 / 90). */
  fromDays: number;
  /** id de campaña o "all". */
  campaignId: string;
  /** AudienceOrigin o "all". */
  origin: string;
}

const DEFAULT: DashFilters = {
  model: AttributionModel.LINEAR,
  windowDays: 30,
  fromDays: 90,
  campaignId: "all",
  origin: "all",
};

interface FiltersContextValue {
  f: DashFilters;
  /** ReportFilter derivado para las consultas a la API. */
  report: ReportFilter;
  set: (patch: Partial<DashFilters>) => void;
  reset: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

/** YYYY-MM-DD de hace `days` días (estable dentro del día → buen queryKey). */
function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [f, setF] = useState<DashFilters>(DEFAULT);

  const set = useCallback(
    (patch: Partial<DashFilters>) => setF((prev) => ({ ...prev, ...patch })),
    [],
  );
  const reset = useCallback(
    () => setF((prev) => ({ ...prev, campaignId: "all", origin: "all", fromDays: 90 })),
    [],
  );

  const report = useMemo<ReportFilter>(
    () => ({
      model: f.model,
      from: isoDaysAgo(f.fromDays),
      to: new Date().toISOString().slice(0, 10),
      campaignId: f.campaignId === "all" ? undefined : f.campaignId,
      audienceOrigin: f.origin === "all" ? undefined : (f.origin as AudienceOrigin),
    }),
    [f.model, f.fromDays, f.campaignId, f.origin],
  );

  const value = useMemo(
    () => ({ f, report, set, reset }),
    [f, report, set, reset],
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
