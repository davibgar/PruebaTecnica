import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { Recommendation } from './recommendation.entity';

/**
 * Task accionable creada al aceptar una recomendación. Lleva dueño, fecha
 * sugerida y CTA, y se marca como hecha desde la UI.
 */
@Entity('tasks')
@Index('idx_task_status', ['businessId', 'status'])
export class Task extends TenantEntity {
  @Column('uuid')
  recommendationId: string;

  @ManyToOne(() => Recommendation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendationId' })
  recommendation: Recommendation;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  context: Record<string, unknown>;

  @Column()
  owner: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column()
  cta: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status: TaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
