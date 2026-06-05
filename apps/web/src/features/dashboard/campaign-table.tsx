"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { TableSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCop, formatPct, formatRoas } from "@/lib/format";
import type { CampaignReportRow } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { CampaignDrilldownModal } from "./campaign-drilldown";
import { ExportButtons } from "./export-buttons";
import { useCampaigns } from "./queries";

/**
 * Tabla por campaña: inversión, ingreso atribuido (POS), ROAS real vs plataforma
 * y diferencia % de reconciliación. Las filas con margen > 5% se resaltan; un
 * clic abre el drill-down de la campaña.
 */
export function CampaignTable() {
  const { filter } = useFilters();
  const query = useCampaigns(filter);
  const [selected, setSelected] = useState<CampaignReportRow | null>(null);

  return (
    <Card>
      <CardHeader
        icon="clipboard"
        title="Reporte por campaña"
        description="Reconciliación ROAS real (POS) vs ROAS plataforma. Clic en una fila para el detalle."
        action={<ExportButtons />}
      />
      <QueryBoundary
        query={query}
        skeleton={<TableSkeleton />}
        isEmpty={(rows) => rows.length === 0}
        emptyTitle="Sin campañas"
        emptyDescription="No hay campañas en el alcance de los filtros."
      >
        {(rows) => (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <Th>Campaña</Th>
                  <Th className="text-right">Inversión</Th>
                  <Th className="text-right">Ingreso atribuido</Th>
                  <Th className="text-right">ROAS real</Th>
                  <Th className="text-right">ROAS plataforma</Th>
                  <Th className="text-right">Diferencia %</Th>
                  <Th className="text-right">Conv.</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r) => (
                  <tr
                    key={r.campaignId}
                    onClick={() => setSelected(r)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-white/[0.03]",
                      r.flagged && "bg-amber-400/[0.04] hover:bg-amber-400/[0.07]",
                    )}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {r.name}
                        </span>
                        {r.flagged && <Badge tone="amber">&gt;5%</Badge>}
                      </div>
                    </Td>
                    <Td className="text-right text-muted tabular-nums">
                      {formatCop(r.spend)}
                    </Td>
                    <Td className="text-right font-medium text-foreground tabular-nums">
                      {formatCop(r.attributedRevenue)}
                    </Td>
                    <Td
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        r.roasReal >= 1 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {formatRoas(r.roasReal)}
                    </Td>
                    <Td className="text-right text-muted tabular-nums">
                      {formatRoas(r.roasPlatform)}
                    </Td>
                    <Td
                      className={cn(
                        "text-right tabular-nums",
                        r.flagged ? "font-semibold text-amber-400" : "text-muted",
                      )}
                    >
                      {formatPct(r.reconciliationDiffPct)}
                    </Td>
                    <Td className="text-right text-muted tabular-nums">
                      {r.conversions}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryBoundary>

      <CampaignDrilldownModal
        campaignId={selected?.campaignId ?? null}
        campaignName={selected?.name ?? ""}
        onClose={() => setSelected(null)}
      />
    </Card>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-5 py-3 font-medium", className)}>{children}</th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-5 py-3.5", className)}>{children}</td>;
}
