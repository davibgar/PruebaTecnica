import { randomUUID } from 'crypto';
import { DeepPartial } from 'typeorm';
import { AudienceOrigin } from '../../common/enums/audience-origin.enum';
import { Channel } from '../../common/enums/channel.enum';
import { Campaign } from '../../modules/marketing/entities/campaign.entity';
import { Contact } from '../../modules/marketing/entities/contact.entity';
import { Sale } from '../../modules/marketing/entities/sale.entity';
import { Touchpoint } from '../../modules/marketing/entities/touchpoint.entity';

/** Negocio de demostración. Es el `x-business-id` que debe usar el evaluador. */
export const DEMO_BUSINESS_ID = '11111111-1111-1111-1111-111111111111';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SeedDataset {
  campaigns: DeepPartial<Campaign>[];
  contacts: DeepPartial<Contact>[];
  touchpoints: DeepPartial<Touchpoint>[];
  sales: DeepPartial<Sale>[];
}

/**
 * Perfil de cada campaña, diseñado para que el dashboard evidencie escenarios
 * claros (los datos se generan sesgados a estos perfiles):
 *
 * - base propia → mejor ROAS real (mucha conversión, poca inversión).
 * - tiktok      → ROAS real < 1 (mucha inversión, poca conversión) → Action Center.
 * - meta        → el píxel sobre-reporta (reconciliación > 5% vs POS real).
 */
const CAMPAIGN_PROFILES = [
  {
    key: 'meta',
    name: 'Meta Ads — Día de la Madre',
    channels: [Channel.META],
    origin: AudienceOrigin.COLD,
    adSpend: 2_000_000,
    platformReportedRevenue: 5_500_000, // el píxel sobre-reporta fuerte
    convertRate: 0.55,
    avgTicket: 320_000,
    weight: 9,
  },
  {
    key: 'google',
    name: 'Google Search — Marca',
    channels: [Channel.GOOGLE],
    origin: AudienceOrigin.WARM,
    adSpend: 2_000_000,
    platformReportedRevenue: 3_800_000, // píxel ≈ real (reconciliación baja)
    convertRate: 0.6,
    avgTicket: 300_000,
    weight: 8,
  },
  {
    key: 'base_propia',
    name: 'Reactivación Base Propia',
    channels: [Channel.WHATSAPP, Channel.EMAIL],
    origin: AudienceOrigin.OWNED,
    adSpend: 1_200_000,
    platformReportedRevenue: 3_900_000, // píxel SUB-reporta (no ve canales propios)
    convertRate: 0.85,
    avgTicket: 480_000,
    weight: 8,
  },
  {
    key: 'tiktok',
    name: 'TikTok — Awareness',
    channels: [Channel.TIKTOK],
    origin: AudienceOrigin.COLD,
    adSpend: 3_200_000,
    platformReportedRevenue: 1_900_000, // ROAS malo incluso para el píxel
    convertRate: 0.25,
    avgTicket: 180_000,
    weight: 7,
  },
] as const;

type CampaignProfile = (typeof CAMPAIGN_PROFILES)[number];

/** PRNG determinista (mulberry32) para que el seed sea reproducible. */
function createRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeedData(now: Date, contactCount = 36): SeedDataset {
  const rng = createRng(20260604);
  const randInt = (min: number, max: number) =>
    min + Math.floor(rng() * (max - min + 1));
  const chance = (p: number) => rng() < p;
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const jitter = (base: number, pct: number) =>
    Math.round((base * (1 + (rng() * 2 - 1) * pct)) / 1000) * 1000;

  const campaigns: DeepPartial<Campaign>[] = CAMPAIGN_PROFILES.map((p) => ({
    id: randomUUID(),
    businessId: DEMO_BUSINESS_ID,
    name: p.name,
    startDate: toDateString(addDays(now, -45)),
    endDate: toDateString(now),
    adSpend: p.adSpend,
    platformReportedRevenue: p.platformReportedRevenue,
  }));
  const campaignIdByKey = new Map<string, string>(
    CAMPAIGN_PROFILES.map((p, i) => [p.key, campaigns[i].id as string]),
  );

  // Ruleta ponderada de campañas "cerradoras" por contacto.
  const closerRoulette: CampaignProfile[] = [];
  CAMPAIGN_PROFILES.forEach((p) => {
    for (let k = 0; k < p.weight; k++) closerRoulette.push(p);
  });

  const contacts: DeepPartial<Contact>[] = [];
  const touchpoints: DeepPartial<Touchpoint>[] = [];
  const sales: DeepPartial<Sale>[] = [];

  for (let c = 0; c < contactCount; c++) {
    const contactId = randomUUID();
    contacts.push({
      id: contactId,
      businessId: DEMO_BUSINESS_ID,
      externalId: `POS-${String(c + 1).padStart(4, '0')}`,
      name: `Contacto ${c + 1}`,
      email: `contacto${c + 1}@demo.co`,
      phone: `+57 3000000${String(c).padStart(3, '0')}`,
    });

    const closer = pick(closerRoulette);

    let purchases = 0;
    if (chance(closer.convertRate)) {
      purchases = 1;
      if (chance(0.8)) purchases += 1;
      if (closer.key === 'base_propia' && chance(0.5)) purchases += 1;
    }

    const recentSaleOffset = randInt(1, 5);
    const saleOffsets: number[] = [];
    for (let s = 0; s < purchases; s++) {
      saleOffsets.push(recentSaleOffset + s * randInt(3, 7));
    }
    const oldestSaleOffset = saleOffsets.length
      ? saleOffsets[saleOffsets.length - 1]
      : recentSaleOffset;

    const pathLength = randInt(3, 6);
    const gap = randInt(2, 5);
    const lastTouchOffset = oldestSaleOffset + 1;
    const firstTouchOffset = Math.min(
      lastTouchOffset + (pathLength - 1) * gap,
      recentSaleOffset + 29,
    );
    const step =
      pathLength > 1
        ? (firstTouchOffset - lastTouchOffset) / (pathLength - 1)
        : 0;

    for (let t = 0; t < pathLength; t++) {
      const isLast = t === pathLength - 1;
      const profile = isLast || chance(0.6) ? closer : pick(closerRoulette);
      const useOrganic = !isLast && chance(0.15);
      const offset = Math.round(firstTouchOffset - t * step);

      touchpoints.push({
        id: randomUUID(),
        businessId: DEMO_BUSINESS_ID,
        contactId,
        campaignId: useOrganic ? null : campaignIdByKey.get(profile.key)!,
        channel: useOrganic ? Channel.ORGANIC : pick(profile.channels),
        audienceOrigin: useOrganic ? AudienceOrigin.WARM : profile.origin,
        occurredAt: addDays(now, -Math.max(offset, 1)),
      });
    }

    for (let s = 0; s < purchases; s++) {
      const offset = saleOffsets[s];
      sales.push({
        id: randomUUID(),
        businessId: DEMO_BUSINESS_ID,
        contactId,
        amount: jitter(closer.avgTicket, 0.35),
        soldAt: addDays(now, -offset),
      });
    }
  }

  return { campaigns, contacts, touchpoints, sales };
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
