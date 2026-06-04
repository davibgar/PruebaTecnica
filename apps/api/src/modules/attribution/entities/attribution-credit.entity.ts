import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { numericTransformer } from '../../../common/database/numeric.transformer';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { AudienceOrigin } from '../../../common/enums/audience-origin.enum';
import { Channel } from '../../../common/enums/channel.enum';

/**
 * Crédito PRECALCULADO: una fila por (venta × touchpoint × modelo). Fuente única
 * desde la que el dashboard agrega por SQL, sin recalcular en cada petición.
 * Algunos atributos se desnormalizan aquí (campaignId, audienceOrigin, channel,
 * soldAt) para que filtros y agregaciones sean GROUP BY/WHERE puros.
 */
@Entity('attribution_credits')
@Index('idx_credit_report', ['businessId', 'model', 'campaignId'])
@Index('idx_credit_filters', ['businessId', 'model', 'soldAt'])
export class AttributionCredit extends TenantEntity {
  @Column('uuid')
  saleId: string;

  @Column('uuid')
  touchpointId: string;

  /** Null si el touchpoint no tenía campaña. */
  @Column({ type: 'uuid', nullable: true })
  campaignId: string | null;

  @Column({ type: 'enum', enum: AttributionModel })
  model: AttributionModel;

  @Column({ type: 'enum', enum: AudienceOrigin })
  audienceOrigin: AudienceOrigin;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ type: 'timestamptz' })
  soldAt: Date;

  /** Monto del crédito asignado a este touchpoint (COP). */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  creditAmount: number;

  /** Ventana de atribución (días) con la que se calculó esta fila. */
  @Column('int')
  attributionWindowDays: number;
}
