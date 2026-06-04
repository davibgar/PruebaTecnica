import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { numericTransformer } from '../../../common/database/numeric.transformer';
import { Contact } from './contact.entity';

/** Venta real del POS: la conversión que la atribución reparte entre el path. */
@Entity('sales')
@Index('idx_sale_contact', ['businessId', 'contactId', 'soldAt'])
export class Sale extends TenantEntity {
  @Column('uuid')
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  /** Monto de la venta (COP). */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  amount: number;

  @Column({ type: 'timestamptz' })
  soldAt: Date;
}
