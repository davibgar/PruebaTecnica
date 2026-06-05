"use client";

import { Card } from "@/components/ui/card";
import { Emoji, type EmojiName } from "@/components/ui/emoji";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { MetricsSkeleton } from "@/components/ui/skeleton";
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
    <QueryBoundary query={query} skeleton={<MetricsSkeleton />}>
      {(m) => <MetricsGrid metrics={m} />}
    </QueryBoundary>
  );
}

function MetricsGrid({ metrics: m }: { metrics: DashboardMetrics }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricTile
          icon="money-bag"
          label="Ingreso real (POS)"
          value={formatCop(m.attributedRevenue)}
        />
        <MetricTile
          icon="money-with-wings"
          label="Inversión total"
          value={formatCop(m.totalSpend)}
        />
        <MetricTile
          icon={m.roasReal >= 1 ? "chart-increasing" : "chart-decreasing"}
          label="ROAS real"
          value={formatRoas(m.roasReal)}
          tone={m.roasReal >= 1 ? "positive" : "negative"}
        />
        <MetricTile
          icon="bar-chart"
          label="ROAS plataforma"
          value={formatRoas(m.roasPlatform)}
        />
        <MetricTile
          icon="shopping-cart"
          label="Conversiones"
          value={formatNumber(m.conversions)}
        />
        <MetricTile
          icon="receipt"
          label="Ticket promedio"
          value={formatCop(m.averageTicket)}
        />
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
        <Emoji name="target" size={13} />
        Ventana de atribución activa: {m.attributionWindowDays} días · ROAS real
        reconciliado contra ventas POS.
      </p>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: EmojiName;
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card className="group relative overflow-hidden px-4 py-3 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <Emoji name={icon} size={16} className="opacity-80" />
      </div>
      <p
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight tabular-nums",
          tone === "positive" && "text-emerald-400",
          tone === "negative" && "text-red-400",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
