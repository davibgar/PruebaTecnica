"use client";

import { Card } from "@/components/ui/card";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { cn } from "@/lib/cn";
import { formatCop, formatNumber, formatRoas } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useMetrics } from "./queries";

/** Seis métricas core siempre visibles en el dashboard de entrada (blended). */
export function MetricsCards() {
  const { filter } = useFilters();
  const query = useMetrics(filter);

  return (
    <QueryBoundary query={query} loadingLabel="Calculando métricas…">
      {(m) => <MetricsGrid metrics={m} />}
    </QueryBoundary>
  );
}

function MetricsGrid({ metrics: m }: { metrics: DashboardMetrics }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricTile label="Ingreso real (POS)" value={formatCop(m.attributedRevenue)} />
        <MetricTile label="Inversión total" value={formatCop(m.totalSpend)} />
        <MetricTile
          label="ROAS real"
          value={formatRoas(m.roasReal)}
          tone={m.roasReal >= 1 ? "positive" : "negative"}
        />
        <MetricTile label="ROAS plataforma" value={formatRoas(m.roasPlatform)} />
        <MetricTile label="Conversiones" value={formatNumber(m.conversions)} />
        <MetricTile label="Ticket promedio" value={formatCop(m.averageTicket)} />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Ventana de atribución activa: {m.attributionWindowDays} días · ROAS real
        reconciliado contra ventas POS.
      </p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card className="px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tracking-tight",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-red-600",
          tone === "neutral" && "text-slate-900",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
