import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import {
  AttributionStrategy,
  CreditAllocation,
} from './attribution-strategy.interface';

/**
 * Base de las estrategias de atribución (patrón Template Method).
 *
 * Aquí vive, escrita UNA sola vez, la parte común a todos los modelos: tomar un
 * vector de pesos y normalizarlo al monto de la venta. Cada modelo concreto solo
 * implementa `computeWeights` (el "cómo pesar"); el reparto y la garantía de que
 * la suma de créditos == monto exacto se resuelven aquí.
 *
 * El cuadre exacto se hace en centavos: todos los touchpoints salvo el último se
 * redondean, y el último recibe el remanente. Así nunca se pierde ni se inventa
 * un centavo por redondeo.
 */
export abstract class BaseAttributionStrategy implements AttributionStrategy {
  abstract readonly model: AttributionModel;

  /** Peso de cada touchpoint del path (mismo orden y longitud que `path`). */
  protected abstract computeWeights(path: Touchpoint[], sale: Sale): number[];

  assign(path: Touchpoint[], sale: Sale): CreditAllocation[] {
    if (path.length === 0) {
      return [];
    }

    const weights = this.computeWeights(path, sale);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Salvaguarda: pesos degenerados (suma 0) → reparto equitativo.
    const safeWeights = totalWeight > 0 ? weights : path.map(() => 1);
    const safeTotal = totalWeight > 0 ? totalWeight : safeWeights.length;

    const amountCents = Math.round(sale.amount * 100);
    let assignedCents = 0;

    return path.map((touchpoint, i) => {
      const isLast = i === path.length - 1;
      const cents = isLast
        ? amountCents - assignedCents // remanente → la suma cuadra exacto
        : Math.round((amountCents * safeWeights[i]) / safeTotal);
      if (!isLast) {
        assignedCents += cents;
      }
      return { touchpoint, credit: cents / 100 };
    });
  }
}
