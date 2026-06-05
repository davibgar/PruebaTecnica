/** Claves de React Query centralizadas (evita strings sueltos e invalida fácil). */

import type { ReportFilter } from "./types";

export const queryKeys = {
  overview: () => ["overview"] as const,
  campaignOptions: (model: ReportFilter["model"]) =>
    ["campaign-options", model] as const,
  metrics: (filter: ReportFilter) => ["metrics", filter] as const,
  campaigns: (filter: ReportFilter) => ["campaigns", filter] as const,
  campaignDrilldown: (id: string, filter: ReportFilter) =>
    ["campaign-drilldown", id, filter] as const,
  audiencePerformance: (filter: ReportFilter) =>
    ["audience-performance", filter] as const,
  recommendations: () => ["recommendations"] as const,
  tasks: () => ["tasks"] as const,
};
