import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BusinessId } from '../../common/decorators/business-id.decorator';
import { ReportFilterDto } from '../../common/dto/report-filter.dto';
import { DashboardService } from './dashboard.service';
import { ExportReportDto } from './dto/export-report.dto';
import { ReportExporter } from './report-exporter';
import {
  AudienceOriginPerformance,
  CampaignDrilldown,
  CampaignReportRow,
  DashboardMetrics,
} from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly exporter: ReportExporter,
  ) {}

  /** Seis métricas core del dashboard de entrada. */
  @Get('metrics')
  getMetrics(
    @BusinessId() businessId: string,
    @Query() filter: ReportFilterDto,
  ): Promise<DashboardMetrics> {
    return this.dashboard.getMetrics(businessId, filter);
  }

  /** Filas por campaña (tabla + gráficos): ROAS real vs plataforma, diferencia %. */
  @Get('campaigns')
  getCampaigns(
    @BusinessId() businessId: string,
    @Query() filter: ReportFilterDto,
  ): Promise<CampaignReportRow[]> {
    return this.dashboard.getCampaignTable(businessId, filter);
  }

  /** Drill-down de una campaña: touchpoints y ventas atribuidas. */
  @Get('campaigns/:id')
  getCampaignDrilldown(
    @BusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() filter: ReportFilterDto,
  ): Promise<CampaignDrilldown> {
    return this.dashboard.getCampaignDrilldown(businessId, id, filter);
  }

  /** ROAS real por origen de audiencia (insight 7.2). */
  @Get('audience-performance')
  getAudiencePerformance(
    @BusinessId() businessId: string,
    @Query() filter: ReportFilterDto,
  ): Promise<AudienceOriginPerformance[]> {
    return this.dashboard.getAudiencePerformance(businessId, filter);
  }

  /** Exporta el reporte por campaña a CSV (default) o PDF para stakeholders. */
  @Get('export')
  async export(
    @BusinessId() businessId: string,
    @Query() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const rows = await this.dashboard.getCampaignTable(businessId, dto);
    if (dto.format === 'pdf') {
      const pdf = await this.exporter.toPdf(rows);
      res
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="reporte-campanas.pdf"',
        })
        .send(pdf);
      return;
    }
    res
      .set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reporte-campanas.csv"',
      })
      .send(this.exporter.toCsv(rows));
  }
}
