/** Endpoints del dashboard: métricas, campañas, drill-down, origen y export. */

import type {
  AudienceOriginPerformance,
  CampaignDrilldown,
  CampaignReportRow,
  DashboardMetrics,
  ParsedFilters,
  ReportFilter,
} from "../types";
import { request, requestBlob, toQuery } from "./client";

/** ReportFilter → record plano para la query string. */
export function filterToQuery(filter: ReportFilter): Record<string, string> {
  return {
    from: filter.from ?? "",
    to: filter.to ?? "",
    campaignId: filter.campaignId ?? "",
    audienceOrigin: filter.audienceOrigin ?? "",
    model: filter.model ?? "",
  };
}

export function getMetrics(filter: ReportFilter): Promise<DashboardMetrics> {
  return request(`/dashboard/metrics${toQuery(filterToQuery(filter))}`);
}

export function getCampaigns(
  filter: ReportFilter,
): Promise<CampaignReportRow[]> {
  return request(`/dashboard/campaigns${toQuery(filterToQuery(filter))}`);
}

export function getCampaignDrilldown(
  campaignId: string,
  filter: ReportFilter,
): Promise<CampaignDrilldown> {
  return request(
    `/dashboard/campaigns/${campaignId}${toQuery(filterToQuery(filter))}`,
  );
}

export function getAudiencePerformance(
  filter: ReportFilter,
): Promise<AudienceOriginPerformance[]> {
  return request(
    `/dashboard/audience-performance${toQuery(filterToQuery(filter))}`,
  );
}

export function parseFilters(text: string): Promise<ParsedFilters> {
  return request(`/dashboard/parse-filters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

/** Descarga el reporte por campaña (CSV o PDF) y dispara la descarga en el navegador. */
export async function downloadReport(
  filter: ReportFilter,
  format: "csv" | "pdf",
): Promise<void> {
  const query = toQuery({ ...filterToQuery(filter), format });
  const blob = await requestBlob(`/dashboard/export${query}`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-campanas.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoca el blob con retraso: si el navegador muestra "guardar como" la
  // descarga es diferida, y revocar de inmediato la cancelaría al confirmar.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
