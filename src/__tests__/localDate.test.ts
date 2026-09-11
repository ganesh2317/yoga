import { describe, it, expect } from 'vitest';
import { localDateKey } from '../lib/localDate';

describe('localDateKey', () => {
  it('formats local dates consistently as YYYY-MM-DD', () => {
    const d = new Date(2026, 8, 11, 16, 30); // Sep 11, 2026 local
    expect(localDateKey(d)).toBe('2026-09-11');
  });

  it('pads single digit month and day with zeros', () => {
    const d = new Date(2026, 0, 5, 10, 0); // Jan 5, 2026
    expect(localDateKey(d)).toBe('2026-01-05');
  });

  it('defaults to current local date when called without arguments', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(localDateKey()).toBe(expected);
  });
});
