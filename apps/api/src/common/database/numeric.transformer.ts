import { ValueTransformer } from 'typeorm';

/**
 * Convierte columnas `numeric` de PostgreSQL (que el driver entrega como
 * `string` para no perder precisión) a `number`. Centralizado para no repetirlo.
 */
export class NumericTransformer implements ValueTransformer {
  to(value: number | null): number | null {
    return value;
  }

  from(value: string | null): number | null {
    return value === null ? null : parseFloat(value);
  }
}

export const numericTransformer = new NumericTransformer();
