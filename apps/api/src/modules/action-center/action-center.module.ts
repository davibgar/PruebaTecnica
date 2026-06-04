import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ActionCenterController } from './action-center.controller';
import { ActionCenterService } from './action-center.service';
import { Recommendation } from './entities/recommendation.entity';
import { Task } from './entities/task.entity';
import { BestAudienceOriginRule } from './rules/best-audience-origin.rule';
import { ReconciliationGapRule } from './rules/reconciliation-gap.rule';
import { RoasBelowOneRule } from './rules/roas-below-one.rule';

/**
 * Action Center: convierte el dato real del dashboard en recomendaciones y
 * tasks. Importa DashboardModule (reglas evaluadas sobre sus reportes) y
 * registra sus entidades.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Recommendation, Task]), DashboardModule],
  controllers: [ActionCenterController],
  providers: [
    ActionCenterService,
    RoasBelowOneRule,
    BestAudienceOriginRule,
    ReconciliationGapRule,
  ],
  exports: [ActionCenterService],
})
export class ActionCenterModule {}
