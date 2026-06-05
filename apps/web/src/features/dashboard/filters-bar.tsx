"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { recompute } from "@/lib/api/attribution";
import { getCampaigns } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";
import { AttributionModel } from "@/lib/types";
import { useFilters } from "../filters/filters-context";

const MODELS = [
  { id: AttributionModel.LINEAR, label: "Lineal" },
  { id: AttributionModel.TIME_DECAY, label: "Time-decay" },
  { id: AttributionModel.POSITION_BASED, label: "Position-based" },
];
const RANGES = [
  { d: 7, l: "Últimos 7 días" },
  { d: 30, l: "Últimos 30 días" },
  { d: 90, l: "Últimos 90 días" },
];
const ORIGINS = [
  { v: "all", l: "Todos los orígenes" },
  { v: "fria", l: "Frías" },
  { v: "warm", l: "Warm" },
  { v: "base_propia", l: "Base propia" },
];

export function FiltersBar() {
  const { f, set, reset } = useFilters();
  const client = useQueryClient();

  // Lista de campañas para el dropdown (todas las del negocio, sin filtrar).
  const campaignsQuery = useQuery({
    queryKey: queryKeys.campaignOptions(f.model),
    queryFn: () => getCampaigns({ model: f.model }),
  });

  // Ventana de atribución: recalcula los créditos en el backend (debounce).
  const recomputeMut = useMutation({
    mutationFn: (windowDays: number) => recompute(windowDays),
    onSuccess: (r) => {
      void client.invalidateQueries();
      toast.success(`Ventana recalculada · ${r.attributionWindowDays} días`);
    },
    onError: () => toast.error("No se pudo recalcular la ventana"),
  });

  const firstRun = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return; // no recalcular al montar (la ventana inicial ya está en la BD)
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => recomputeMut.mutate(f.windowDays), 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.windowDays]);

  const isFiltered =
    f.campaignId !== "all" || f.origin !== "all" || f.fromDays !== 90;

  return (
    <div className="filters">
      <div className="seg">
        {MODELS.map((m) => (
          <button
            key={m.id}
            className={f.model === m.id ? "on" : ""}
            onClick={() => set({ model: m.id })}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="filter">
        <span className="lbl">Rango</span>
        <select
          value={f.fromDays}
          onChange={(e) => set({ fromDays: +e.target.value })}
        >
          {RANGES.map((r) => (
            <option key={r.d} value={r.d}>
              {r.l}
            </option>
          ))}
          {!RANGES.some((r) => r.d === f.fromDays) && (
            <option value={f.fromDays}>Últimos {f.fromDays} días</option>
          )}
        </select>
      </div>

      <div className="filter">
        <span className="lbl">Campaña</span>
        <select
          value={f.campaignId}
          onChange={(e) => set({ campaignId: e.target.value })}
        >
          <option value="all">Todas</option>
          {(campaignsQuery.data ?? []).map((c) => (
            <option key={c.campaignId} value={c.campaignId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter">
        <span className="lbl">Origen</span>
        <select value={f.origin} onChange={(e) => set({ origin: e.target.value })}>
          {ORIGINS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
      </div>

      <div className="winslider">
        <span className="lbl">Ventana</span>
        <input
          type="range"
          min={3}
          max={90}
          step={1}
          value={f.windowDays}
          onChange={(e) => set({ windowDays: +e.target.value })}
        />
        <span className="val">
          {recomputeMut.isPending ? "…" : `${f.windowDays} d`}
        </span>
      </div>

      {isFiltered && (
        <button className="chip-reset" onClick={reset}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
