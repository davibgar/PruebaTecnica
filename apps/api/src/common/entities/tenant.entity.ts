import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Base abstracta de toda entidad de un negocio (tenant): centraliza `id`,
 * `businessId` y `createdAt`. No indexa `businessId` aquí; cada entidad declara
 * el índice compuesto que sus accesos necesitan (evita índices redundantes).
 */
export abstract class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  businessId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
