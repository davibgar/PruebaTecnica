/** Modelos de atribución multi-touch; cada uno resuelve a una estrategia. */
export enum AttributionModel {
  /** Crédito igual a todos los touchpoints del path. */
  LINEAR = 'linear',
  /** Más crédito a los touchpoints cercanos a la conversión (decae exponencial). */
  TIME_DECAY = 'time_decay',
  /** 40% al primero, 40% al último, 20% entre los intermedios. */
  POSITION_BASED = 'position_based',
}
