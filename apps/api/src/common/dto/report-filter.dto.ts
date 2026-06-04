import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { AttributionModel } from '../enums/attribution-model.enum';
import { AudienceOrigin } from '../enums/audience-origin.enum';

/**
 * Filtros compartidos por los reportes del dashboard (DTO único). Todos
 * opcionales: ausentes significan "sin filtrar por ese eje".
 */
export class ReportFilterDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsEnum(AudienceOrigin)
  audienceOrigin?: AudienceOrigin;

  @IsOptional()
  @IsEnum(AttributionModel)
  model?: AttributionModel;
}
