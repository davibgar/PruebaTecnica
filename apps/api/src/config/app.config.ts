/**
 * Config de aplicación tipada (todo lo que no es conexión a BD; esa vive en
 * `database.config.ts` por tener dos consumidores).
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
