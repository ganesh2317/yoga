import { describe, it, expect } from 'vitest';
import { OneEuroFilter, OneEuroFilterBank } from '../lib/oneEuroFilter';

describe('OneEuroFilter', () => {
  it('filters jitter from static signal with low cutoff', () => {
    const filter = new OneEuroFilter(1.0, 0.007, 1.0);
    const t0 = 0;
    const initial = filter.filter(100, t0);
    expect(initial).toBe(100);

    // Small jitter oscillation around 100 at 30fps (~33ms)
    let smoothed = initial;
    for (let i = 1; i <= 10; i++) {
      const noisyVal = 100 + (i % 2 === 0 ? 2 : -2);
      smoothed = filter.filter(noisyVal, i * 33);
    }

    // Smoothed value should stay tightly around 100 without overreacting
    expect(Math.abs(smoothed - 100)).toBeLessThan(1.5);
  });

  it('adapts quickly to rapid movement / step change', () => {
    const filter = new OneEuroFilter(1.0, 0.007, 1.0);
    filter.filter(0, 0);
    filter.filter(0, 33);

    // Sudden rapid change to 100
    const step1 = filter.filter(100, 66);
    expect(step1).toBeGreaterThan(30); // Fast initial response
  });

  it('OneEuroFilterBank filters 33 landmarks correctly', () => {
    const bank = new OneEuroFilterBank(33);
    const rawLandmarks = Array.from({ length: 33 }, (_, i) => ({
      x: 0.5,
      y: 0.2 + (i / 33) * 0.7,
      z: 0.0,
      visibility: 0.9,
    }));

    const result = bank.filter(rawLandmarks as any, 0);
    expect(result.length).toBe(33);
    expect(result[0].x).toBeCloseTo(0.5);
    expect(result[0].visibility).toBe(0.9);
  });
});
