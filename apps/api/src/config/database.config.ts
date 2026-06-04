import { DataSourceOptions } from 'typeorm';

/**
 * Opciones de conexión a PostgreSQL. Fuente única: las consumen el
 * `TypeOrmModule` de Nest (runtime) y el `DataSource` del CLI (migrations).
 *
 * `synchronize` siempre en `false`: el esquema se levanta solo con migrations.
 */
export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'nodotech',
    password: process.env.DB_PASSWORD ?? 'nodotech',
    database: process.env.DB_NAME ?? 'nodotech_marketing',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
  };
}
