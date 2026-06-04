import { Injectable } from '@nestjs/common';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { BaseAttributionStrategy } from './base-attribution.strategy';

/**
 * Modelo lineal: crédito igual a todos los touchpoints del path.
 * Pesos iguales → la base reparte monto/N a cada uno.
 */
@Injectable()
export class LinearStrategy extends BaseAttributionStrategy {
  readonly model = AttributionModel.LINEAR;

  protected computeWeights(path: Touchpoint[]): number[] {
    return path.map(() => 1);
  }
}
