"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { useOverview } from "./queries";

const NAV: { ico: IconName; label: string; badge?: string; active?: boolean }[] = [
  { ico: "layers", label: "Cimientos" },
  { ico: "send", label: "Estrategia" },
  { ico: "audience", label: "Audiencias", badge: "Dif." },
  { ico: "funnel", label: "Captación" },
  { ico: "analysis", label: "Análisis", active: true },
];

/** Navegación del módulo Marketing (sub-módulos). Solo "Análisis" está activo. */
export function Sidebar() {
  const overview = useOverview();
  const bizId = overview.data?.businessId;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">N</div>
        <div>
          <div className="brand-name">NodoTech</div>
          <div className="brand-sub">Marketing</div>
        </div>
      </div>

      <div className="nav-label">Módulo Marketing</div>
      {NAV.map((n) => (
        <button
          key={n.label}
          className={"nav-item" + (n.active ? " active" : " disabled")}
        >
          <span className="nav-ico">
            <Icon name={n.ico} size={17} />
          </span>
          {n.label}
          {n.badge && <span className="nav-badge">{n.badge}</span>}
        </button>
      ))}

      <div className="nav-label">Sub-módulo 07</div>
      <button className="nav-item active" style={{ paddingLeft: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)", flex: "none" }} />
        Atribución multi-touch
      </button>
      <button className="nav-item disabled" style={{ paddingLeft: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--text-4)", flex: "none" }} />
        Diario estratégico
      </button>

      <div className="sidebar-foot">
        <div className="biz">
          <div className="biz-logo">N</div>
          <div style={{ minWidth: 0 }}>
            <div className="biz-name">Negocio demo</div>
            <div className="biz-meta" title={bizId}>
              {bizId ? `business_id · ${bizId.slice(0, 8)}…` : "cargando…"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
