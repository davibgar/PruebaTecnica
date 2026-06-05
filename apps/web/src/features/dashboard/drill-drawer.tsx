"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { LoadingState } from "@/components/ui/states";
import { ApiError } from "@/lib/api/client";
import { formatCop, formatCopShort, formatDate } from "@/lib/format";
import { originLabel } from "@/lib/labels";
import { MODEL_LABELS } from "@/lib/labels";
import type { CampaignDrilldown } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import { useCampaignDrilldown } from "./queries";

const ORIGIN_COLOR: Record<string, string> = {
  fria: "var(--o-fria)",
  warm: "var(--o-warm)",
  base_propia: "var(--o-base_propia)",
};

/** Drawer lateral con el detalle de una campaña: ventas y touchpoints atribuidos. */
export function DrillDrawer({
  campaignId,
  campaignName,
  onClose,
}: {
  campaignId: string | null;
  campaignName: string;
  onClose: () => void;
}) {
  const { f, report } = useFilters();
  const query = useCampaignDrilldown(campaignId, report);

  useEffect(() => {
    if (!campaignId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [campaignId, onClose]);

  if (!campaignId) return null;

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).classList.contains("overlay")) onClose();
      }}
    >
      <div className="drawer">
        <div className="drawer-head">
          <button className="drawer-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
          <div className="drawer-eyebrow">Drill-down · campaña</div>
          <h2 className="drawer-title">{campaignName}</h2>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
            Modelo <b style={{ color: "var(--text-2)" }}>{MODEL_LABELS[f.model]}</b> · ventana {f.windowDays} días
          </div>
          {query.data && <Stats data={query.data} />}
        </div>

        <div className="drawer-body">
          {query.isPending && <LoadingState label="Cargando detalle…" />}
          {query.isError && (
            <p style={{ color: "var(--danger)", padding: "20px 0" }}>
              {query.error instanceof ApiError ? query.error.message : "Error al cargar"}
            </p>
          )}
          {query.data && <Body data={query.data} />}
        </div>
      </div>
    </div>
  );
}

function Stats({ data }: { data: CampaignDrilldown }) {
  const credit = data.attributedSales.reduce((s, x) => s + x.creditToCampaign, 0);
  return (
    <div className="drawer-stats">
      <div className="dstat">
        <div className="v" style={{ color: "var(--accent)" }}>{formatCopShort(credit)}</div>
        <div className="l">Ingreso atribuido (POS)</div>
      </div>
      <div className="dstat">
        <div className="v">{data.attributedSales.length}</div>
        <div className="l">Ventas atribuidas</div>
      </div>
      <div className="dstat">
        <div className="v">{data.touchpoints.length}</div>
        <div className="l">Touchpoints</div>
      </div>
    </div>
  );
}

function Body({ data }: { data: CampaignDrilldown }) {
  const { attributedSales, touchpoints } = data;
  return (
    <>
      <div className="sub-h">
        <Icon name="money" size={14} /> Ventas atribuidas{" "}
        <span className="count-badge muted">{attributedSales.length}</span>
      </div>
      <div>
        {attributedSales.slice(0, 16).map((s) => (
          <div className="tp-row" key={s.saleId} style={{ gridTemplateColumns: "1fr auto auto" }}>
            <div>
              <div className="tp-who">{s.contactExternalId}</div>
              <div className="tp-when">{formatDate(s.soldAt)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tp-when">venta total</div>
              <div className="cell-mono" style={{ fontSize: 12 }}>{formatCop(s.amount)}</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 110 }}>
              <div className="tp-when" style={{ color: "var(--accent)" }}>crédito campaña</div>
              <div className="tp-credit" style={{ color: "var(--accent)" }}>{formatCop(s.creditToCampaign)}</div>
            </div>
          </div>
        ))}
        {attributedSales.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: 12.5, padding: "8px 0" }}>
            Con este modelo y ventana, la campaña no recibe crédito.
          </p>
        )}
      </div>

      <div className="sub-h">
        <Icon name="layers" size={14} /> Touchpoints{" "}
        <span className="count-badge muted">{touchpoints.length}</span>
      </div>
      <div>
        {touchpoints.slice(0, 20).map((t) => (
          <div className="tp-row" key={t.id} style={{ gridTemplateColumns: "auto 1fr auto" }}>
            <span className="ch-tag">{t.channel}</span>
            <div>
              <div className="tp-who">{t.contactExternalId}</div>
              <div className="tp-when" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="o-dot" style={{ background: ORIGIN_COLOR[t.audienceOrigin] }} />
                {originLabel(t.audienceOrigin)} · {formatDate(t.occurredAt)}
              </div>
            </div>
          </div>
        ))}
        {touchpoints.length > 20 && (
          <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 12, padding: "12px 0" }}>
            + {touchpoints.length - 20} touchpoints más
          </div>
        )}
      </div>
    </>
  );
}
