"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { useOverview } from "./queries";

/** Secciones de la página; el sidebar navega entre ellas (scroll + activo). */
export const SECTIONS: { id: string; label: string; ico: IconName }[] = [
  { id: "resumen", label: "Resumen", ico: "pulse" },
  { id: "graficos", label: "Gráficos", ico: "analysis" },
  { id: "reconciliacion", label: "Reconciliación", ico: "scale" },
  { id: "action-center", label: "Action Center", ico: "spark" },
];

/**
 * Resalta la sección activa: la última cuyo borde superior ya cruzó el topbar
 * sticky. Más fiable que IntersectionObserver cuando dos secciones comparten
 * viewport.
 */
function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const root = document.querySelector(".main");
    if (!root) return;
    const OFFSET = 200; // alto aproximado del topbar sticky

    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= OFFSET) current = id;
      }
      setActive(current);
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [ids]);

  return active;
}

const SECTION_IDS = SECTIONS.map((s) => s.id);

export function Sidebar() {
  const overview = useOverview();
  const bizId = overview.data?.businessId;
  const active = useScrollSpy(SECTION_IDS);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">N</div>
        <div>
          <div className="brand-name">NodoTech</div>
          <div className="brand-sub">Marketing · Análisis</div>
        </div>
      </div>

      <div className="nav-label">Atribución multi-touch</div>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          className={"nav-item" + (active === s.id ? " active" : "")}
          onClick={() => go(s.id)}
        >
          <span className="nav-ico">
            <Icon name={s.ico} size={17} />
          </span>
          {s.label}
        </button>
      ))}

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
