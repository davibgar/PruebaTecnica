import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttributionModel } from '../../common/enums/attribution-model.enum';
import { AudienceOrigin } from '../../common/enums/audience-origin.enum';
import { Campaign } from '../marketing/entities/campaign.entity';
import { ParsedFilters } from './dashboard.types';

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const STOPWORDS = new Set([
  'muestrame',
  'muestra',
  'dame',
  'ver',
  'quiero',
  'reporte',
  'campana',
  'campanas',
  'modelo',
  'origen',
  'con',
  'del',
  'los',
  'las',
  'para',
  'ingresos',
  'ingreso',
  'ventas',
  'dias',
  'ultimos',
  'ultimas',
  'este',
  'mes',
  'pasado',
]);

/**
 * Parser de filtros del dashboard a partir de texto natural (modo conversacional
 * "mock" basado en reglas, sin LLM — documentado como tal). Reconoce modelo de
 * atribución, origen de audiencia, rango de fechas y campaña por nombre.
 */
@Injectable()
export class FilterParserService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaigns: Repository<Campaign>,
  ) {}

  async parse(
    businessId: string,
    text: string,
    now = new Date(),
  ): Promise<ParsedFilters> {
    const norm = normalize(text);
    const filters: ParsedFilters['filters'] = {};
    const recognized: string[] = [];
    const consumed = new Set<string>();

    this.matchModel(norm, filters, recognized, consumed);
    this.matchOrigin(norm, filters, recognized, consumed);
    this.matchDates(norm, now, filters, recognized, consumed);
    await this.matchCampaign(businessId, norm, filters, recognized, consumed);

    const unrecognized = norm
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !consumed.has(w));

    return { filters, recognized, unrecognized };
  }

  private matchModel(
    norm: string,
    filters: ParsedFilters['filters'],
    recognized: string[],
    consumed: Set<string>,
  ): void {
    if (/time.?decay|decai|decay/.test(norm)) {
      filters.model = AttributionModel.TIME_DECAY;
      recognized.push('modelo: time-decay');
      ['time', 'decay', 'decaimiento'].forEach((w) => consumed.add(w));
    } else if (/posicion|position|u.?shaped/.test(norm)) {
      filters.model = AttributionModel.POSITION_BASED;
      recognized.push('modelo: position-based');
      ['posicion', 'position', 'shaped'].forEach((w) => consumed.add(w));
    } else if (/lineal|linear/.test(norm)) {
      filters.model = AttributionModel.LINEAR;
      recognized.push('modelo: lineal');
      ['lineal', 'linear'].forEach((w) => consumed.add(w));
    }
  }

  private matchOrigin(
    norm: string,
    filters: ParsedFilters['filters'],
    recognized: string[],
    consumed: Set<string>,
  ): void {
    if (/base propia|propia|owned/.test(norm)) {
      filters.audienceOrigin = AudienceOrigin.OWNED;
      recognized.push('origen: base propia');
      ['base', 'propia', 'owned'].forEach((w) => consumed.add(w));
    } else if (/warm|templad|tibia/.test(norm)) {
      filters.audienceOrigin = AudienceOrigin.WARM;
      recognized.push('origen: warm');
      ['warm', 'templada', 'tibia'].forEach((w) => consumed.add(w));
    } else if (/fria|frio|cold/.test(norm)) {
      filters.audienceOrigin = AudienceOrigin.COLD;
      recognized.push('origen: frías');
      ['fria', 'frias', 'frio', 'cold'].forEach((w) => consumed.add(w));
    }
  }

  private matchDates(
    norm: string,
    now: Date,
    filters: ParsedFilters['filters'],
    recognized: string[],
    consumed: Set<string>,
  ): void {
    const lastN = norm.match(/ultim\w*\s+(\d+)\s+dias/);
    if (lastN) {
      const days = parseInt(lastN[1], 10);
      const from = new Date(now.getTime() - days * 86400000);
      filters.from = isoDate(from);
      filters.to = isoDate(now);
      recognized.push(`rango: últimos ${days} días`);
      consumed.add(lastN[1]);
      return;
    }

    if (/mes pasado|mes anterior/.test(norm)) {
      this.setMonth(
        now.getUTCFullYear(),
        now.getUTCMonth() - 1,
        filters,
        recognized,
      );
      return;
    }
    if (/este mes/.test(norm)) {
      this.setMonth(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        filters,
        recognized,
      );
      return;
    }

    const monthIdx = MONTHS.findIndex((m) => norm.includes(m));
    if (monthIdx >= 0) {
      this.setMonth(now.getUTCFullYear(), monthIdx, filters, recognized);
      consumed.add(MONTHS[monthIdx]);
    }
  }

  private setMonth(
    year: number,
    month: number,
    filters: ParsedFilters['filters'],
    recognized: string[],
  ): void {
    const from = new Date(Date.UTC(year, month, 1));
    const to = new Date(Date.UTC(year, month + 1, 0));
    filters.from = isoDate(from);
    filters.to = isoDate(to);
    recognized.push(`rango: ${filters.from} a ${filters.to}`);
  }

  private async matchCampaign(
    businessId: string,
    norm: string,
    filters: ParsedFilters['filters'],
    recognized: string[],
    consumed: Set<string>,
  ): Promise<void> {
    const campaigns = await this.campaigns.find({ where: { businessId } });
    for (const campaign of campaigns) {
      const words = normalize(campaign.name)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
      const hit = words.find((w) => norm.includes(w));
      if (hit) {
        filters.campaignId = campaign.id;
        recognized.push(`campaña: ${campaign.name}`);
        words.forEach((w) => consumed.add(w));
        return;
      }
    }
  }
}

/** minúsculas + sin acentos (quita marcas diacríticas vía propiedad Unicode). */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
