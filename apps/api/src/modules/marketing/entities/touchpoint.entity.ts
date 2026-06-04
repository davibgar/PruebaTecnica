import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Channel } from '../../../common/enums/channel.enum';
import { AudienceOrigin } from '../../../common/enums/audience-origin.enum';
import { Contact } from './contact.entity';
import { Campaign } from './campaign.entity';

/**
 * Punto de contacto con el que se reconstruye el path previo a cada venta.
 * El índice (businessId, contactId, occurredAt) sirve a esa reconstrucción.
 */
@Entity('touchpoints')
@Index('idx_touchpoint_path', ['businessId', 'contactId', 'occurredAt'])
export class Touchpoint extends TenantEntity {
  @Column('uuid')
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  /** Null en touchpoints orgánicos sin campaña. */
  @Column({ type: 'uuid', nullable: true })
  campaignId: string | null;

  @ManyToOne(() => Campaign, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign | null;

  @Column({ type: 'enum', enum: Channel })
  channel: Channel;

  @Column({ type: 'enum', enum: AudienceOrigin })
  audienceOrigin: AudienceOrigin;

  @Column({ type: 'timestamptz' })
  occurredAt: Date;
}
