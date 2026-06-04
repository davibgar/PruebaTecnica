import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { numericTransformer } from '../../../common/database/numeric.transformer';

/**
 * Campaña con su inversión y el ingreso que reporta la plataforma (el "píxel").
 * El ingreso REAL atribuido no se guarda aquí: se calcula cruzando con ventas.
 */
@Entity('campaigns')
@Index('idx_campaign_business', ['businessId'])
export class Campaign extends TenantEntity {
  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  /** Inversión publicitaria (COP). */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  adSpend: number;

  /** Ingreso reportado por la plataforma de ads (píxel de Meta). */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  platformReportedRevenue: number;
}
