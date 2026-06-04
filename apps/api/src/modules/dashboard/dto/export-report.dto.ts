import { IsIn, IsOptional } from 'class-validator';
import { ReportFilterDto } from '../../../common/dto/report-filter.dto';

export type ExportFormat = 'csv' | 'pdf';

/** Filtros del dashboard + formato de exportación. */
export class ExportReportDto extends ReportFilterDto {
  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format?: ExportFormat;
}
