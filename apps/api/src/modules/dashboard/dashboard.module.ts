import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingModule } from '../marketing/marketing.module';
import { AttributionCredit } from '../attribution/entities/attribution-credit.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FilterParserService } from './filter-parser.service';
import { ReportExporter } from './report-exporter';

/**
 * Reportes del dashboard (solo lectura). Importa MarketingModule por los
 * repositorios de Campaign/Touchpoint/Contact/Sale y registra el de
 * AttributionCredit para agregar los créditos precalculados.
 */
@Module({
  imports: [MarketingModule, TypeOrmModule.forFeature([AttributionCredit])],
  controllers: [DashboardController],
  providers: [DashboardService, ReportExporter, FilterParserService],
  exports: [DashboardService],
})
export class DashboardModule {}
