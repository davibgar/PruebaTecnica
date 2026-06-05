"use client";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { formatCop, formatDate, formatRoas } from "@/lib/format";
import { channelLabel, originLabel } from "@/lib/labels";
import type { CampaignDrilldown } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useCampaignDrilldown } from "./queries";

/** Drill-down de una campaña: sus touchpoints y las ventas que se le atribuyeron. */
export function CampaignDrilldownModal({
  campaignId,
  campaignName,
  onClose,
}: {
  campaignId: string | null;
  campaignName: string;
  onClose: () => void;
}) {
  const { filter } = useFilters();
  const query = useCampaignDrilldown(campaignId, filter);

  return (
    <Modal
      open={campaignId !== null}
      onClose={onClose}
      title={`Drill-down · ${campaignName}`}
    >
      <QueryBoundary query={query} loadingLabel="Cargando detalle…">
        {(data) => <DrilldownContent data={data} />}
      </QueryBoundary>
    </Modal>
  );
}

function DrilldownContent({ data }: { data: CampaignDrilldown }) {
  const { campaign, touchpoints, attributedSales } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-surface-2/50 px-4 py-3">
        <Stat label="Inversión" value={formatCop(campaign.spend)} />
        <Stat
          label="Ingreso atribuido"
          value={formatCop(campaign.attributedRevenue)}
        />
        <Stat
          label="ROAS real"
          value={formatRoas(campaign.roasReal)}
          tone={campaign.roasReal >= 1 ? "positive" : "negative"}
        />
        <Stat
          label="ROAS plataforma"
          value={formatRoas(campaign.roasPlatform)}
        />
      </div>

      <section>
        <h3 className="eyebrow mb-2">Touchpoints ({touchpoints.length})</h3>
        {touchpoints.length === 0 ? (
          <p className="text-sm text-muted">Sin touchpoints en el alcance.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <Th>Contacto</Th>
                  <Th>Canal</Th>
                  <Th>Origen</Th>
                  <Th>Fecha</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {touchpoints.map((tp) => (
                  <tr key={tp.id}>
                    <Td className="font-mono text-xs text-muted">
                      {tp.contactExternalId}
                    </Td>
                    <Td className="text-foreground">
                      {channelLabel(tp.channel)}
                    </Td>
                    <Td>
                      <Badge tone="neutral">
                        {originLabel(tp.audienceOrigin)}
                      </Badge>
                    </Td>
                    <Td className="text-muted">{formatDate(tp.occurredAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="eyebrow mb-2">
          Ventas atribuidas ({attributedSales.length})
        </h3>
        {attributedSales.length === 0 ? (
          <p className="text-sm text-muted">
            Ninguna venta atribuida a esta campaña en el alcance.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <Th>Contacto</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Monto venta</Th>
                  <Th className="text-right">Crédito a la campaña</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {attributedSales.map((s) => (
                  <tr key={s.saleId}>
                    <Td className="font-mono text-xs text-muted">
                      {s.contactExternalId}
                    </Td>
                    <Td className="text-muted">{formatDate(s.soldAt)}</Td>
                    <Td className="text-right text-foreground tabular-nums">
                      {formatCop(s.amount)}
                    </Td>
                    <Td className="text-right font-medium text-emerald-400 tabular-nums">
                      {formatCop(s.creditToCampaign)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p
        className={
          tone === "positive"
            ? "font-semibold text-emerald-400"
            : tone === "negative"
              ? "font-semibold text-red-400"
              : "font-semibold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-3 py-2 font-medium ${className ?? ""}`}>{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2.5 ${className ?? ""}`}>{children}</td>;
}
