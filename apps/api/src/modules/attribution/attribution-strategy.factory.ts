import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { AttributionStrategy } from './strategies/attribution-strategy.interface';
import { LinearStrategy } from './strategies/linear.strategy';
import { TimeDecayStrategy } from './strategies/time-decay.strategy';
import { PositionBasedStrategy } from './strategies/position-based.strategy';

/**
 * Resuelve la estrategia a partir del enum del modelo. Añadir un modelo nuevo es
 * registrar una estrategia más aquí, sin if/else en los servicios (OCP).
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

  getAll(): AttributionStrategy[] {
    return [...this.registry.values()];
  }
}
