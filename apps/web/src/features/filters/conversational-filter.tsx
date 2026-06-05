"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
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
    <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.07] to-transparent p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Emoji name="speech" size={15} />
        <span className="text-[11px] font-medium uppercase tracking-wide text-violet-300/90">
          Modo conversacional
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Pídelo en lenguaje natural: "TikTok con time-decay últimos 30 días"'
          className="flex-1 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted/70 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
        />
        <Button onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending ? "Interpretando…" : "Aplicar"}
        </Button>
      </div>

      {!result && (
        <p className="mt-2 text-xs text-muted">
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
            <span className="text-xs text-muted">
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
