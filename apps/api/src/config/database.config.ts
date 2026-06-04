import { DataSourceOptions } from 'typeorm';

/**
 * Opciones de conexión a PostgreSQL.
 *
 * Fuente ÚNICA de la verdad de la configuración de BD: la consumen tanto el
 * `TypeOrmModule` de Nest (en runtime) como el `DataSource` del CLI de TypeORM
 * (para generar y correr migrations). Así no se duplica la config en dos sitios.
 *
 * `synchronize` queda SIEMPRE en `false`: el esquema se levanta únicamente
 * corriendo migrations, tal como exige el enunciado.
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
