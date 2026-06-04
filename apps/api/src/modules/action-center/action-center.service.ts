import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { DashboardService } from '../dashboard/dashboard.service';
import { Recommendation } from './entities/recommendation.entity';
import { Task } from './entities/task.entity';
import { RecommendationStatus } from './enums/recommendation-status.enum';
import { TaskStatus } from './enums/task-status.enum';
import { BestAudienceOriginRule } from './rules/best-audience-origin.rule';
import { ReconciliationGapRule } from './rules/reconciliation-gap.rule';
import { RoasBelowOneRule } from './rules/roas-below-one.rule';
import {
  CandidateRecommendation,
  RecommendationRule,
} from './rules/recommendation-rule.interface';

const DEFAULT_OWNER = 'Equipo de Marketing';
const DUE_IN_DAYS = 3;

export interface GenerateResult {
  evaluated: number;
  created: number;
  pending: number;
}

/**
 * Action Center: evalúa reglas sobre el dato real del dashboard y materializa
 * recomendaciones en tasks accionables.
 *
 * Las recomendaciones se deduplican por `ruleKey`: regenerar refresca las que
 * siguen `pending` pero NO resucita las ya aceptadas o descartadas.
 */
@Injectable()
export class ActionCenterService {
  private readonly rules: RecommendationRule[];

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendations: Repository<Recommendation>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    private readonly dashboard: DashboardService,
    roasBelowOne: RoasBelowOneRule,
    bestAudienceOrigin: BestAudienceOriginRule,
    reconciliationGap: ReconciliationGapRule,
  ) {
    this.rules = [roasBelowOne, bestAudienceOrigin, reconciliationGap];
  }

  /** Evalúa las reglas y hace upsert de las recomendaciones (idempotente). */
  async generate(
    businessId: string,
    model: AttributionModel = AttributionModel.LINEAR,
  ): Promise<GenerateResult> {
    const [campaigns, audiences] = await Promise.all([
      this.dashboard.getCampaignTable(businessId, { model }),
      this.dashboard.getAudiencePerformance(businessId, { model }),
    ]);

    const candidates = this.rules.flatMap((rule) =>
      rule.evaluate({ campaigns, audiences }),
    );

    let created = 0;
    for (const candidate of candidates) {
      created += await this.upsert(businessId, candidate);
    }

    const pending = await this.recommendations.countBy({
      businessId,
      status: RecommendationStatus.PENDING,
    });
    return { evaluated: candidates.length, created, pending };
  }

  getRecommendations(businessId: string): Promise<Recommendation[]> {
    return this.recommendations.find({
      where: { businessId, status: RecommendationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  getTasks(businessId: string): Promise<Task[]> {
    return this.tasks.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Acepta una recomendación: crea la task y marca la recomendación aceptada. */
  async accept(businessId: string, id: string): Promise<Task> {
    const recommendation = await this.findPending(businessId, id);
    return this.recommendations.manager.transaction(async (em) => {
      recommendation.status = RecommendationStatus.ACCEPTED;
      await em.save(recommendation);
      const task = em.create(Task, {
        businessId,
        recommendationId: recommendation.id,
        title: recommendation.title,
        context: recommendation.context,
        owner: recommendation.suggestedOwner,
        dueDate: recommendation.suggestedDate,
        cta: recommendation.cta,
        status: TaskStatus.OPEN,
        completedAt: null,
      });
      return em.save(task);
    });
  }

  /** Descarta una recomendación (no reaparecerá al regenerar). */
  async dismiss(businessId: string, id: string): Promise<Recommendation> {
    const recommendation = await this.findPending(businessId, id);
    recommendation.status = RecommendationStatus.DISMISSED;
    return this.recommendations.save(recommendation);
  }

  /** Marca una task como hecha. */
  async completeTask(businessId: string, id: string): Promise<Task> {
    const task = await this.tasks.findOne({ where: { id, businessId } });
    if (!task) {
      throw new NotFoundException(`Task ${id} no encontrada`);
    }
    if (task.status === TaskStatus.DONE) {
      throw new BadRequestException('La task ya está completada');
    }
    task.status = TaskStatus.DONE;
    task.completedAt = new Date();
    return this.tasks.save(task);
  }

  // --- helpers --------------------------------------------------------------

  private async findPending(
    businessId: string,
    id: string,
  ): Promise<Recommendation> {
    const recommendation = await this.recommendations.findOne({
      where: { id, businessId },
    });
    if (!recommendation) {
      throw new NotFoundException(`Recomendación ${id} no encontrada`);
    }
    if (recommendation.status !== RecommendationStatus.PENDING) {
      throw new BadRequestException(
        `La recomendación ya fue ${recommendation.status}`,
      );
    }
    return recommendation;
  }

  /** Inserta si es nueva; refresca si sigue pendiente; ignora si ya se resolvió. */
  private async upsert(
    businessId: string,
    candidate: CandidateRecommendation,
  ): Promise<number> {
    const existing = await this.recommendations.findOne({
      where: { businessId, ruleKey: candidate.ruleKey },
    });

    if (!existing) {
      await this.recommendations.save(
        this.recommendations.create({
          businessId,
          type: candidate.type,
          ruleKey: candidate.ruleKey,
          title: candidate.title,
          context: candidate.context,
          cta: candidate.cta,
          suggestedOwner: DEFAULT_OWNER,
          suggestedDate: dueDate(DUE_IN_DAYS),
          status: RecommendationStatus.PENDING,
        }),
      );
      return 1;
    }

    if (existing.status === RecommendationStatus.PENDING) {
      existing.title = candidate.title;
      existing.context = candidate.context;
      existing.cta = candidate.cta;
      await this.recommendations.save(existing);
    }
    return 0;
  }
}

function dueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}
