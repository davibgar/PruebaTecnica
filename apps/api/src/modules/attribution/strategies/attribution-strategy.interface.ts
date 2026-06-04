import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';

/** Crédito asignado a un touchpoint concreto del path de una venta. */
export interface CreditAllocation {
  touchpoint: Touchpoint;
  credit: number;
}

/**
 * Contrato de un modelo de atribución (Strategy): dado el path (ordenado
 * ascendente por fecha) y la venta, reparte el monto entre los touchpoints.
 * Invariante (garantizado en BaseAttributionStrategy): Σ créditos == monto.
 */
export interface AttributionStrategy {
  readonly model: AttributionModel;
  assign(path: Touchpoint[], sale: Sale): CreditAllocation[];
}
