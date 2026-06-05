/**
 * Tipos del dominio que espejan los DTOs del backend (fuente de verdad: la API).
 * Las fechas viajan como string ISO sobre JSON, así que aquí son `string`.
 */

// --- enums (valores idénticos a los del backend) ---------------------------

export const AttributionModel = {
  LINEAR: "linear",
  TIME_DECAY: "time_decay",
  POSITION_BASED: "position_based",
} as const;
export type AttributionModel =
  (typeof AttributionModel)[keyof typeof AttributionModel];

export const AudienceOrigin = {
  COLD: "fria",
  WARM: "warm",
  OWNED: "base_propia",
} as const;
export type AudienceOrigin =
  (typeof AudienceOrigin)[keyof typeof AudienceOrigin];

export const RecommendationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DISMISSED: "dismissed",
} as const;
export type RecommendationStatus =
  (typeof RecommendationStatus)[keyof typeof RecommendationStatus];

export const TaskStatus = {
  OPEN: "open",
  DONE: "done",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export type RecommendationType =
  | "pause_low_roas"
  | "scale_best_origin"
  | "review_reconciliation";

// --- filtros compartidos del dashboard --------------------------------------

export interface ReportFilter {
  from?: string;
  to?: string;
  campaignId?: string;
  audienceOrigin?: AudienceOrigin;
  model?: AttributionModel;
}

// --- reportes ---------------------------------------------------------------

export interface DashboardOverview {
  businessId: string;
  contacts: number;
  touchpoints: number;
  sales: number;
  campaigns: number;
}

export interface DashboardMetrics {
  attributedRevenue: number;
  totalSpend: number;
  roasReal: number;
  roasPlatform: number;
  conversions: number;
  averageTicket: number;
  attributionWindowDays: number;
}

export interface CampaignReportRow {
  campaignId: string;
  name: string;
  spend: number;
  attributedRevenue: number;
  platformReportedRevenue: number;
  roasReal: number;
  roasPlatform: number;
  conversions: number;
  /** (platform − atribuido) / atribuido × 100. (+) píxel infla, (−) sub-reporta. */
  reconciliationDiffPct: number;
  /** true si |reconciliationDiffPct| > 5. */
  flagged: boolean;
}

export interface DrilldownTouchpoint {
  id: string;
  channel: string;
  audienceOrigin: AudienceOrigin;
  occurredAt: string;
  contactExternalId: string;
}

export interface DrilldownSale {
  saleId: string;
  contactExternalId: string;
  amount: number;
  soldAt: string;
  creditToCampaign: number;
}

export interface CampaignDrilldown {
  campaign: CampaignReportRow;
  touchpoints: DrilldownTouchpoint[];
  attributedSales: DrilldownSale[];
}

export interface AudienceOriginPerformance {
  audienceOrigin: AudienceOrigin;
  attributedRevenue: number;
  conversions: number;
  proratedSpend: number;
  roasReal: number;
}

export interface ParsedFilters {
  filters: {
    from?: string;
    to?: string;
    campaignId?: string;
    audienceOrigin?: string;
    model?: string;
  };
  recognized: string[];
  unrecognized: string[];
}

// --- action center ----------------------------------------------------------

export interface Recommendation {
  id: string;
  type: RecommendationType;
  ruleKey: string;
  title: string;
  context: Record<string, unknown>;
  suggestedOwner: string;
  suggestedDate: string;
  cta: string;
  status: RecommendationStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  recommendationId: string;
  title: string;
  context: Record<string, unknown>;
  owner: string;
  dueDate: string;
  cta: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
}

// --- resultados de comandos --------------------------------------------------

export interface RecomputeResult {
  businessId: string;
  attributionWindowDays: number;
  sales: number;
  attributedSales: number;
  creditsCreated: number;
  models: string[];
}

export interface GenerateResult {
  evaluated: number;
  created: number;
  pending: number;
}
