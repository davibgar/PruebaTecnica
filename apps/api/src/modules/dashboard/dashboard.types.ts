import { AudienceOrigin } from '../../common/enums/audience-origin.enum';

/** Resumen del dataset del negocio (conteos reales). */
export interface DashboardOverview {
  businessId: string;
  contacts: number;
  touchpoints: number;
  sales: number;
  campaigns: number;
}

/** Seis métricas core del dashboard de entrada (valores blended). */
export interface DashboardMetrics {
  /** Ingreso real atribuido (POS). */
  attributedRevenue: number;
  totalSpend: number;
  /** Ingreso atribuido ÷ inversión. */
  roasReal: number;
  /** Ingreso reportado por plataforma ÷ inversión. */
  roasPlatform: number;
  conversions: number;
  /** Ingreso atribuido ÷ conversiones. */
  averageTicket: number;
  attributionWindowDays: number;
}

/** Fila por campaña: alimenta la tabla y los dos gráficos del dashboard. */
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
  /** true si |reconciliationDiffPct| > 5 (margen de reconciliación relevante). */
  flagged: boolean;
}

export interface DrilldownTouchpoint {
  id: string;
  channel: string;
  audienceOrigin: AudienceOrigin;
  occurredAt: Date;
  contactExternalId: string;
}

export interface DrilldownSale {
  saleId: string;
  contactExternalId: string;
  amount: number;
  soldAt: Date;
  /** Crédito que esta campaña recibió de esa venta, según el modelo. */
  creditToCampaign: number;
}

export interface CampaignDrilldown {
  campaign: CampaignReportRow;
  touchpoints: DrilldownTouchpoint[];
  attributedSales: DrilldownSale[];
}

/** Filtros del dashboard inferidos desde texto natural (modo conversacional). */
export interface ParsedFilters {
  filters: {
    from?: string;
    to?: string;
    campaignId?: string;
    audienceOrigin?: string;
    model?: string;
  };
  /** Qué entendió el parser (legible para la UI). */
  recognized: string[];
  /** Términos que no se reconocieron. */
  unrecognized: string[];
}

/** ROAS real por origen de audiencia (insight 7.2), con gasto prorrateado. */
export interface AudienceOriginPerformance {
  audienceOrigin: AudienceOrigin;
  attributedRevenue: number;
  conversions: number;
  proratedSpend: number;
  roasReal: number;
}
