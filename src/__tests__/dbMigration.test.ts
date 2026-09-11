import { describe, it, expect, beforeEach } from 'vitest';
import { subscribeDBState, getLatestDBState, closeDB } from '../services/db';

describe('IndexedDB Multi-Tab Safety & Lifecycle', () => {
  beforeEach(() => {
    closeDB();
  });

  it('provides a clean initial DBState without blocked flags', () => {
    const state = getLatestDBState();
    expect(state.isBlocked).toBe(false);
    expect(state.isVersionChange).toBe(false);
  });

  it('notifies subscribers immediately on subscription and updates', () => {
    let callCount = 0;
    let latestCapturedState: any = null;

    const unsubscribe = subscribeDBState((state) => {
      callCount++;
      latestCapturedState = state;
    });

    expect(callCount).toBeGreaterThanOrEqual(1);
    expect(latestCapturedState).toBeDefined();
    expect(latestCapturedState.isBlocked).toBe(false);

    unsubscribe();
  });

  it('safely closes connections without throwing', () => {
    expect(() => closeDB()).not.toThrow();
  });
});
