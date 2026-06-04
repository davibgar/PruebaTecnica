import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Base de toda entidad que pertenece a un negocio (tenant). Centraliza el `id`,
 * el `businessId` y el `createdAt` para no repetirlos en cada tabla. Es
 * abstracta: no genera tabla propia, solo aporta columnas por herencia.
 *
 * No indexa `businessId` aquí: cada entidad concreta declara el índice que sus
 * accesos necesitan (normalmente uno compuesto que ya lidera con `businessId`),
 * evitando índices redundantes que penalizarían las escrituras.
 */
export abstract class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  businessId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
