import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { ReportFilterDto } from '../../common/dto/report-filter.dto';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { AudienceOrigin } from '../../common/enums/audience-origin.enum';
import { AttributionCredit } from '../attribution/entities/attribution-credit.entity';
import { Campaign } from '../marketing/entities/campaign.entity';
import { Contact } from '../marketing/entities/contact.entity';
import { Sale } from '../marketing/entities/sale.entity';
import { Touchpoint } from '../marketing/entities/touchpoint.entity';
import {
  AudienceOriginPerformance,
  CampaignDrilldown,
  CampaignReportRow,
  DashboardMetrics,
  DashboardOverview,
  DrilldownSale,
  DrilldownTouchpoint,
} from './dashboard.types';

/**
 * Reportes del dashboard. Todas las agregaciones se resuelven en SQL
 * (`SUM`/`COUNT`/`GROUP BY` vía QueryBuilder); el servicio solo calcula ratios
 * (ROAS, reconciliación) sobre los totales que devuelve la base, sin traer filas
 * a memoria para sumarlas.
 *
 * Supuestos documentados:
 * - `adSpend`/`platformReportedRevenue` son totales por campaña: el filtro de
 *   fechas/origen afecta el ingreso atribuido (POS), no la inversión.
 * - El ROAS por origen prorratea el gasto de cada campaña entre orígenes según
 *   la proporción de crédito atribuido a cada origen.
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(AttributionCredit)
    private readonly credits: Repository<AttributionCredit>,
    @InjectRepository(Campaign)
    private readonly campaigns: Repository<Campaign>,
    @InjectRepository(Touchpoint)
    private readonly touchpoints: Repository<Touchpoint>,
    @InjectRepository(Contact)
    private readonly contacts: Repository<Contact>,
    @InjectRepository(Sale)
    private readonly sales: Repository<Sale>,
    private readonly config: ConfigService,
  ) {}

  /** Resumen del dataset del negocio (conteos reales para el encabezado). */
  async getOverview(businessId: string): Promise<DashboardOverview> {
    const [contacts, touchpoints, sales, campaigns] = await Promise.all([
      this.contacts.countBy({ businessId }),
      this.touchpoints.countBy({ businessId }),
      this.sales.countBy({ businessId }),
      this.campaigns.countBy({ businessId }),
    ]);
    return { businessId, contacts, touchpoints, sales, campaigns };
  }

  async getMetrics(
    businessId: string,
    filter: ReportFilterDto,
  ): Promise<DashboardMetrics> {
    const spendQb = this.campaigns
      .createQueryBuilder('camp')
      .select('COALESCE(SUM(camp.adSpend), 0)', 'spend')
      .addSelect('COALESCE(SUM(camp.platformReportedRevenue), 0)', 'platform')
      .where('camp.businessId = :businessId', { businessId });
    if (filter.campaignId) {
      spendQb.andWhere('camp.id = :campaignId', {
        campaignId: filter.campaignId,
      });
    }
    const spendRow = await spendQb.getRawOne<{
      spend: string;
      platform: string;
    }>();

    const creditQb = this.credits
      .createQueryBuilder('cr')
      .select('COALESCE(SUM(cr.creditAmount), 0)', 'attributed')
      .addSelect('COUNT(DISTINCT cr.saleId)', 'conversions')
      .addSelect('MAX(cr.attributionWindowDays)', 'window');
    this.applyCreditFilters(creditQb, filter, businessId);
    const creditRow = await creditQb.getRawOne<{
      attributed: string;
      conversions: string;
      window: string | null;
    }>();

    const spend = Number(spendRow?.spend ?? 0);
    const platform = Number(spendRow?.platform ?? 0);
    const attributed = Number(creditRow?.attributed ?? 0);
    const conversions = Number(creditRow?.conversions ?? 0);

    return {
      attributedRevenue: attributed,
      totalSpend: spend,
      roasReal: ratio(attributed, spend),
      roasPlatform: ratio(platform, spend),
      conversions,
      averageTicket: ratio(attributed, conversions),
      attributionWindowDays:
        Number(creditRow?.window) ||
        this.config.get<AppConfig['attribution']>('attribution')!.windowDays,
    };
  }

  async getCampaignTable(
    businessId: string,
    filter: ReportFilterDto,
  ): Promise<CampaignReportRow[]> {
    // Los filtros de los créditos van en el ON del LEFT JOIN para que las
    // campañas sin créditos en el alcance aún aparezcan (en 0).
    const { joinCondition, params } = this.creditJoinCondition(filter);

    const qb = this.campaigns
      .createQueryBuilder('camp')
      .leftJoin(AttributionCredit, 'cr', joinCondition, params)
      .select('camp.id', 'campaignId')
      .addSelect('camp.name', 'name')
      .addSelect('camp.adSpend', 'spend')
      .addSelect('camp.platformReportedRevenue', 'platform')
      .addSelect('COALESCE(SUM(cr.creditAmount), 0)', 'attributed')
      .addSelect('COUNT(DISTINCT cr.saleId)', 'conversions')
      .where('camp.businessId = :businessId', { businessId })
      .groupBy('camp.id')
      .addGroupBy('camp.name')
      .addGroupBy('camp.adSpend')
      .addGroupBy('camp.platformReportedRevenue')
      .orderBy('camp.name', 'ASC');
    if (filter.campaignId) {
      qb.andWhere('camp.id = :campaignId', { campaignId: filter.campaignId });
    }

    const rows = await qb.getRawMany<CampaignRawRow>();
    return rows.map(toCampaignRow);
  }

  async getCampaignDrilldown(
    businessId: string,
    campaignId: string,
    filter: ReportFilterDto,
  ): Promise<CampaignDrilldown> {
    const campaign = await this.campaigns.findOne({
      where: { id: campaignId, businessId },
    });
    if (!campaign) {
      throw new NotFoundException(`Campaña ${campaignId} no encontrada`);
    }

    const scopedFilter: ReportFilterDto = { ...filter, campaignId };
    const [summary] = await this.getCampaignTable(businessId, scopedFilter);

    const touchpointRows = await this.touchpoints
      .createQueryBuilder('tp')
      .innerJoin(Contact, 'ct', 'ct.id = tp.contactId')
      .select('tp.id', 'id')
      .addSelect('tp.channel', 'channel')
      .addSelect('tp.audienceOrigin', 'audienceOrigin')
      .addSelect('tp.occurredAt', 'occurredAt')
      .addSelect('ct.externalId', 'contactExternalId')
      .where('tp.businessId = :businessId', { businessId })
      .andWhere('tp.campaignId = :campaignId', { campaignId })
      .orderBy('tp.occurredAt', 'DESC')
      .limit(200)
      .getRawMany<DrilldownTouchpoint>();

    const model = filter.model ?? AttributionModel.LINEAR;
    const saleQb = this.credits
      .createQueryBuilder('cr')
      .innerJoin(Sale, 'sale', 'sale.id = cr.saleId')
      .innerJoin(Contact, 'ct', 'ct.id = sale.contactId')
      .select('cr.saleId', 'saleId')
      .addSelect('ct.externalId', 'contactExternalId')
      .addSelect('sale.amount', 'amount')
      .addSelect('sale.soldAt', 'soldAt')
      .addSelect('SUM(cr.creditAmount)', 'creditToCampaign')
      .where('cr.businessId = :businessId', { businessId })
      .andWhere('cr.campaignId = :campaignId', { campaignId })
      .andWhere('cr.model = :model', { model })
      .groupBy('cr.saleId')
      .addGroupBy('ct.externalId')
      .addGroupBy('sale.amount')
      .addGroupBy('sale.soldAt')
      .orderBy('sale.soldAt', 'DESC');
    this.applyDateFilter(saleQb, filter);
    const saleRows = await saleQb.getRawMany<{
      saleId: string;
      contactExternalId: string;
      amount: string;
      soldAt: Date;
      creditToCampaign: string;
    }>();

    const attributedSales: DrilldownSale[] = saleRows.map((r) => ({
      saleId: r.saleId,
      contactExternalId: r.contactExternalId,
      amount: Number(r.amount),
      soldAt: r.soldAt,
      creditToCampaign: Number(r.creditToCampaign),
    }));

    return { campaign: summary, touchpoints: touchpointRows, attributedSales };
  }

  async getAudiencePerformance(
    businessId: string,
    filter: ReportFilterDto,
  ): Promise<AudienceOriginPerformance[]> {
    // Ingreso atribuido y conversiones por origen.
    const perOriginQb = this.credits
      .createQueryBuilder('cr')
      .select('cr.audienceOrigin', 'origin')
      .addSelect('COALESCE(SUM(cr.creditAmount), 0)', 'attributed')
      .addSelect('COUNT(DISTINCT cr.saleId)', 'conversions')
      .groupBy('cr.audienceOrigin');
    this.applyCreditFilters(perOriginQb, filter, businessId);
    const perOrigin = await perOriginQb.getRawMany<{
      origin: AudienceOrigin;
      attributed: string;
      conversions: string;
    }>();

    // Crédito por (campaña, origen) para prorratear el gasto entre orígenes.
    const perCampaignOriginQb = this.credits
      .createQueryBuilder('cr')
      .select('cr.campaignId', 'campaignId')
      .addSelect('cr.audienceOrigin', 'origin')
      .addSelect('SUM(cr.creditAmount)', 'credit')
      .where('cr.campaignId IS NOT NULL')
      .groupBy('cr.campaignId')
      .addGroupBy('cr.audienceOrigin');
    this.applyCreditFilters(perCampaignOriginQb, filter, businessId, false);
    const perCampaignOrigin = await perCampaignOriginQb.getRawMany<{
      campaignId: string;
      origin: AudienceOrigin;
      credit: string;
    }>();

    const spendByCampaign = await this.spendByCampaign(businessId, filter);
    const proratedSpendByOrigin = this.prorateSpend(
      perCampaignOrigin,
      spendByCampaign,
    );

    return perOrigin
      .map((row) => {
        const attributed = Number(row.attributed);
        const spend = proratedSpendByOrigin.get(row.origin) ?? 0;
        return {
          audienceOrigin: row.origin,
          attributedRevenue: attributed,
          conversions: Number(row.conversions),
          proratedSpend: round2(spend),
          roasReal: ratio(attributed, spend),
        };
      })
      .sort((a, b) => b.roasReal - a.roasReal);
  }

  // --- helpers --------------------------------------------------------------

  /** Aplica los filtros de créditos como WHERE sobre el alias `cr`. */
  private applyCreditFilters(
    qb: SelectQueryBuilder<AttributionCredit>,
    filter: ReportFilterDto,
    businessId: string,
    includeCampaign = true,
  ): void {
    const model = filter.model ?? AttributionModel.LINEAR;
    qb.andWhere('cr.businessId = :businessId', { businessId }).andWhere(
      'cr.model = :model',
      { model },
    );
    if (filter.from) qb.andWhere('cr.soldAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('cr.soldAt <= :to', { to: filter.to });
    if (includeCampaign && filter.campaignId) {
      qb.andWhere('cr.campaignId = :campaignId', {
        campaignId: filter.campaignId,
      });
    }
    if (filter.audienceOrigin) {
      qb.andWhere('cr.audienceOrigin = :audienceOrigin', {
        audienceOrigin: filter.audienceOrigin,
      });
    }
  }

  private applyDateFilter(
    qb: SelectQueryBuilder<AttributionCredit>,
    filter: ReportFilterDto,
  ): void {
    if (filter.from) qb.andWhere('cr.soldAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('cr.soldAt <= :to', { to: filter.to });
  }

  /** Condición ON (con params) del LEFT JOIN de créditos para la tabla. */
  private creditJoinCondition(filter: ReportFilterDto): {
    joinCondition: string;
    params: Record<string, unknown>;
  } {
    const model = filter.model ?? AttributionModel.LINEAR;
    const parts = ['cr.campaignId = camp.id', 'cr.model = :model'];
    const params: Record<string, unknown> = { model };
    if (filter.from) {
      parts.push('cr.soldAt >= :from');
      params.from = filter.from;
    }
    if (filter.to) {
      parts.push('cr.soldAt <= :to');
      params.to = filter.to;
    }
    if (filter.audienceOrigin) {
      parts.push('cr.audienceOrigin = :audienceOrigin');
      params.audienceOrigin = filter.audienceOrigin;
    }
    return { joinCondition: parts.join(' AND '), params };
  }

  private async spendByCampaign(
    businessId: string,
    filter: ReportFilterDto,
  ): Promise<Map<string, number>> {
    const qb = this.campaigns
      .createQueryBuilder('camp')
      .select('camp.id', 'id')
      .addSelect('camp.adSpend', 'spend')
      .where('camp.businessId = :businessId', { businessId });
    if (filter.campaignId) {
      qb.andWhere('camp.id = :campaignId', { campaignId: filter.campaignId });
    }
    const rows = await qb.getRawMany<{ id: string; spend: string }>();
    return new Map(rows.map((r) => [r.id, Number(r.spend)]));
  }

  /** Reparte el gasto de cada campaña entre orígenes según su cuota de crédito. */
  private prorateSpend(
    perCampaignOrigin: {
      campaignId: string;
      origin: AudienceOrigin;
      credit: string;
    }[],
    spendByCampaign: Map<string, number>,
  ): Map<AudienceOrigin, number> {
    const totalCreditByCampaign = new Map<string, number>();
    for (const row of perCampaignOrigin) {
      totalCreditByCampaign.set(
        row.campaignId,
        (totalCreditByCampaign.get(row.campaignId) ?? 0) + Number(row.credit),
      );
    }

    const spendByOrigin = new Map<AudienceOrigin, number>();
    for (const row of perCampaignOrigin) {
      const totalCredit = totalCreditByCampaign.get(row.campaignId) ?? 0;
      if (totalCredit <= 0) continue;
      const campaignSpend = spendByCampaign.get(row.campaignId) ?? 0;
      const share = (Number(row.credit) / totalCredit) * campaignSpend;
      spendByOrigin.set(
        row.origin,
        (spendByOrigin.get(row.origin) ?? 0) + share,
      );
    }
    return spendByOrigin;
  }
}

interface CampaignRawRow {
  campaignId: string;
  name: string;
  spend: string;
  platform: string;
  attributed: string;
  conversions: string;
}

function toCampaignRow(r: CampaignRawRow): CampaignReportRow {
  const spend = Number(r.spend);
  const attributed = Number(r.attributed);
  const platform = Number(r.platform);
  const diff =
    attributed > 0 ? ((platform - attributed) / attributed) * 100 : 0;
  return {
    campaignId: r.campaignId,
    name: r.name,
    spend,
    attributedRevenue: attributed,
    platformReportedRevenue: platform,
    roasReal: ratio(attributed, spend),
    roasPlatform: ratio(platform, spend),
    conversions: Number(r.conversions),
    reconciliationDiffPct: round2(diff),
    flagged: Math.abs(diff) > 5,
  };
}

function ratio(numerator: number, denominator: number): number {
  return denominator > 0 ? round2(numerator / denominator) : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
