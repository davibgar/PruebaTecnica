import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Parámetros del recálculo de atribución. */
export class RecomputeDto {
  /**
   * Ventana de atribución en días. Si se omite, se usa la del entorno
   * (`ATTRIBUTION_WINDOW_DAYS`, por defecto 30).
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  window?: number;
}
