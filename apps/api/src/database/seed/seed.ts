import { NestFactory } from '@nestjs/core';
import { DataSource, EntityManager } from 'typeorm';
import { AppModule } from '../../app.module';
import { AttributionService } from '../../modules/attribution/attribution.service';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { AttributionCredit } from '../../modules/attribution/entities/attribution-credit.entity';
import { Campaign } from '../../modules/marketing/entities/campaign.entity';
import { Contact } from '../../modules/marketing/entities/contact.entity';
import { Sale } from '../../modules/marketing/entities/sale.entity';
import { Touchpoint } from '../../modules/marketing/entities/touchpoint.entity';
import { buildSeedData, DEMO_BUSINESS_ID } from './seed-data';

/**
 * Carga datos sintéticos coherentes para el negocio demo y recalcula la
 * atribución. Reutiliza el AttributionService de la app (no duplica lógica).
 *
 * Ejecutar:  npm run seed   (o, en Docker:  docker compose exec api npm run seed)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'], // silencia el log de arranque de Nest
  });

  try {
    const dataSource = app.get(DataSource);
    const attribution = app.get(AttributionService);
    const data = buildSeedData(new Date());

    await dataSource.transaction(async (em: EntityManager) => {
      // Borrado idempotente, en orden seguro de claves foráneas.
      await em.delete(AttributionCredit, { businessId: DEMO_BUSINESS_ID });
      await em.delete(Touchpoint, { businessId: DEMO_BUSINESS_ID });
      await em.delete(Sale, { businessId: DEMO_BUSINESS_ID });
      await em.delete(Campaign, { businessId: DEMO_BUSINESS_ID });
      await em.delete(Contact, { businessId: DEMO_BUSINESS_ID });

      // Inserción: primero los padres (campañas, contactos).
      await em.save(Campaign, data.campaigns);
      await em.save(Contact, data.contacts);
      await em.save(Touchpoint, data.touchpoints);
      await em.save(Sale, data.sales);
    });

    console.log(
      `Insertados: ${data.contacts.length} contactos, ${data.touchpoints.length} touchpoints, ` +
        `${data.sales.length} ventas, ${data.campaigns.length} campañas`,
    );

    const result = await attribution.recompute(DEMO_BUSINESS_ID);
    console.log(
      `Atribución recalculada (ventana ${result.attributionWindowDays}d): ` +
        `${result.attributedSales}/${result.sales} ventas atribuidas, ${result.creditsCreated} créditos`,
    );

    await printSummary(dataSource);

    console.log(
      `Seed completado. business_id (header x-business-id): ${DEMO_BUSINESS_ID}`,
    );
  } catch (error) {
    console.error('El seed falló:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

/** Resumen por campaña (modelo lineal) para verificar los escenarios del seed. */
async function printSummary(dataSource: DataSource): Promise<void> {
  const rows = await dataSource
    .createQueryBuilder()
    .select('camp.name', 'campaign')
    .addSelect('camp.adSpend', 'adSpend')
    .addSelect('camp.platformReportedRevenue', 'platformRevenue')
    .addSelect('COALESCE(SUM(cr.creditAmount), 0)', 'attributedRevenue')
    .from(Campaign, 'camp')
    .leftJoin(
      AttributionCredit,
      'cr',
      'cr.campaignId = camp.id AND cr.model = :model',
      { model: AttributionModel.LINEAR },
    )
    .where('camp.businessId = :businessId', { businessId: DEMO_BUSINESS_ID })
    .groupBy('camp.id')
    .addGroupBy('camp.name')
    .addGroupBy('camp.adSpend')
    .addGroupBy('camp.platformReportedRevenue')
    .orderBy('camp.name')
    .getRawMany<{
      campaign: string;
      adSpend: string;
      platformRevenue: string;
      attributedRevenue: string;
    }>();

  console.log('\nResumen por campaña (modelo lineal):');
  for (const r of rows) {
    const adSpend = Number(r.adSpend);
    const attributed = Number(r.attributedRevenue);
    const platform = Number(r.platformRevenue);
    const roasReal = adSpend ? attributed / adSpend : 0;
    const roasPlatform = adSpend ? platform / adSpend : 0;
    console.log(
      `  ${r.campaign.padEnd(28)} ROAS real ${roasReal.toFixed(2)} | ` +
        `ROAS plataforma ${roasPlatform.toFixed(2)} | atribuido ${formatCop(attributed)}`,
    );
  }
}

function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

void bootstrap();
