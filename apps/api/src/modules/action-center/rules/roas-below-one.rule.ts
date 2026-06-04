import { Injectable } from '@nestjs/common';
import { RecommendationType } from '../enums/recommendation-type.enum';
import {
  CandidateRecommendation,
  RecommendationRule,
  RuleInput,
} from './recommendation-rule.interface';

/** Campañas con ROAS real < 1 → recomendar pausar o redistribuir presupuesto. */
@Injectable()
export class RoasBelowOneRule implements RecommendationRule {
  evaluate({ campaigns }: RuleInput): CandidateRecommendation[] {
    return campaigns
      .filter((c) => c.spend > 0 && c.roasReal < 1)
      .map((c) => ({
        type: RecommendationType.PAUSE_LOW_ROAS,
        ruleKey: `pause_low_roas:${c.campaignId}`,
        title: `"${c.name}" tiene ROAS real ${c.roasReal} (< 1)`,
        context: {
          campaignId: c.campaignId,
          campaignName: c.name,
          roasReal: c.roasReal,
          spend: c.spend,
          attributedRevenue: c.attributedRevenue,
        },
        cta: 'Pausar o redistribuir el presupuesto de la campaña',
      }));
  }
}
