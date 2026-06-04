import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './database.config';

// DataSource usado solo por el CLI de TypeORM (migrations). La app configura
// TypeORM vía TypeOrmModule reutilizando las mismas opciones.
dotenv.config();

export default new DataSource(buildDataSourceOptions());
