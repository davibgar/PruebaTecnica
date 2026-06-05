"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatCop, formatRoas } from "@/lib/format";
import type { CampaignReportRow } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useCampaigns } from "./queries";

const COLORS = {
  attributed: "#34d399", // esmeralda (marca)
  flagged: "#fbbf24", // ámbar (reconciliación > 5%)
  real: "#34d399", // esmeralda
  platform: "#a78bfa", // violeta (acento secundario)
};

const AXIS = { fontSize: 11, fill: "#8b8b97" };
const GRID = "#24242c";

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#17171d",
    border: "1px solid #32323c",
    borderRadius: 12,
    boxShadow: "0 8px 30px -12px rgba(0,0,0,0.8)",
  },
  labelStyle: { color: "#ededf0", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#c4c4cc" },
};

/** Nombre corto para el eje X; el nombre completo va en el tooltip. */
function shortName(name: string): string {
  const head = name.split("—")[0].trim();
  return head.length > 16 ? `${head.slice(0, 15)}…` : head;
}

const ROAS_LABELS: Record<string, string> = {
  real: "ROAS real",
  plataforma: "ROAS plataforma",
};

function fullNameLabel(
  _: unknown,
  payload?: ReadonlyArray<{ payload?: { fullName?: string } }>,
): string {
  return payload?.[0]?.payload?.fullName ?? "";
}

/** Los dos gráficos del dashboard: ingreso atribuido y ROAS real vs plataforma. */
export function DashboardCharts() {
  const { filter } = useFilters();
  const query = useCampaigns(filter);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader
          icon="bar-chart"
          title="Ingreso atribuido por campaña"
          description="Ventas reales (POS) repartidas por el modelo de atribución activo."
        />
        <CardBody>
          <QueryBoundary
            query={query}
            skeleton={<ChartSkeleton />}
            isEmpty={(rows) => rows.length === 0}
            emptyTitle="Sin campañas en el alcance"
          >
            {(rows) => <RevenueChart rows={rows} />}
          </QueryBoundary>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon="chart-yen"
          title="ROAS real vs ROAS plataforma"
          description="La diferencia con el píxel de Meta, a la vista."
        />
        <CardBody>
          <QueryBoundary
            query={query}
            skeleton={<ChartSkeleton />}
            isEmpty={(rows) => rows.length === 0}
            emptyTitle="Sin campañas en el alcance"
          >
            {(rows) => <RoasChart rows={rows} />}
          </QueryBoundary>
        </CardBody>
      </Card>
    </div>
  );
}

function RevenueChart({ rows }: { rows: CampaignReportRow[] }) {
  const data = rows.map((r) => ({
    name: shortName(r.name),
    fullName: r.name,
    attributed: r.attributedRevenue,
    flagged: r.flagged,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(value) => [formatCop(Number(value)), "Atribuido"]}
          labelFormatter={fullNameLabel}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="attributed" radius={[5, 5, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.flagged ? COLORS.flagged : COLORS.attributed}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RoasChart({ rows }: { rows: CampaignReportRow[] }) {
  const data = rows.map((r) => ({
    name: shortName(r.name),
    fullName: r.name,
    real: r.roasReal,
    plataforma: r.roasPlatform,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis
          tickFormatter={(v: number) => `${v}x`}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(value, name) => [
            formatRoas(Number(value)),
            ROAS_LABELS[String(name)] ?? String(name),
          ]}
          labelFormatter={fullNameLabel}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Legend
          formatter={(v) => (
            <span className="text-muted">
              {v === "real" ? "ROAS real" : "ROAS plataforma"}
            </span>
          )}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="real" fill={COLORS.real} radius={[5, 5, 0, 0]} />
        <Bar dataKey="plataforma" fill={COLORS.platform} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
