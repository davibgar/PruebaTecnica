import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/app.config';
import { buildDataSourceOptions } from './config/database.config';
import { BusinessGuard } from './common/guards/business.guard';
import { MarketingModule } from './modules/marketing/marketing.module';

@Module({
  imports: [
    // Configuración global tipada, disponible vía ConfigService en toda la app.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Conexión a PostgreSQL reutilizando las opciones del DataSource (fuente
    // única). `autoLoadEntities` registra automáticamente las entidades que
    // cada módulo declara con `forFeature`, sin mantener una lista manual.
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(),
      autoLoadEntities: true,
    }),
    MarketingModule,
  ],
  providers: [
    // Multi-tenant: el guard se aplica de forma global a todos los endpoints.
    { provide: APP_GUARD, useClass: BusinessGuard },
  ],
})
export class AppModule {}
