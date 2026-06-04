import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { BusinessId } from '../../common/decorators/business-id.decorator';
import { ReportFilterDto } from '../../common/dto/report-filter.dto';
import { DashboardService } from './dashboard.service';
import {
  AudienceOriginPerformance,
  CampaignDrilldown,
  CampaignReportRow,
  DashboardMetrics,
} from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

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
}
