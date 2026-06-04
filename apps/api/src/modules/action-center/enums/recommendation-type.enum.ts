/** Tipo de recomendación según la regla que la disparó. */
export enum RecommendationType {
  /** ROAS real < 1 en una campaña. */
  PAUSE_LOW_ROAS = 'pause_low_roas',
  /** El origen de audiencia con mejor ROAS real. */
  SCALE_BEST_ORIGIN = 'scale_best_origin',
  /** Reconciliación > 5%: el píxel sobreestima vs POS. */
  REVIEW_RECONCILIATION = 'review_reconciliation',
}
