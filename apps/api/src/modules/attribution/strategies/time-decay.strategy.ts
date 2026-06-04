import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { BaseAttributionStrategy } from './base-attribution.strategy';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Modelo time-decay: más crédito a los touchpoints más cercanos a la conversión,
 * con decaimiento exponencial.
 *
 *   peso(t) = 2 ^ (-Δdías / halfLife)
 *
 * donde Δdías es la distancia del touchpoint a la venta. Con cada `halfLife`
 * días de antigüedad el peso se reduce a la mitad. El half-life es configurable
 * (`ATTRIBUTION_HALF_LIFE_DAYS`, por defecto 7 días).
 */
@Injectable()
export class TimeDecayStrategy extends BaseAttributionStrategy {
  readonly model = AttributionModel.TIME_DECAY;

  private readonly halfLifeDays: number;

  constructor(config: ConfigService) {
    super();
    this.halfLifeDays =
      config.get<AppConfig['attribution']>('attribution')?.halfLifeDays ?? 7;
  }

  protected computeWeights(path: Touchpoint[], sale: Sale): number[] {
    const saleTime = sale.soldAt.getTime();
    return path.map((tp) => {
      const deltaDays = (saleTime - tp.occurredAt.getTime()) / MS_PER_DAY;
      return Math.pow(2, -deltaDays / this.halfLifeDays);
    });
  }
}
