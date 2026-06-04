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
import { formatCop, formatRoas } from "@/lib/format";
import type { CampaignReportRow } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useCampaigns } from "./queries";

const COLORS = {
  attributed: "#059669", // emerald-600
  platform: "#94a3b8", // slate-400
  real: "#059669",
  flagged: "#d97706", // amber-600
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

/** Devuelve el nombre completo de la campaña desde el payload del tooltip. */
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
          title="Ingreso atribuido por campaña"
          description="Ventas reales (POS) repartidas por el modelo de atribución activo."
        />
        <CardBody>
          <QueryBoundary
            query={query}
            isEmpty={(rows) => rows.length === 0}
            emptyTitle="Sin campañas en el alcance"
          >
            {(rows) => <RevenueChart rows={rows} />}
          </QueryBoundary>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="ROAS real vs ROAS plataforma"
          description="La diferencia con el píxel de Meta, a la vista."
        />
        <CardBody>
          <QueryBoundary
            query={query}
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
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`}
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          formatter={(value) => [formatCop(Number(value)), "Atribuido"]}
          labelFormatter={fullNameLabel}
          cursor={{ fill: "#f8fafc" }}
        />
        <Bar dataKey="attributed" radius={[4, 4, 0, 0]}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          tickFormatter={(v: number) => `${v}x`}
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          formatter={(value, name) => [
            formatRoas(Number(value)),
            ROAS_LABELS[String(name)] ?? String(name),
          ]}
          labelFormatter={fullNameLabel}
          cursor={{ fill: "#f8fafc" }}
        />
        <Legend
          formatter={(v) => (v === "real" ? "ROAS real" : "ROAS plataforma")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="real" fill={COLORS.real} radius={[4, 4, 0, 0]} />
        <Bar dataKey="plataforma" fill={COLORS.platform} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
