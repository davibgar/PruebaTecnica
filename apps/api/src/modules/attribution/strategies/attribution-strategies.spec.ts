import { ConfigService } from '@nestjs/config';
import { Sale } from '../../marketing/entities/sale.entity';
import { Touchpoint } from '../../marketing/entities/touchpoint.entity';
import { AttributionStrategy } from './attribution-strategy.interface';
import { LinearStrategy } from './linear.strategy';
import { PositionBasedStrategy } from './position-based.strategy';
import { TimeDecayStrategy } from './time-decay.strategy';

const SALE_DATE = new Date('2026-01-31T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function makeSale(amount: number): Sale {
  return { amount, soldAt: SALE_DATE } as Sale;
}

/** Path de `n` touchpoints, el más antiguo primero (orden ascendente por fecha). */
function makePath(n: number): Touchpoint[] {
  return Array.from(
    { length: n },
    (_, i) =>
      ({
        id: `tp-${i}`,
        occurredAt: new Date(SALE_DATE.getTime() - (n - i) * DAY_MS),
      }) as Touchpoint,
  );
}

const timeDecay = new TimeDecayStrategy({
  get: () => ({ halfLifeDays: 7 }),
} as unknown as ConfigService);

const strategies: AttributionStrategy[] = [
  new LinearStrategy(),
  timeDecay,
  new PositionBasedStrategy(),
];

const sumCredits = (path: Touchpoint[], sale: Sale, s: AttributionStrategy) =>
  s.assign(path, sale).reduce((acc, c) => acc + c.credit, 0);

describe('Atribución — invariante: Σ créditos == monto de la venta', () => {
  const amounts = [1, 100, 333, 999.99, 1000, 250000, 480500];
  const lengths = [1, 2, 3, 4, 5, 8];

  for (const strategy of strategies) {
    for (const n of lengths) {
      for (const amount of amounts) {
        it(`${strategy.model} | N=${n} | monto=${amount}`, () => {
          const credits = strategy.assign(makePath(n), makeSale(amount));
          expect(credits).toHaveLength(n);
          expect(
            sumCredits(makePath(n), makeSale(amount), strategy),
          ).toBeCloseTo(amount, 2);
        });
      }
    }
  }

  it('path vacío → sin créditos (la venta no es atribuible)', () => {
    for (const strategy of strategies) {
      expect(strategy.assign([], makeSale(1000))).toEqual([]);
    }
  });
});

describe('Modelo lineal', () => {
  it('reparte el monto por igual entre los touchpoints', () => {
    const credits = new LinearStrategy().assign(makePath(4), makeSale(1000));
    expect(credits.map((c) => c.credit)).toEqual([250, 250, 250, 250]);
  });
});

describe('Modelo position-based (U-shaped)', () => {
  const strategy = new PositionBasedStrategy();

  it('N=1 → 100% al único touchpoint', () => {
    expect(strategy.assign(makePath(1), makeSale(1000))[0].credit).toBe(1000);
  });

  it('N=2 → 50% / 50% (el 20% se reabsorbe)', () => {
    expect(
      strategy.assign(makePath(2), makeSale(1000)).map((c) => c.credit),
    ).toEqual([500, 500]);
  });

  it('N=3 → 40% primero, 20% intermedio, 40% último', () => {
    expect(
      strategy.assign(makePath(3), makeSale(1000)).map((c) => c.credit),
    ).toEqual([400, 200, 400]);
  });

  it('N=4 → 40% / 10% / 10% / 40%', () => {
    expect(
      strategy.assign(makePath(4), makeSale(1000)).map((c) => c.credit),
    ).toEqual([400, 100, 100, 400]);
  });
});

describe('Modelo time-decay', () => {
  it('da más crédito a los touchpoints más cercanos a la conversión', () => {
    const credits = timeDecay.assign(makePath(4), makeSale(1000));
    // El path está ordenado del más antiguo al más reciente.
    for (let i = 1; i < credits.length; i++) {
      expect(credits[i].credit).toBeGreaterThan(credits[i - 1].credit);
    }
  });
});
