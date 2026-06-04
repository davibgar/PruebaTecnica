import { IsEnum, IsOptional } from 'class-validator';
import { AttributionModel } from '../../../common/enums/attribution-model.enum';

/** Parámetros para (re)generar recomendaciones. */
export class GenerateRecommendationsDto {
  /** Modelo de atribución con el que evaluar las reglas (default: lineal). */
  @IsOptional()
  @IsEnum(AttributionModel)
  model?: AttributionModel;
}
