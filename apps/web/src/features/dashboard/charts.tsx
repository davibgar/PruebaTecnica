"use client";

import { Icon } from "@/components/ui/icon";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { EmptyState } from "@/components/ui/states";
import { formatCop, formatCopShort, formatRoas } from "@/lib/format";
import { MODEL_LABELS, ORIGIN_COLOR, originLabel } from "@/lib/labels";
import type {
  AudienceOriginPerformance,
  CampaignReportRow,
} from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useAudiencePerformance, useCampaigns } from "./queries";

export function Charts() {
  const { f, report } = useFilters();
  const campaigns = useCampaigns(report);
  const audience = useAudiencePerformance(report);

  return (
    <>
      <div className="section grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Ingreso por campaña</div>
              <div className="card-sub">
                Modelo {MODEL_LABELS[f.model]} · ventana {f.windowDays} días
              </div>
            </div>
          </div>
          <QueryBoundary
            query={campaigns}
            skeleton={<BarsSkeleton />}
            isEmpty={(r) => r.length === 0}
            emptyTitle="Sin ingreso atribuido"
          >
            {(rows) => <BarByCampaign rows={rows} />}
          </QueryBoundary>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">ROAS real vs plataforma</div>
              <div className="card-sub">La diferencia con Meta, a la vista</div>
            </div>
          </div>
          <QueryBoundary
            query={campaigns}
            skeleton={<BarsSkeleton />}
            isEmpty={(r) => r.length === 0}
            emptyTitle="Sin datos de ROAS"
          >
            {(rows) => <RoasGrouped rows={rows} />}
          </QueryBoundary>
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

function BarByCampaign({ rows }: { rows: CampaignReportRow[] }) {
  const sorted = [...rows].sort((a, b) => b.attributedRevenue - a.attributedRevenue);
  const max = Math.max(1, ...sorted.map((r) => r.attributedRevenue));
  return (
    <div>
      {sorted.map((r) => (
        <div className="barrow" key={r.campaignId}>
          <div className="name" title={r.name}>{r.name}</div>
          <div className="bartrack">
            <div className="barfill" style={{ width: (r.attributedRevenue / max) * 100 + "%" }} />
          </div>
          <div className="amt">{formatCopShort(r.attributedRevenue)}</div>
        </div>
      ))}
    </div>
  );
}

function RoasGrouped({ rows }: { rows: CampaignReportRow[] }) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.roasReal, r.roasPlatform]));
  return (
    <div>
      <div className="legend" style={{ marginBottom: 6 }}>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--accent)" }} /> ROAS real (POS)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--violet)" }} /> ROAS plataforma (píxel)
        </span>
      </div>
      {rows.map((r) => (
        <div className="grow" key={r.campaignId}>
          <div className="name" title={r.name} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.name}
          </div>
          <div className="gpair">
            <div className="gbar">
              <div className="gtrack"><div className="gfill real" style={{ width: (r.roasReal / max) * 100 + "%" }} /></div>
              <div className="gval" style={{ color: "var(--accent)" }}>{formatRoas(r.roasReal)}</div>
            </div>
            <div className="gbar">
              <div className="gtrack"><div className="gfill plat" style={{ width: (r.roasPlatform / max) * 100 + "%" }} /></div>
              <div className="gval" style={{ color: "var(--violet)" }}>{formatRoas(r.roasPlatform)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <div className="donut">
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: total > 1 ? `conic-gradient(${grad})` : "var(--surface-2)" }} />
        <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "var(--surface)" }} />
        <div className="donut-center">
          <div className="dc-val">{formatCopShort(total > 1 ? total : 0)}</div>
          <div className="dc-lbl">Ingreso real</div>
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

function BarsSkeleton() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="barrow" key={i}>
          <div className="skel" style={{ height: 12, width: 100 }} />
          <div className="skel" style={{ height: 26 }} />
          <div className="skel" style={{ height: 12, width: 60 }} />
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
