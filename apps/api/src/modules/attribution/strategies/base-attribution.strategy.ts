import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import {
  AttributionStrategy,
  CreditAllocation,
} from './attribution-strategy.interface';

/**
 * Base de las estrategias (Template Method). Escribe una vez la normalización
 * peso→crédito; cada modelo solo aporta `computeWeights`. El cuadre se hace en
 * centavos (el último touchpoint recibe el remanente) para no perder ni inventar
 * un centavo: Σ créditos == monto exacto.
 */
export abstract class BaseAttributionStrategy implements AttributionStrategy {
  abstract readonly model: AttributionModel;

  /** Peso de cada touchpoint (mismo orden y longitud que `path`). */
  protected abstract computeWeights(path: Touchpoint[], sale: Sale): number[];

  assign(path: Touchpoint[], sale: Sale): CreditAllocation[] {
    if (path.length === 0) {
      return [];
    }

    const weights = this.computeWeights(path, sale);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Pesos degenerados (suma 0) → reparto equitativo.
    const safeWeights = totalWeight > 0 ? weights : path.map(() => 1);
    const safeTotal = totalWeight > 0 ? totalWeight : safeWeights.length;

    const amountCents = Math.round(sale.amount * 100);
    let assignedCents = 0;

    return path.map((touchpoint, i) => {
      const isLast = i === path.length - 1;
      const cents = isLast
        ? amountCents - assignedCents
        : Math.round((amountCents * safeWeights[i]) / safeTotal);
      if (!isLast) {
        assignedCents += cents;
      }
      return { touchpoint, credit: cents / 100 };
    });
  }
}
