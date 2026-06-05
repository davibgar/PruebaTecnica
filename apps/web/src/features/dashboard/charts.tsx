"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { EmptyState } from "@/components/ui/states";
import { Icon } from "@/components/ui/icon";
import { formatCop, formatCopShort, formatRoas } from "@/lib/format";
import { MODEL_LABELS, ORIGIN_COLOR, originLabel } from "@/lib/labels";
import type {
  AudienceOriginPerformance,
  CampaignReportRow,
} from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useAudiencePerformance, useCampaigns } from "./queries";

const AXIS_TICK = { fontSize: 12, fill: "var(--text-2)", fontWeight: 700 };
const TOOLTIP = {
  contentStyle: {
    background: "var(--surface-2)",
    border: "1px solid var(--border-2)",
    borderRadius: 12,
    boxShadow: "var(--shadow-lg)",
  },
  labelStyle: { color: "var(--text)", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "var(--text-2)" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
} as const;

/** Nombre corto para el eje; el completo va en el tooltip. */
function shortName(name: string): string {
  const head = name.split("—")[0].trim();
  return head.length > 16 ? `${head.slice(0, 15)}…` : head;
}
const fullName = (_: unknown, p?: ReadonlyArray<{ payload?: { full?: string } }>) =>
  p?.[0]?.payload?.full ?? "";

export function Charts() {
  const { f, report } = useFilters();
  const campaigns = useCampaigns(report);
  const audience = useAudiencePerformance(report);

  return (
    <>
      <div className="section grid-2">
        <div className="card chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">Ingreso por campaña</div>
              <div className="card-sub">
                Modelo {MODEL_LABELS[f.model]} · ventana {f.windowDays} días
              </div>
            </div>
          </div>
          <div className="chart-body">
            <QueryBoundary
              query={campaigns}
              skeleton={<ChartSkeleton />}
              isEmpty={(r) => r.length === 0}
              emptyTitle="Sin ingreso atribuido"
            >
              {(rows) => <RevenueChart rows={rows} />}
            </QueryBoundary>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">ROAS real vs plataforma</div>
              <div className="card-sub">La diferencia con Meta, a la vista</div>
            </div>
          </div>
          <div className="chart-body">
            <QueryBoundary
              query={campaigns}
              skeleton={<ChartSkeleton />}
              isEmpty={(r) => r.length === 0}
              emptyTitle="Sin datos de ROAS"
            >
              {(rows) => <RoasChart rows={rows} />}
            </QueryBoundary>
          </div>
        </div>
      </div>

      <div className="section grid-3">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Ingreso real por origen de audiencia</div>
              <div className="card-sub">
                Frías · Warm · Base propia — el diferencial NodoTech
              </div>
            </div>
          </div>
          <QueryBoundary
            query={audience}
            skeleton={<DonutSkeleton />}
            isEmpty={(r) => r.length === 0}
            emptyTitle="Sin datos por origen"
          >
            {(rows) => <OriginDonut rows={rows} />}
          </QueryBoundary>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "linear-gradient(165deg, var(--accent-softer), var(--surface) 70%)",
          }}
        >
          <QueryBoundary query={audience}>
            {(rows) => <OriginInsight rows={rows} />}
          </QueryBoundary>
        </div>
      </div>
    </>
  );
}

/* ===== Recharts: ingreso por campaña (barras horizontales) ============= */
function RevenueChart({ rows }: { rows: CampaignReportRow[] }) {
  const data = [...rows]
    .sort((a, b) => b.attributedRevenue - a.attributedRevenue)
    .map((r) => ({
      name: shortName(r.name),
      full: r.name,
      value: r.attributedRevenue,
      flagged: r.flagged,
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 56, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis type="category" dataKey="name" width={118} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v) => [formatCop(Number(v)), "Atribuido"]}
          labelFormatter={fullName}
          {...TOOLTIP}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((d, i) => (
            <Cell key={i} className={d.flagged ? "fill-amber" : "fill-accent"} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => formatCopShort(Number(v))}
            style={{ fill: "var(--text)", fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ===== Recharts: ROAS real vs plataforma (barras agrupadas) ============ */
function RoasChart({ rows }: { rows: CampaignReportRow[] }) {
  const data = rows.map((r) => ({
    name: shortName(r.name),
    full: r.name,
    real: r.roasReal,
    plataforma: r.roasPlatform,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barGap={2}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis type="category" dataKey="name" width={118} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v, name) => [
            formatRoas(Number(v)),
            name === "real" ? "ROAS real" : "ROAS plataforma",
          ]}
          labelFormatter={fullName}
          {...TOOLTIP}
        />
        <Legend
          formatter={(v) => (
            <span style={{ color: "var(--text-2)" }}>
              {v === "real" ? "ROAS real (POS)" : "ROAS plataforma (píxel)"}
            </span>
          )}
          wrapperStyle={{ fontSize: 11.5 }}
        />
        <Bar dataKey="real" className="fill-accent" barSize={9} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="real" position="right" formatter={(v: number) => formatRoas(Number(v))} style={{ fill: "var(--text-2)", fontSize: 10.5, fontWeight: 700 }} />
        </Bar>
        <Bar dataKey="plataforma" className="fill-violet" barSize={9} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="plataforma" position="right" formatter={(v: number) => formatRoas(Number(v))} style={{ fill: "var(--text-2)", fontSize: 10.5, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ===== Donut por origen (conic-gradient, CSS) ========================== */
function OriginDonut({ rows }: { rows: AudienceOriginPerformance[] }) {
  const total = rows.reduce((s, r) => s + r.attributedRevenue, 0) || 1;
  const best = rows.find((r) => r.attributedRevenue > 0);
  let acc = 0;
  const grad = rows
    .map((r) => {
      const from = acc;
      acc += r.attributedRevenue / total;
      return `${ORIGIN_COLOR[r.audienceOrigin]} ${(from * 100).toFixed(1)}% ${(acc * 100).toFixed(1)}%`;
    })
    .join(", ");

  return (
    <div className="donut-wrap">
      <div className="donut-block">
        <div className="donut">
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: total > 1 ? `conic-gradient(${grad})` : "var(--surface-2)" }} />
          <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "var(--surface)" }} />
        </div>
        <div className="donut-total">
          <div className="dt-val">{formatCopShort(total > 1 ? total : 0)}</div>
          <div className="dt-lbl">Ingreso real</div>
        </div>
      </div>
      <div className="origin-rows">
        {rows.map((r) => (
          <div className="origin-row" key={r.audienceOrigin}>
            <div className="origin-name">
              <span className="o-dot" style={{ background: ORIGIN_COLOR[r.audienceOrigin] }} />
              {originLabel(r.audienceOrigin)}
              {best?.audienceOrigin === r.audienceOrigin && r.attributedRevenue > 0 && (
                <span className="best-tag">mejor ROAS</span>
              )}
            </div>
            <div className="origin-roas" style={{ color: ORIGIN_COLOR[r.audienceOrigin] }}>{formatRoas(r.roasReal)}</div>
            <div className="origin-sub">
              {formatCopShort(r.attributedRevenue)} atribuido · inv. {formatCopShort(r.proratedSpend)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OriginInsight({ rows }: { rows: AudienceOriginPerformance[] }) {
  const best = rows.find((r) => r.attributedRevenue > 0 && r.proratedSpend > 0);
  if (!best) {
    return <EmptyState icon="target" title="Sin origen destacado" description="Ajusta los filtros para ver el mejor origen." />;
  }
  return (
    <>
      <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--accent)", display: "flex", alignItems: "center", gap: 7 }}>
        <Icon name="target" size={15} /> Insight de origen
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 12, textWrap: "pretty" }}>
        <span style={{ color: "var(--accent)" }}>{originLabel(best.audienceOrigin)}</span> rinde mejor: {formatRoas(best.roasReal)} ROAS real
      </div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 10, lineHeight: 1.55, textWrap: "pretty" }}>
        De {formatCop(best.attributedRevenue)} en ingreso atribuido sobre {formatCop(best.proratedSpend)} de inversión asignada. Considera reasignar presupuesto hacia este origen.
      </div>
    </>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, alignItems: "center" }}>
          <div className="skel" style={{ height: 12 }} />
          <div className="skel" style={{ height: 22 }} />
        </div>
      ))}
    </div>
  );
}

function DonutSkeleton() {
  return (
    <div className="donut-wrap">
      <div className="skel" style={{ width: 132, height: 132, borderRadius: "50%" }} />
      <div className="origin-rows" style={{ flex: 1 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="skel" key={i} style={{ height: 32 }} />
        ))}
      </div>
    </div>
  );
}
