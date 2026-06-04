import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Parámetros del recálculo de atribución. */
export class RecomputeDto {
  /** Ventana en días; si se omite, la del entorno (default 30). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  window?: number;
}
