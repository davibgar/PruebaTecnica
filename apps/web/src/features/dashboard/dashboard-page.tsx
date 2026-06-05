"use client";

import { useEffect, useState } from "react";
import { ActionCenter } from "../action-center/action-center";
import { FiltersProvider } from "../filters/filters-context";
import { Charts } from "./charts";
import { CommandBar } from "./command-bar";
import { FiltersBar } from "./filters-bar";
import { Metrics } from "./metrics";
import { ReconTable } from "./recon-table";
import { Sidebar } from "./sidebar";
import { ACCENTS, Tweaks, type Density } from "./tweaks";

/**
 * App shell del sub-módulo 07 (Análisis): sidebar de módulos + main con topbar,
 * command bar conversacional, filtros y todas las secciones del dashboard.
 */
export function DashboardPage() {
  const [accent, setAccent] = useState("Esmeralda");
  const [density, setDensity] = useState<Density>("balanced");

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", "oklch(" + ACCENTS[accent] + ")");
    const [l, c, h] = ACCENTS[accent].split(" ");
    root.style.setProperty("--accent-2", `oklch(${(parseFloat(l) - 0.08).toFixed(2)} ${c} ${h})`);
    root.style.setProperty("--accent-dim", `oklch(0.45 0.08 ${h})`);
  }, [accent]);

  return (
    <FiltersProvider>
      <div className="app" data-density={density}>
        <Sidebar />
        <main className="main">
          <div className="topbar">
            <div className="crumbs">
              Marketing <span className="sep">/</span> Análisis{" "}
              <span className="sep">/</span> <b>Atribución multi-touch</b>
            </div>
            <div className="page-head">
              <div>
                <h1 className="page-title">Análisis con atribución real</h1>
                <div className="page-desc">
                  ROAS reconciliado contra ventas POS reales · atribución multi-touch
                  conmutable sobre datos cruzados marketing + POS
                </div>
              </div>
            </div>
            <CommandBar />
          </div>

          <div className="content">
            <FiltersBar />
            <Metrics />
            <Charts />
            <ReconTable />
            <ActionCenter />
          </div>
        </main>
      </div>

      <Tweaks
        accent={accent}
        density={density}
        onAccent={setAccent}
        onDensity={setDensity}
      />
    </FiltersProvider>
  );
}
