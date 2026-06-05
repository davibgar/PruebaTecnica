"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { ListSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCop, formatRoas } from "@/lib/format";
import { originLabel } from "@/lib/labels";
import type { AudienceOriginPerformance } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useAudiencePerformance } from "./queries";

/**
 * ROAS real por origen de audiencia (frías / warm / base propia). El gasto se
 * prorratea por cuota de crédito. La fila con mejor ROAS se marca: alimenta la
 * recomendación "subir presupuesto a ese origen" del Action Center.
 */
export function AudiencePerformance() {
  const { filter } = useFilters();
  const query = useAudiencePerformance(filter);

  return (
    <Card>
      <CardHeader
        icon="people"
        title="ROAS real por origen de audiencia"
        description="Qué origen rinde mejor sobre ventas reales (gasto prorrateado)."
      />
      <QueryBoundary
        query={query}
        skeleton={<ListSkeleton items={3} />}
        isEmpty={(rows) => rows.length === 0}
        emptyTitle="Sin datos por origen"
      >
        {(rows) => <OriginList rows={rows} />}
      </QueryBoundary>
    </Card>
  );
}

function OriginList({ rows }: { rows: AudienceOriginPerformance[] }) {
  // La API ya las devuelve ordenadas por ROAS real desc; el primero es el mejor.
  const bestRoas = rows[0]?.roasReal ?? 0;

  return (
    <div className="divide-y divide-border/60">
      {rows.map((row) => {
        const isBest = row.roasReal === bestRoas && bestRoas > 0;
        return (
          <div
            key={row.audienceOrigin}
            className={cn(
              "flex items-center justify-between gap-4 px-5 py-3.5 transition-colors",
              isBest && "bg-emerald-400/[0.04]",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {originLabel(row.audienceOrigin)}
              </span>
              {isBest && (
                <Badge tone="green">
                  <Emoji name="trophy" size={12} /> Mejor ROAS
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Metric label="Atribuido" value={formatCop(row.attributedRevenue)} />
              <Metric label="Gasto" value={formatCop(row.proratedSpend)} />
              <Metric label="Conv." value={String(row.conversions)} />
              <span
                className={cn(
                  "w-16 text-right text-base font-semibold tabular-nums",
                  row.roasReal >= 1 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {formatRoas(row.roasReal)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden text-right sm:block">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-foreground/80 tabular-nums">{value}</p>
    </div>
  );
}
