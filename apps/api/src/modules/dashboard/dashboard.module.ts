import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingModule } from '../marketing/marketing.module';
import { AttributionCredit } from '../attribution/entities/attribution-credit.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Reportes del dashboard (solo lectura). Importa MarketingModule por los
 * repositorios de Campaign/Touchpoint/Contact/Sale y registra el de
 * AttributionCredit para agregar los créditos precalculados.
 */
@Module({
  imports: [MarketingModule, TypeOrmModule.forFeature([AttributionCredit])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
