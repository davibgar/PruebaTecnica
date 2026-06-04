import { Injectable } from '@nestjs/common';
import { AudienceOrigin } from '../../../common/enums/audience-origin.enum';
import { RecommendationType } from '../enums/recommendation-type.enum';
import {
  CandidateRecommendation,
  RecommendationRule,
  RuleInput,
} from './recommendation-rule.interface';

const ORIGIN_LABELS: Record<AudienceOrigin, string> = {
  [AudienceOrigin.COLD]: 'audiencias frías',
  [AudienceOrigin.WARM]: 'audiencias warm',
  [AudienceOrigin.OWNED]: 'base propia',
};

/** El origen de audiencia con mejor ROAS real → recomendar subir presupuesto. */
@Injectable()
export class BestAudienceOriginRule implements RecommendationRule {
  evaluate({ audiences }: RuleInput): CandidateRecommendation[] {
    const best = audiences
      .filter((a) => a.roasReal > 0)
      .sort((a, b) => b.roasReal - a.roasReal)[0];
    if (!best) {
      return [];
    }
    return [
      {
        type: RecommendationType.SCALE_BEST_ORIGIN,
        ruleKey: `scale_best_origin:${best.audienceOrigin}`,
        title: `El origen "${ORIGIN_LABELS[best.audienceOrigin]}" tiene el mejor ROAS real (${best.roasReal})`,
        context: {
          audienceOrigin: best.audienceOrigin,
          roasReal: best.roasReal,
          attributedRevenue: best.attributedRevenue,
        },
        cta: 'Subir presupuesto hacia ese origen de audiencia',
      },
    ];
  }
}
