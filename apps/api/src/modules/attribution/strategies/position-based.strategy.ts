import { Injectable } from '@nestjs/common';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { BaseAttributionStrategy } from './base-attribution.strategy';

const FIRST_LAST_WEIGHT = 0.4;
const MIDDLE_TOTAL_WEIGHT = 0.2;

/**
 * Position-based (U): 40% al primero, 40% al último, 20% entre los intermedios.
 * Bordes: N=1 → 100%; N=2 → 50/50 (el 20% se reabsorbe en primero y último).
 */
@Injectable()
export class PositionBasedStrategy extends BaseAttributionStrategy {
  readonly model = AttributionModel.POSITION_BASED;

  protected computeWeights(path: Touchpoint[]): number[] {
    const n = path.length;

    if (n === 1) {
      return [1];
    }
    if (n === 2) {
      return [0.5, 0.5];
    }

    const middleEach = MIDDLE_TOTAL_WEIGHT / (n - 2);
    return path.map((_, i) => {
      if (i === 0 || i === n - 1) {
        return FIRST_LAST_WEIGHT;
      }
      return middleEach;
    });
  }
}
