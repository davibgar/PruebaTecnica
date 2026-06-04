import { Column, Entity, Unique } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';

/**
 * Contacto con identidad única dentro de un negocio. El unique
 * (businessId, externalId) ya provee índice que lidera con businessId.
 */
@Entity('contacts')
@Unique('uq_contact_business_external', ['businessId', 'externalId'])
export class Contact extends TenantEntity {
  /** Identificador del contacto en el sistema de origen (POS/CRM). */
  @Column()
  externalId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;
}
