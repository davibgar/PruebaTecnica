import { Column, Entity, Index, Unique } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { RecommendationStatus } from '../enums/recommendation-status.enum';
import { RecommendationType } from '../enums/recommendation-type.enum';

/**
 * Recomendación accionable generada por una regla a partir del dato real.
 *
 * `ruleKey` es la clave estable de deduplicación (ej. `pause_low_roas:<campId>`):
 * regenerar no duplica ni resucita una recomendación ya aceptada/descartada.
 */
@Entity('recommendations')
@Unique('uq_recommendation_business_key', ['businessId', 'ruleKey'])
@Index('idx_recommendation_status', ['businessId', 'status'])
export class Recommendation extends TenantEntity {
  @Column({ type: 'enum', enum: RecommendationType })
  type: RecommendationType;

  @Column()
  ruleKey: string;

  @Column()
  title: string;

  /** El dato que disparó la recomendación (para mostrar el contexto en la UI). */
  @Column({ type: 'jsonb' })
  context: Record<string, unknown>;

  @Column()
  suggestedOwner: string;

  @Column({ type: 'date' })
  suggestedDate: string;

  @Column()
  cta: string;

  @Column({
    type: 'enum',
    enum: RecommendationStatus,
    default: RecommendationStatus.PENDING,
  })
  status: RecommendationStatus;
}
