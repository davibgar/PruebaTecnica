import { ValueTransformer } from 'typeorm';

/**
 * Convierte columnas `numeric`/`decimal` de PostgreSQL (que el driver entrega
 * como `string` para no perder precisión) a `number` en el modelo de dominio.
 *
 * Centralizado aquí para no repetir la conversión en cada entidad con montos.
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
