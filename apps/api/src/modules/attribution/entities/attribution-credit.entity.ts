import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { numericTransformer } from '../../../common/database/numeric.transformer';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { AudienceOrigin } from '../../../common/enums/audience-origin.enum';
import { Channel } from '../../../common/enums/channel.enum';

/**
 * Crédito de atribución PRECALCULADO: una fila por (venta × touchpoint del path
 * × modelo). Es la fuente única desde la que el dashboard agrega por SQL, sin
 * recalcular el reparto en cada petición.
 *
 * Algunos atributos del touchpoint y de la venta se desnormalizan aquí
 * (campaignId, audienceOrigin, channel, soldAt) a propósito: permiten que las
 * agregaciones y los filtros del dashboard sean `GROUP BY`/`WHERE` puros en SQL.
 */
@Entity('attribution_credits')
@Index('idx_credit_report', ['businessId', 'model', 'campaignId'])
@Index('idx_credit_filters', ['businessId', 'model', 'soldAt'])
export class AttributionCredit extends TenantEntity {
  @Column('uuid')
  saleId: string;

  @Column('uuid')
  touchpointId: string;

  /** Campaña a la que fluye el crédito (null si el touchpoint no tenía campaña). */
  @Column({ type: 'uuid', nullable: true })
  campaignId: string | null;

  @Column({ type: 'enum', enum: AttributionModel })
  model: AttributionModel;

  /** Origen de audiencia del touchpoint (desnormalizado para filtrar en SQL). */
  @Column({ type: 'enum', enum: AudienceOrigin })
  audienceOrigin: AudienceOrigin;

  /** Canal del touchpoint (desnormalizado para agrupar en SQL). */
  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  /** Fecha de la venta (desnormalizada para filtrar por rango de fechas). */
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
