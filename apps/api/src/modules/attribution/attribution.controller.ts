import { Controller, HttpCode, Post, Query } from '@nestjs/common';
import { BusinessId } from '../../common/decorators/business-id.decorator';
import { AttributionService, RecomputeResult } from './attribution.service';
import { RecomputeDto } from './dto/recompute.dto';

@Controller('attribution')
export class AttributionController {
  constructor(private readonly attribution: AttributionService) {}

  /** Recalcula los créditos de los tres modelos. Idempotente: reemplaza el anterior. */
  @Post('recompute')
  @HttpCode(200)
  recompute(
    @BusinessId() businessId: string,
    @Query() dto: RecomputeDto,
  ): Promise<RecomputeResult> {
    return this.attribution.recompute(businessId, dto.window);
  }
}
