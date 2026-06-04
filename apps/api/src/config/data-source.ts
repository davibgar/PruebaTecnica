import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './database.config';

/**
 * DataSource usado EXCLUSIVAMENTE por el CLI de TypeORM (migration:generate,
 * migration:run, migration:revert). La aplicación NestJS no lo usa: ella
 * configura TypeORM vía `TypeOrmModule.forRootAsync` reutilizando las mismas
 * opciones.
 */
dotenv.config();

export default new DataSource(buildDataSourceOptions());
