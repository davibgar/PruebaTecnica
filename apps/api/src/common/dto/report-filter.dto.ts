import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { AttributionModel } from '../enums/attribution-model.enum';
import { AudienceOrigin } from '../enums/audience-origin.enum';

/**
 * Filtros nativos compartidos por todos los reportes del dashboard. DTO único
 * (fuente de la verdad de los filtros) para no repetir validaciones por endpoint.
 *
 * Todos opcionales: su ausencia significa "sin filtrar por ese eje".
 */
export class ReportFilterDto {
  /** Inicio del rango de fechas (ISO-8601). */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Fin del rango de fechas (ISO-8601). */
  @IsOptional()
  @IsISO8601()
  to?: string;

  /** Campaña concreta. */
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  /** Origen de audiencia (fría / warm / base propia). */
  @IsOptional()
  @IsEnum(AudienceOrigin)
  audienceOrigin?: AudienceOrigin;

  /** Modelo de atribución con el que leer los créditos. */
  @IsOptional()
  @IsEnum(AttributionModel)
  model?: AttributionModel;
}
