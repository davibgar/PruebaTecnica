import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CampaignReportRow } from './dashboard.types';

const COLUMNS = [
  'Campaña',
  'Inversión (COP)',
  'Ingreso atribuido (COP)',
  'ROAS real',
  'ROAS plataforma',
  'Diferencia %',
  'Conversiones',
  'Reconciliación',
] as const;

/**
 * Exporta el reporte por campaña a CSV o PDF "para mostrar a stakeholders".
 * Aislado del servicio de reportes (responsabilidad única: formatear/serializar).
 */
@Injectable()
export class ReportExporter {
  toCsv(rows: CampaignReportRow[]): string {
    const lines = [COLUMNS.join(',')];
    for (const r of rows) {
      lines.push(
        [
          csvField(r.name),
          r.spend,
          r.attributedRevenue,
          r.roasReal,
          r.roasPlatform,
          r.reconciliationDiffPct,
          r.conversions,
          r.flagged ? 'revisar (>5%)' : 'ok',
        ].join(','),
      );
    }
    // BOM para que Excel reconozca UTF-8 (acentos); CRLF amigable con Excel.
    return '﻿' + lines.join('\r\n');
  }

  toPdf(rows: CampaignReportRow[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Reporte de campañas — NodoTech Marketing');
      doc
        .moveDown(0.3)
        .fontSize(10)
        .fillColor('#666')
        .text(
          'ROAS real (atribuido a POS) vs ROAS reportado por la plataforma',
        );
      doc.moveDown();

      for (const r of rows) {
        doc.fillColor('#111').fontSize(13).text(r.name);
        doc
          .fillColor('#444')
          .fontSize(9)
          .text(
            `Inversión ${cop(r.spend)}  ·  Atribuido ${cop(r.attributedRevenue)}  ·  ` +
              `ROAS real ${r.roasReal}  ·  ROAS plataforma ${r.roasPlatform}  ·  ` +
              `Dif ${r.reconciliationDiffPct}%  ·  ${r.conversions} conversiones` +
              (r.flagged ? '  [reconciliación > 5%]' : ''),
          );
        doc.moveDown(0.6);
      }

      doc.end();
    });
  }
}

function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function cop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
