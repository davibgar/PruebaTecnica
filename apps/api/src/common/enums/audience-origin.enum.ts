/**
 * Origen de la audiencia de un touchpoint. Es el eje que permite el insight del
 * bloque 7.2: qué origen rinde mejor por ROAS real.
 *
 * - `COLD`  (frías)       — públicos nuevos (geo/demo/intereses).
 * - `WARM`  (warm)        — engagement previo con activos propios.
 * - `OWNED` (base_propia) — base transaccional propia (ERP/CRM).
 */
export enum AudienceOrigin {
  COLD = 'fria',
  WARM = 'warm',
  OWNED = 'base_propia',
}
