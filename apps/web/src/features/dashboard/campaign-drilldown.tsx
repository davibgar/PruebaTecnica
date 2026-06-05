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
      <div className="flex flex-wrap gap-4 text-sm">
        <Stat label="Inversión" value={formatCop(campaign.spend)} />
        <Stat
          label="Ingreso atribuido"
          value={formatCop(campaign.attributedRevenue)}
        />
        <Stat label="ROAS real" value={formatRoas(campaign.roasReal)} />
        <Stat
          label="ROAS plataforma"
          value={formatRoas(campaign.roasPlatform)}
        />
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Touchpoints ({touchpoints.length})
        </h3>
        {touchpoints.length === 0 ? (
          <p className="text-sm text-slate-400">Sin touchpoints en el alcance.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <Th>Contacto</Th>
                  <Th>Canal</Th>
                  <Th>Origen</Th>
                  <Th>Fecha</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {touchpoints.map((tp) => (
                  <tr key={tp.id}>
                    <Td className="font-mono text-xs">{tp.contactExternalId}</Td>
                    <Td>{channelLabel(tp.channel)}</Td>
                    <Td>
                      <Badge tone="neutral">
                        {originLabel(tp.audienceOrigin)}
                      </Badge>
                    </Td>
                    <Td className="text-slate-500">{formatDate(tp.occurredAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ventas atribuidas ({attributedSales.length})
        </h3>
        {attributedSales.length === 0 ? (
          <p className="text-sm text-slate-400">
            Ninguna venta atribuida a esta campaña en el alcance.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <Th>Contacto</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Monto venta</Th>
                  <Th className="text-right">Crédito a la campaña</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attributedSales.map((s) => (
                  <tr key={s.saleId}>
                    <Td className="font-mono text-xs">{s.contactExternalId}</Td>
                    <Td className="text-slate-500">{formatDate(s.soldAt)}</Td>
                    <Td className="text-right">{formatCop(s.amount)}</Td>
                    <Td className="text-right font-medium text-emerald-700">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
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
  return <td className={`px-3 py-2 ${className ?? ""}`}>{children}</td>;
}
