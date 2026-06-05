"use client";

import { FilterBar } from "../filters/filter-bar";
import { FiltersProvider } from "../filters/filters-context";
import { ActionCenter } from "../action-center/action-center";
import { AudiencePerformance } from "./audience-performance";
import { CampaignTable } from "./campaign-table";
import { DashboardCharts } from "./charts";
import { MetricsCards } from "./metrics-cards";

/**
 * Raíz de composición del dashboard de entrada (sub-módulo 07). Provee el
 * contexto de filtros y orquesta las secciones; cada una se invalida sola al
 * cambiar un filtro.
 */
export function DashboardPage() {
  return (
    <FiltersProvider>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Análisis de Marketing
          </h1>
          <p className="text-sm text-slate-500">
            Atribución multi-touch y ROAS real reconciliado contra ventas POS.
          </p>
        </header>

        <div className="space-y-6">
          <FilterBar />
          <MetricsCards />
          <DashboardCharts />
          <CampaignTable />
          <AudiencePerformance />
          <ActionCenter />
        </div>
      </div>
    </FiltersProvider>
  );
}
