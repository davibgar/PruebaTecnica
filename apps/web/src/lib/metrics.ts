/** Derivaciones de dominio sobre las métricas (cálculos puros, reutilizables). */

/**
 * Δ del ROAS real respecto al reportado por la plataforma, en %.
 * (+) la plataforma sub-reporta · (−) el píxel infla.
 */
export function roasDeltaPct(roasReal: number, roasPlatform: number): number {
  return roasPlatform ? ((roasReal - roasPlatform) / roasPlatform) * 100 : 0;
}
