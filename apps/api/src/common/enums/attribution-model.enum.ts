/**
 * Modelos de atribución multi-touch soportados. Conmutables desde la UI; cada
 * valor resuelve a una estrategia de reparto de crédito distinta.
 */
export enum AttributionModel {
  /** Crédito igual a todos los touchpoints del path. */
  LINEAR = 'linear',
  /** Más crédito a los touchpoints cercanos a la conversión (decaimiento exponencial). */
  TIME_DECAY = 'time_decay',
  /** 40% al primero, 40% al último, 20% repartido entre los intermedios. */
  POSITION_BASED = 'position_based',
}
