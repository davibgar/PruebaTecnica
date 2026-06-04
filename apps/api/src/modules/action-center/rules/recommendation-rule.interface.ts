import { RecommendationType } from '../enums/recommendation-type.enum';
import {
  AudienceOriginPerformance,
  CampaignReportRow,
} from '../../dashboard/dashboard.types';

/** Datos del dashboard sobre los que las reglas razonan. */
export interface RuleInput {
  campaigns: CampaignReportRow[];
  audiences: AudienceOriginPerformance[];
}

/** Recomendación candidata producida por una regla (aún sin persistir). */
export interface CandidateRecommendation {
  type: RecommendationType;
  /** Clave estable de deduplicación. */
  ruleKey: string;
  title: string;
  context: Record<string, unknown>;
  cta: string;
}

/**
 * Contrato de una regla del Action Center: dado el estado del dashboard,
 * devuelve las recomendaciones candidatas que aplican. Añadir una regla nueva es
 * crear una clase más e incluirla en el módulo (sin tocar el servicio).
 */
export interface RecommendationRule {
  evaluate(input: RuleInput): CandidateRecommendation[];
}
