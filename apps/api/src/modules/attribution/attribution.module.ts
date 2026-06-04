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
 * Atribución multi-touch: estrategias (Strategy), su factory y el servicio de
 * recálculo. Importa MarketingModule por los repositorios de Touchpoint y Sale.
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
