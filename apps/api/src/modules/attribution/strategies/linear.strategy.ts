import { Injectable } from '@nestjs/common';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { BaseAttributionStrategy } from './base-attribution.strategy';

/** Modelo lineal: pesos iguales → la base reparte monto/N a cada touchpoint. */
@Injectable()
export class LinearStrategy extends BaseAttributionStrategy {
  readonly model = AttributionModel.LINEAR;

  protected computeWeights(path: Touchpoint[]): number[] {
    return path.map(() => 1);
  }
}
