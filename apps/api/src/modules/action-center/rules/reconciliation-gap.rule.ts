import { Injectable } from '@nestjs/common';
import { RecommendationType } from '../enums/recommendation-type.enum';
import {
  CandidateRecommendation,
  RecommendationRule,
  RuleInput,
} from './recommendation-rule.interface';

const RECONCILIATION_THRESHOLD = 5; // %

/**
 * Campañas donde el píxel sobreestima el ingreso por encima del 5% frente al POS
 * real → recomendar revisar la atribución antes de decidir sobre el presupuesto.
 */
@Injectable()
export class ReconciliationGapRule implements RecommendationRule {
  evaluate({ campaigns }: RuleInput): CandidateRecommendation[] {
    return campaigns
      .filter((c) => c.reconciliationDiffPct > RECONCILIATION_THRESHOLD)
      .map((c) => ({
        type: RecommendationType.REVIEW_RECONCILIATION,
        ruleKey: `review_reconciliation:${c.campaignId}`,
        title: `El píxel sobreestima "${c.name}" en ${c.reconciliationDiffPct}% vs ventas reales`,
        context: {
          campaignId: c.campaignId,
          campaignName: c.name,
          reconciliationDiffPct: c.reconciliationDiffPct,
          platformReportedRevenue: c.platformReportedRevenue,
          attributedRevenue: c.attributedRevenue,
        },
        cta: 'Revisar la atribución real antes de reasignar presupuesto',
      }));
  }
}
