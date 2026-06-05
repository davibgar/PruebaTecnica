"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseFilters } from "@/lib/api/dashboard";
import type {
  AttributionModel,
  AudienceOrigin,
  ParsedFilters,
  ReportFilter,
} from "@/lib/types";
import { useFilters } from "./filters-context";

const EXAMPLES = [
  "ingresos de TikTok con time-decay",
  "base propia últimos 30 días",
  "Meta modelo position-based",
];

/**
 * Modo conversacional: convierte texto natural en filtros del dashboard usando
 * el parser de reglas del backend (sin LLM). Aplica solo lo que reconoce.
 */
export function ConversationalFilter() {
  const { patch } = useFilters();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParsedFilters | null>(null);

  const mutation = useMutation({
    mutationFn: (value: string) => parseFilters(value),
    onSuccess: (parsed) => {
      setResult(parsed);
      patch(toReportFilter(parsed.filters));
    },
  });

  const submit = () => {
    const value = text.trim();
    if (value) mutation.mutate(value);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Pídelo en lenguaje natural: "TikTok con time-decay últimos 30 días"'
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <Button onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending ? "Interpretando…" : "Aplicar"}
        </Button>
      </div>

      {!result && (
        <p className="mt-2 text-xs text-slate-400">
          Ejemplos: {EXAMPLES.map((e) => `«${e}»`).join(" · ")}
        </p>
      )}

      {result && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {result.recognized.length > 0 ? (
            result.recognized.map((r) => (
              <Badge key={r} tone="green">
                {r}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              No se reconoció ningún filtro. Prueba con un canal, modelo u origen.
            </span>
          )}
          {result.unrecognized.map((u) => (
            <Badge key={u} tone="neutral">
              ? {u}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mapea los filtros parseados (strings) a ReportFilter, incluyendo SOLO las
 * claves reconocidas: así `patch` aplica lo nuevo sin borrar lo que ya estaba.
 */
function toReportFilter(filters: ParsedFilters["filters"]): Partial<ReportFilter> {
  const out: Partial<ReportFilter> = {};
  if (filters.from) out.from = filters.from;
  if (filters.to) out.to = filters.to;
  if (filters.campaignId) out.campaignId = filters.campaignId;
  if (filters.audienceOrigin)
    out.audienceOrigin = filters.audienceOrigin as AudienceOrigin;
  if (filters.model) out.model = filters.model as AttributionModel;
  return out;
}
