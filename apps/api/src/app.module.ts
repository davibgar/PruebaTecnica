import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/app.config';
import { buildDataSourceOptions } from './config/database.config';

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
  ],
})
export class AppModule {}
