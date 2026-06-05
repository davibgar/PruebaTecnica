"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { parseFilters } from "@/lib/api/dashboard";
import type { AttributionModel, AudienceOrigin, ParsedFilters } from "@/lib/types";
import { useFilters, type DashFilters } from "../filters/filters-context";

const QUICK = [
  { t: "Cambiar a time-decay", c: "modelo time-decay" },
  { t: "Solo base propia", c: "base propia" },
  { t: "Día de la Madre", c: "campaña dia de la madre" },
  { t: "Últimos 7 días", c: "ultimos 7 dias" },
];

/** Barra de comando: texto natural → filtros del dashboard (parser del backend). */
export function CommandBar() {
  const { set } = useFilters();
  const [cmd, setCmd] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (text: string) => parseFilters(text),
    onSuccess: (parsed) => {
      if (parsed.recognized.length === 0) {
        setChips([]);
        toast("No reconocí intención", {
          description: 'Probá: "time-decay base propia últimos 30 días"',
        });
        return;
      }
      set(toDashPatch(parsed.filters));
      setChips(parsed.recognized);
      toast.success("Filtros aplicados desde texto");
    },
    onError: () => toast.error("No se pudo interpretar el texto"),
  });

  const run = () => {
    const v = cmd.trim();
    if (v) mutation.mutate(v);
  };

  return (
    <div style={{ marginTop: 18 }}>
      <form
        className="cmd"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <span className="cmd-spark">
          <Icon name="spark" size={18} />
        </span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="Configura el dashboard escribiendo… p.ej. “ROAS de Reactivación en base propia con time-decay, últimos 30 días”"
        />
        {cmd && (
          <button type="button" className="cmd-kbd" onClick={() => setCmd("")}>
            limpiar
          </button>
        )}
        <button type="submit" className="cmd-go" disabled={mutation.isPending}>
          {mutation.isPending ? "…" : "Aplicar"}
        </button>
      </form>
      <div className="cmd-hints">
        {chips.length > 0
          ? chips.map((c, i) => (
              <span
                key={i}
                className="cmd-hint"
                style={{ borderColor: "var(--accent-dim)", color: "var(--text)" }}
              >
                <b>✓</b> {c}
              </span>
            ))
          : QUICK.map((q) => (
              <button key={q.t} className="cmd-hint" onClick={() => setCmd(q.c)}>
                {q.t}
              </button>
            ))}
      </div>
    </div>
  );
}

/** Convierte los filtros parseados (ReportFilter-ish) a un patch de DashFilters. */
function toDashPatch(filters: ParsedFilters["filters"]): Partial<DashFilters> {
  const patch: Partial<DashFilters> = {};
  if (filters.model) patch.model = filters.model as AttributionModel;
  if (filters.audienceOrigin) patch.origin = filters.audienceOrigin as AudienceOrigin;
  if (filters.campaignId) patch.campaignId = filters.campaignId;
  if (filters.from && filters.to) {
    const days = Math.round(
      (Date.parse(filters.to) - Date.parse(filters.from)) / 86_400_000,
    );
    if (days > 0) patch.fromDays = days;
  }
  return patch;
}
