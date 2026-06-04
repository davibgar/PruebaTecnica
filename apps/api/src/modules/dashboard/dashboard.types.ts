import { AudienceOrigin } from '../../common/enums/audience-origin.enum';

/** Seis métricas core del dashboard de entrada (valores blended). */
export interface DashboardMetrics {
  attributedRevenue: number; // ingreso real atribuido (POS)
  totalSpend: number; // inversión total
  roasReal: number; // ingreso atribuido ÷ inversión
  roasPlatform: number; // ingreso reportado por plataforma ÷ inversión
  conversions: number; // nº de ventas atribuidas
  averageTicket: number; // ingreso atribuido ÷ conversiones
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

/** ROAS real por origen de audiencia (insight 7.2), con gasto prorrateado. */
export interface AudienceOriginPerformance {
  audienceOrigin: AudienceOrigin;
  attributedRevenue: number;
  conversions: number;
  proratedSpend: number;
  roasReal: number;
}
