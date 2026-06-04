/**
 * Configuración de aplicación tipada (fuente única de la verdad para las
 * variables de entorno no relacionadas con la conexión a BD).
 *
 * La config de la base de datos vive en `database.config.ts` porque la
 * comparten dos consumidores: el `TypeOrmModule` de Nest y el `DataSource` del
 * CLI de migrations.
 */
export interface AppConfig {
  port: number;
  corsOrigin: string;
  attribution: {
    windowDays: number;
    halfLifeDays: number;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  attribution: {
    windowDays: parseInt(process.env.ATTRIBUTION_WINDOW_DAYS ?? '30', 10),
    halfLifeDays: parseInt(process.env.ATTRIBUTION_HALF_LIFE_DAYS ?? '7', 10),
  },
});
