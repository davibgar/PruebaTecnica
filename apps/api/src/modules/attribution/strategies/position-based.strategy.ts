import { Injectable } from '@nestjs/common';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { BaseAttributionStrategy } from './base-attribution.strategy';

const FIRST_LAST_WEIGHT = 0.4; // 40% al primero y 40% al último
const MIDDLE_TOTAL_WEIGHT = 0.2; // 20% repartido entre los intermedios

/**
 * Modelo position-based (U-shaped): 40% al primer touchpoint, 40% al último y
 * 20% repartido por igual entre los intermedios.
 *
 * Casos borde documentados:
 * - 1 touchpoint  → recibe el 100%.
 * - 2 touchpoints → 50% / 50% (no hay intermedios; el 20% se reabsorbe en
 *   primero y último a partes iguales).
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
