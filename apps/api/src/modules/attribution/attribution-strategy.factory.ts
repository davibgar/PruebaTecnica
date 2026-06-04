import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { AttributionStrategy } from './strategies/attribution-strategy.interface';
import { LinearStrategy } from './strategies/linear.strategy';
import { TimeDecayStrategy } from './strategies/time-decay.strategy';
import { PositionBasedStrategy } from './strategies/position-based.strategy';

/**
 * Resuelve la estrategia de atribución a partir del enum del modelo. Centraliza
 * el mapeo modelo → estrategia para que ningún servicio tenga `if/else` por
 * modelo: añadir un modelo nuevo es registrar una estrategia más aquí (OCP).
 */
@Injectable()
export class AttributionStrategyFactory {
  private readonly registry: Map<AttributionModel, AttributionStrategy>;

  constructor(
    linear: LinearStrategy,
    timeDecay: TimeDecayStrategy,
    positionBased: PositionBasedStrategy,
  ) {
    this.registry = new Map(
      [linear, timeDecay, positionBased].map((s) => [s.model, s]),
    );
  }

  get(model: AttributionModel): AttributionStrategy {
    const strategy = this.registry.get(model);
    if (!strategy) {
      throw new NotFoundException(`Modelo de atribución desconocido: ${model}`);
    }
    return strategy;
  }

  /** Todas las estrategias registradas (usado por el recompute de todos los modelos). */
  getAll(): AttributionStrategy[] {
    return [...this.registry.values()];
  }
}
