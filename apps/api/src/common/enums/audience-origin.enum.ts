/** Origen de la audiencia de un touchpoint (eje del insight de ROAS por origen). */
export enum AudienceOrigin {
  /** Públicos nuevos (geo/demo/intereses). */
  COLD = 'fria',
  /** Engagement previo con activos propios. */
  WARM = 'warm',
  /** Base transaccional propia (ERP/CRM). */
  OWNED = 'base_propia',
}
