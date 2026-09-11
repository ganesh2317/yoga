/**
 * One-Euro Filter — adaptive low-pass filter for landmark smoothing.
 * Replaces fixed-alpha EMA (bug #7).
 *
 * Slow movement → heavy smoothing (reduces jitter)
 * Fast movement → low smoothing (reduces lag)
 *
 * Parameters:
 * - minCutoff (1.0): Lower = more smoothing at rest. Controls jitter.
 * - beta (0.007): Higher = less lag during fast movement. Controls speed adaptation.
 * - dCutoff (1.0): Cutoff for the derivative filter. Usually left at 1.0.
 */

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null || this.s === null) {
      this.y = value;
      this.s = value;
      return value;
    }
    this.s = alpha * value + (1 - alpha) * this.s;
    this.y = this.s;
    return this.y;
  }

  reset(): void {
    this.y = null;
    this.s = null;
  }

  hasLastValue(): boolean {
    return this.y !== null;
  }

  lastValue(): number {
    return this.y ?? 0;
  }
}

function computeAlpha(cutoff: number, dt: number): number {
  const tau = 1.0 / (2 * Math.PI * cutoff);
  return 1.0 / (1.0 + tau / dt);
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter = new LowPassFilter();
  private dxFilter: LowPassFilter = new LowPassFilter();
  private lastTime: number | null = null;

  /**
   * @param minCutoff — lower = smoother at rest (default 1.0)
   * @param beta — higher = more responsive to fast movement (default 0.007)
   * @param dCutoff — derivative cutoff (default 1.0)
   */
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  filter(value: number, timestamp: number): number {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = Math.max(0.001, (timestamp - this.lastTime) / 1000); // seconds
    this.lastTime = timestamp;

    // Estimate derivative
    const dx = this.xFilter.hasLastValue()
      ? (value - this.xFilter.lastValue()) / dt
      : 0;

    const edx = this.dxFilter.filter(dx, computeAlpha(this.dCutoff, dt));

    // Adaptive cutoff
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);

    return this.xFilter.filter(value, computeAlpha(cutoff, dt));
  }

  reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

/**
 * Per-landmark 3-axis filter bank.
 * Creates one OneEuroFilter per axis (x, y, z) per landmark.
 */
export class LandmarkFilterBank {
  private filters: { x: OneEuroFilter; y: OneEuroFilter; z: OneEuroFilter }[];

  constructor(count = 33, minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.filters = Array.from({ length: count }, () => ({
      x: new OneEuroFilter(minCutoff, beta, dCutoff),
      y: new OneEuroFilter(minCutoff, beta, dCutoff),
      z: new OneEuroFilter(minCutoff, beta, dCutoff),
    }));
  }

  filter<T extends { x: number; y: number; z: number; visibility?: number }>(
    landmarks: T[],
    timestamp: number
  ): T[] {
    return landmarks.map((lm, i) => {
      const f = this.filters[i];
      if (!f) return lm;
      return {
        ...lm,
        x: f.x.filter(lm.x, timestamp),
        y: f.y.filter(lm.y, timestamp),
        z: f.z.filter(lm.z, timestamp),
      };
    });
  }

  reset(): void {
    for (const f of this.filters) {
      f.x.reset();
      f.y.reset();
      f.z.reset();
    }
  }
}

export const OneEuroFilterBank = LandmarkFilterBank;
export type OneEuroFilterBank = LandmarkFilterBank;

