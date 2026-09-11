import { describe, it, expect } from 'vitest';
import { toDisplayX, toAnatomicalX, displaySideLabel } from '../lib/mirror';

describe('mirror module', () => {
  it('toDisplayX flips horizontal coordinates accurately', () => {
    expect(toDisplayX(0.2)).toBeCloseTo(0.8);
    expect(toDisplayX(0.5)).toBeCloseTo(0.5);
    expect(toDisplayX(0.0)).toBeCloseTo(1.0);
  });

  it('toAnatomicalX is symmetrical with toDisplayX', () => {
    const original = 0.35;
    const displayed = toDisplayX(original);
    expect(toAnatomicalX(displayed)).toBeCloseTo(original);
  });

  it('displaySideLabel correctly mirrors anatomical labels for mirrored UI', () => {
    expect(displaySideLabel('left', true)).toBe('right');
    expect(displaySideLabel('right', true)).toBe('left');
    expect(displaySideLabel('center', true)).toBe('center');
  });

  it('displaySideLabel preserves anatomical labels when unmirrored', () => {
    expect(displaySideLabel('left', false)).toBe('left');
    expect(displaySideLabel('right', false)).toBe('right');
  });
});
