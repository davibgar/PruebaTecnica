import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingModule } from '../marketing/marketing.module';
import { AttributionCredit } from './entities/attribution-credit.entity';
import { AttributionController } from './attribution.controller';
import { AttributionService } from './attribution.service';
import { AttributionStrategyFactory } from './attribution-strategy.factory';
import { LinearStrategy } from './strategies/linear.strategy';
import { TimeDecayStrategy } from './strategies/time-decay.strategy';
import { PositionBasedStrategy } from './strategies/position-based.strategy';

/**
 * Módulo de atribución multi-touch. Reúne las estrategias (patrón Strategy), el
 * factory que las resuelve y el servicio que orquesta el recálculo. Importa
 * MarketingModule para inyectar los repositorios de Touchpoint y Sale.
 *
 * Exporta el servicio y el factory para que el dashboard pueda consumirlos.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AttributionCredit]), MarketingModule],
  controllers: [AttributionController],
  providers: [
    AttributionService,
    AttributionStrategyFactory,
    LinearStrategy,
    TimeDecayStrategy,
    PositionBasedStrategy,
  ],
  exports: [AttributionService, AttributionStrategyFactory],
})
export class AttributionModule {}
