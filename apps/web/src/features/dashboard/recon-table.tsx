"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { formatCopShort, formatPctSigned, formatRoas } from "@/lib/format";
import { roasDeltaPct } from "@/lib/metrics";
import type { CampaignReportRow, DashboardMetrics } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { DrillDrawer } from "./drill-drawer";
import { ExportButtons } from "./export-buttons";
import { useCampaigns, useMetrics } from "./queries";

export function ReconTable() {
  const { report } = useFilters();
  const campaigns = useCampaigns(report);
  const metrics = useMetrics(report);
  const [drillId, setDrillId] = useState<string | null>(null);
  const drillName =
    campaigns.data?.find((c) => c.campaignId === drillId)?.name ?? "";

  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">Reconciliación por campaña</span>
        <span className="section-hint">Δ &gt; 5% resaltado · clic para drill-down</span>
        <span className="spacer" />
        <span className="legend-item" style={{ fontSize: 11.5, color: "var(--text-3)", marginRight: 6 }}>
          <span className="flagdot" style={{ marginLeft: 0 }} /> reconciliación &gt; 5%
        </span>
        <ExportButtons />
      </div>

      <div className="tablecard">
        <QueryBoundary
          query={campaigns}
          skeleton={<TableSkeleton />}
          isEmpty={(r) => r.length === 0}
          emptyTitle="Sin campañas en el alcance"
        >
          {(rows) => (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th>Inversión</th>
                  <th>Ingreso atribuido</th>
                  <th>Conv.</th>
                  <th>ROAS real</th>
                  <th>ROAS plataforma</th>
                  <th>Δ vs plataforma</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.campaignId} r={r} onDrill={() => setDrillId(r.campaignId)} />
                ))}
                {rows.length > 1 && metrics.data && <FootRow rows={rows} m={metrics.data} />}
              </tbody>
            </table>
          )}
        </QueryBoundary>
      </div>

      <DrillDrawer
        campaignId={drillId}
        campaignName={drillName}
        onClose={() => setDrillId(null)}
      />
    </div>
  );
}

function Row({ r, onDrill }: { r: CampaignReportRow; onDrill: () => void }) {
  const d = roasDeltaPct(r.roasReal, r.roasPlatform);
  const flagged = Math.abs(d) > 5;
  return (
    <tr onClick={onDrill}>
      <td>
        <div className="camp-cell">
          <span className="camp-dot" style={{ background: "var(--accent)" }} />
          <div>
            <div className="camp-name">
              {r.name}
              {flagged && <span className="flagdot" title="Reconciliación > 5%" />}
            </div>
            <div className="camp-drill">
              ver touchpoints <Icon name="chevron" size={11} />
            </div>
          </div>
        </div>
      </td>
      <td className="cell-mono">{formatCopShort(r.spend)}</td>
      <td className="cell-mono" style={{ color: "var(--text)" }}>{formatCopShort(r.attributedRevenue)}</td>
      <td className="cell-mono" style={{ color: "var(--text-2)" }}>{r.conversions}</td>
      <td><span className={"pill " + (r.roasReal >= 1 ? "good" : "bad")}>{formatRoas(r.roasReal)}</span></td>
      <td className="cell-mono" style={{ color: "var(--violet)" }}>{formatRoas(r.roasPlatform)}</td>
      <td><span className={"pill " + (Math.abs(d) <= 5 ? "flat" : d < 0 ? "bad" : "good")}>{formatPctSigned(d, 0)}</span></td>
    </tr>
  );
}

function FootRow({ rows, m }: { rows: CampaignReportRow[]; m: DashboardMetrics }) {
  const d = roasDeltaPct(m.roasReal, m.roasPlatform);
  return (
    <tr className="foot">
      <td>Blended ({rows.length} campañas)</td>
      <td className="cell-mono">{formatCopShort(m.totalSpend)}</td>
      <td className="cell-mono">{formatCopShort(m.attributedRevenue)}</td>
      <td className="cell-mono">{m.conversions}</td>
      <td><span className={"pill " + (m.roasReal >= 1 ? "good" : "bad")}>{formatRoas(m.roasReal)}</span></td>
      <td className="cell-mono" style={{ color: "var(--violet)" }}>{formatRoas(m.roasPlatform)}</td>
      <td><span className={"pill " + (Math.abs(d) <= 5 ? "flat" : d < 0 ? "bad" : "good")}>{formatPctSigned(d, 0)}</span></td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div style={{ padding: 16 }}>
      <div className="skel" style={{ height: 14, width: "100%" }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="skel" key={i} style={{ height: 22, width: "100%", marginTop: 12 }} />
      ))}
    </div>
  );
}
