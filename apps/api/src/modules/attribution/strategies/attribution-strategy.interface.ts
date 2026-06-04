import { AttributionModel } from '../../../common/enums/attribution-model.enum';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';

/** Crédito asignado a un touchpoint concreto del path de una venta. */
export interface CreditAllocation {
  touchpoint: Touchpoint;
  credit: number;
}

/**
 * Contrato de un modelo de atribución (patrón Strategy). Dado el path de
 * touchpoints previos a una venta (ordenados ascendentemente por fecha) y la
 * venta, reparte el monto entre los touchpoints.
 *
 * Invariante que toda estrategia debe cumplir: la suma de los créditos
 * devueltos es igual al monto de la venta (se garantiza en BaseAttributionStrategy).
 */
export interface AttributionStrategy {
  /** Modelo que implementa esta estrategia (clave para el factory). */
  readonly model: AttributionModel;

  assign(path: Touchpoint[], sale: Sale): CreditAllocation[];
}
