"use client";

import { ActionCenter } from "../action-center/action-center";
import { ConversationalFilter } from "../filters/conversational-filter";
import { FilterBar } from "../filters/filter-bar";
import { FiltersProvider } from "../filters/filters-context";
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
      <BrandBar />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <header className="mb-7">
          <p className="eyebrow">07 · Análisis · Marketing</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Análisis de Marketing
          </h1>
          <p className="mt-1 text-sm text-muted">
            Atribución multi-touch y ROAS real reconciliado contra ventas POS.
          </p>
        </header>

        <div className="space-y-6">
          <ConversationalFilter />
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

/** Barra superior con la marca NodoTech. */
function BrandBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-violet-500 text-xs font-bold text-background shadow-[0_0_20px_-4px_rgba(52,211,153,0.5)]">
            N
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            NodoTech
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            · Módulo Marketing
          </span>
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-inset ring-white/10">
          Negocio demo
        </span>
      </div>
    </div>
  );
}
