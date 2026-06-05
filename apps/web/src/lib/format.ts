/** Formateadores de presentación: moneda COP, porcentajes, ROAS y fechas. */

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("es-CO");

const DATE = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Pesos colombianos sin decimales: `$ 1.250.000`. */
export function formatCop(value: number): string {
  return COP.format(value);
}

/** COP compacto para tarjetas y barras: `$16M`, `$395k`. */
export function formatCopShort(value: number): string {
  const v = Math.round(value || 0);
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    return "$" + (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (abs >= 1_000) {
    return "$" + Math.round(v / 1_000) + "k";
  }
  return "$" + v;
}

/** Porcentaje con signo explícito y decimales configurables: `+18%`, `−7.1%`. */
export function formatPctSigned(value: number, decimals = 1): string {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/** ROAS con dos decimales y una `x`: `2.45x`. */
export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

/** Porcentaje con signo explícito: `+18.3%` / `−7.1%`. */
export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

export function formatDate(value: string | Date): string {
  return DATE.format(typeof value === "string" ? new Date(value) : value);
}
