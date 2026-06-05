"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { QueryBoundary } from "@/components/ui/query-boundary";
import {
  formatCopShort,
  formatNumber,
  formatPctSigned,
  formatRoas,
} from "@/lib/format";
import { roasDeltaPct } from "@/lib/metrics";
import type { DashboardMetrics } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useMetrics } from "./queries";

/** Seis métricas core; la de ROAS real va destacada con el delta vs plataforma. */
export function Metrics() {
  const { report } = useFilters();
  const query = useMetrics(report);

  return (
    <div className="section">
      <QueryBoundary query={query} skeleton={<MetricsSkeleton />}>
        {(m) => <Grid m={m} />}
      </QueryBoundary>
    </div>
  );
}

function Grid({ m }: { m: DashboardMetrics }) {
  const blendedDelta = roasDeltaPct(m.roasReal, m.roasPlatform);

  return (
    <div className="metrics">
      <Metric icon="money" label="Ingreso real (POS)" value={formatCopShort(m.attributedRevenue)} sm foot="atribuido a marketing" />
      <Metric icon="dollar2" label="Inversión total" value={formatCopShort(m.totalSpend)} sm foot="ad spend del periodo" />
      <Metric
        icon="trend"
        label="ROAS real"
        value={formatRoas(m.roasReal)}
        hl
        foot="vs plataforma"
        footDelta={formatPctSigned(blendedDelta, 0)}
        footDir={blendedDelta < 0 ? "down" : "up"}
      />
      <Metric icon="scale" label="ROAS plataforma" value={formatRoas(m.roasPlatform)} foot="reportado por el píxel" />
      <Metric icon="bag" label="Conversiones" value={formatNumber(m.conversions)} foot="ventas atribuidas" />
      <Metric icon="ticket" label="Ticket promedio" value={formatCopShort(m.averageTicket)} sm foot="por venta POS" />
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  foot,
  footDelta,
  footDir = "up",
  hl,
  sm,
}: {
  icon: IconName;
  label: string;
  value: string;
  foot?: string;
  footDelta?: string;
  footDir?: "up" | "down" | "warn";
  hl?: boolean;
  sm?: boolean;
}) {
  return (
    <div className={"metric" + (hl ? " hl" : "")}>
      <div className="m-label">
        <span className="m-ico">
          <Icon name={icon} size={14} />
        </span>
        {label}
      </div>
      <div className={"m-value" + (sm ? " sm" : "")}>{value}</div>
      {foot && (
        <div className="m-foot">
          {footDelta && <span className={"delta " + footDir}>{footDelta}</span>}
          <span>{foot}</span>
        </div>
      )}
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="metrics">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="metric" key={i}>
          <div className="skel" style={{ height: 12, width: "60%" }} />
          <div className="skel" style={{ height: 24, width: "70%", marginTop: 12 }} />
          <div className="skel" style={{ height: 10, width: "50%", marginTop: 10 }} />
        </div>
      ))}
    </div>
  );
}
