"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAudiencePerformance,
  getCampaignDrilldown,
  getCampaigns,
  getMetrics,
  getOverview,
} from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";
import type { ReportFilter } from "@/lib/types";

/** Hooks de lectura del dashboard. Cada uno se invalida por su clave + filtros. */

export function useOverview() {
  return useQuery({ queryKey: ["overview"], queryFn: getOverview });
}

export function useMetrics(filter: ReportFilter) {
  return useQuery({
    queryKey: queryKeys.metrics(filter),
    queryFn: () => getMetrics(filter),
  });
}

export function useCampaigns(filter: ReportFilter) {
  return useQuery({
    queryKey: queryKeys.campaigns(filter),
    queryFn: () => getCampaigns(filter),
  });
}

export function useAudiencePerformance(filter: ReportFilter) {
  return useQuery({
    queryKey: queryKeys.audiencePerformance(filter),
    queryFn: () => getAudiencePerformance(filter),
  });
}

export function useCampaignDrilldown(
  campaignId: string | null,
  filter: ReportFilter,
) {
  return useQuery({
    queryKey: queryKeys.campaignDrilldown(campaignId ?? "", filter),
    queryFn: () => getCampaignDrilldown(campaignId as string, filter),
    enabled: campaignId !== null,
  });
}
