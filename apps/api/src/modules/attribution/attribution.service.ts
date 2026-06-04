import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { Sale } from '../marketing/entities/sale.entity';
import { Touchpoint } from '../marketing/entities/touchpoint.entity';
import { AttributionCredit } from './entities/attribution-credit.entity';
import { AttributionStrategyFactory } from './attribution-strategy.factory';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Resumen del resultado de un recálculo de atribución. */
export interface RecomputeResult {
  businessId: string;
  attributionWindowDays: number;
  sales: number;
  attributedSales: number;
  creditsCreated: number;
  models: string[];
}

/**
 * Orquesta el cálculo de atribución multi-touch.
 *
 * Por cada venta reconstruye el path de touchpoints del contacto anteriores a la
 * conversión dentro de la ventana, delega el reparto a CADA estrategia y persiste
 * los créditos en `attribution_credits` (precalculado para los tres modelos, de
 * modo que conmutar el modelo en el dashboard sea instantáneo).
 *
 * Eficiencia: carga touchpoints y ventas en dos consultas y agrupa en memoria por
 * contacto, evitando N+1. El reparto por path se hace en servicio (permitido); las
 * agregaciones de reporte se resuelven luego en SQL sobre la tabla resultante.
 */
@Injectable()
export class AttributionService {
  constructor(
    @InjectRepository(Touchpoint)
    private readonly touchpoints: Repository<Touchpoint>,
    @InjectRepository(Sale)
    private readonly sales: Repository<Sale>,
    @InjectRepository(AttributionCredit)
    private readonly credits: Repository<AttributionCredit>,
    private readonly strategies: AttributionStrategyFactory,
    private readonly config: ConfigService,
  ) {}

  async recompute(
    businessId: string,
    windowDays?: number,
  ): Promise<RecomputeResult> {
    const window =
      windowDays ??
      this.config.get<AppConfig['attribution']>('attribution')!.windowDays;
    const windowMs = window * MS_PER_DAY;

    const [touchpoints, sales] = await Promise.all([
      this.touchpoints.find({
        where: { businessId },
        order: { contactId: 'ASC', occurredAt: 'ASC' },
      }),
      this.sales.find({ where: { businessId } }),
    ]);

    const touchpointsByContact = this.groupByContact(touchpoints);
    const strategies = this.strategies.getAll();
    const rows: AttributionCredit[] = [];
    let attributedSales = 0;

    for (const sale of sales) {
      const path = this.buildPath(
        touchpointsByContact.get(sale.contactId) ?? [],
        sale,
        windowMs,
      );
      if (path.length === 0) {
        continue; // venta sin touchpoints en ventana: real, pero no atribuible
      }
      attributedSales += 1;

      for (const strategy of strategies) {
        for (const { touchpoint, credit } of strategy.assign(path, sale)) {
          rows.push(
            this.credits.create({
              businessId,
              saleId: sale.id,
              touchpointId: touchpoint.id,
              campaignId: touchpoint.campaignId,
              model: strategy.model,
              audienceOrigin: touchpoint.audienceOrigin,
              channel: touchpoint.channel,
              soldAt: sale.soldAt,
              creditAmount: credit,
              attributionWindowDays: window,
            }),
          );
        }
      }
    }

    await this.persist(businessId, rows);

    return {
      businessId,
      attributionWindowDays: window,
      sales: sales.length,
      attributedSales,
      creditsCreated: rows.length,
      models: strategies.map((s) => s.model),
    };
  }

  private groupByContact(touchpoints: Touchpoint[]): Map<string, Touchpoint[]> {
    const map = new Map<string, Touchpoint[]>();
    for (const tp of touchpoints) {
      const list = map.get(tp.contactId);
      if (list) {
        list.push(tp);
      } else {
        map.set(tp.contactId, [tp]);
      }
    }
    return map;
  }

  /**
   * Touchpoints del contacto anteriores a la venta y dentro de la ventana.
   * La lista de entrada ya viene ordenada ascendentemente por fecha, así que el
   * path conserva ese orden (necesario para position-based y time-decay).
   */
  private buildPath(
    contactTouchpoints: Touchpoint[],
    sale: Sale,
    windowMs: number,
  ): Touchpoint[] {
    const saleTime = sale.soldAt.getTime();
    return contactTouchpoints.filter((tp) => {
      const t = tp.occurredAt.getTime();
      return t < saleTime && t >= saleTime - windowMs;
    });
  }

  /** Reemplaza atómicamente los créditos del negocio por los recién calculados. */
  private async persist(
    businessId: string,
    rows: AttributionCredit[],
  ): Promise<void> {
    await this.credits.manager.transaction(async (em) => {
      await em.delete(AttributionCredit, { businessId });
      if (rows.length > 0) {
        await em.save(rows, { chunk: 500 });
      }
    });
  }
}
