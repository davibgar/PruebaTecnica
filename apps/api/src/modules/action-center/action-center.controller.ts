import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BusinessId } from '../../common/decorators/business-id.decorator';
import { ActionCenterService, GenerateResult } from './action-center.service';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';
import { Recommendation } from './entities/recommendation.entity';
import { Task } from './entities/task.entity';

@Controller('action-center')
export class ActionCenterController {
  constructor(private readonly actionCenter: ActionCenterService) {}

  /** Recomendaciones pendientes. */
  @Get('recommendations')
  getRecommendations(
    @BusinessId() businessId: string,
  ): Promise<Recommendation[]> {
    return this.actionCenter.getRecommendations(businessId);
  }

  /** (Re)evalúa las reglas y hace upsert de recomendaciones. */
  @Post('recommendations/generate')
  @HttpCode(200)
  generate(
    @BusinessId() businessId: string,
    @Query() dto: GenerateRecommendationsDto,
  ): Promise<GenerateResult> {
    return this.actionCenter.generate(businessId, dto.model);
  }

  /** Acepta una recomendación → crea la task. */
  @Post('recommendations/:id/accept')
  @HttpCode(201)
  accept(
    @BusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Task> {
    return this.actionCenter.accept(businessId, id);
  }

  /** Descarta una recomendación (cambio de estado). */
  @Patch('recommendations/:id/dismiss')
  dismiss(
    @BusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Recommendation> {
    return this.actionCenter.dismiss(businessId, id);
  }

  /** Tasks aceptadas. */
  @Get('tasks')
  getTasks(@BusinessId() businessId: string): Promise<Task[]> {
    return this.actionCenter.getTasks(businessId);
  }

  /** Marca una task como hecha (cambio de estado). */
  @Patch('tasks/:id/complete')
  completeTask(
    @BusinessId() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Task> {
    return this.actionCenter.completeTask(businessId, id);
  }
}
