import { IsString, MaxLength, MinLength } from 'class-validator';

/** Texto en lenguaje natural para configurar el dashboard (modo conversacional). */
export class ParseFiltersDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text: string;
}
