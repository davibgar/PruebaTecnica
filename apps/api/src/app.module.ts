import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/app.config';
import { buildDataSourceOptions } from './config/database.config';
import { BusinessGuard } from './common/guards/business.guard';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AttributionModule } from './modules/attribution/attribution.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // Reutiliza las opciones del DataSource (fuente única) y registra las
    // entidades que cada módulo declara con `forFeature`.
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(),
      autoLoadEntities: true,
    }),
    MarketingModule,
    AttributionModule,
    DashboardModule,
  ],
  // Guard multi-tenant aplicado de forma global.
  providers: [{ provide: APP_GUARD, useClass: BusinessGuard }],
})
export class AppModule {}
