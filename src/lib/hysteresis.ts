/**
 * Hysteresis — prevents joint status flicker (§3.9).
 * A joint's displayed status only flips after 5 consecutive frames
 * (~150ms at 30fps) in the new band. Internal scoring stays instantaneous.
 */

import type { JointStatus } from '../types';

const FRAMES_REQUIRED = 5;

interface JointHysteresisState {
  displayedStatus: JointStatus;
  pendingStatus: JointStatus;
  consecutiveFrames: number;
}

export class HysteresisManager {
  private states: Map<string, JointHysteresisState> = new Map();

  /**
   * Updates a joint's displayed status based on the raw instantaneous status.
   * Returns the stabilized status for display.
   */
  public update(jointKey: string, rawStatus: JointStatus): JointStatus {
    let state = this.states.get(jointKey);

    if (!state) {
      state = {
        displayedStatus: rawStatus,
        pendingStatus: rawStatus,
        consecutiveFrames: 1,
      };
      this.states.set(jointKey, state);
      return rawStatus;
    }

    if (rawStatus === state.displayedStatus) {
      // Status matches display — reset pending
      state.pendingStatus = rawStatus;
      state.consecutiveFrames = 0;
      return state.displayedStatus;
    }

    if (rawStatus === state.pendingStatus) {
      // Accumulating consecutive frames in new status
      state.consecutiveFrames++;

      if (state.consecutiveFrames >= FRAMES_REQUIRED) {
        // Flip
        state.displayedStatus = rawStatus;
        state.pendingStatus = rawStatus;
        state.consecutiveFrames = 0;
      }
    } else {
      // Different pending status — reset counter
      state.pendingStatus = rawStatus;
      state.consecutiveFrames = 1;
    }

    return state.displayedStatus;
  }

  /**
   * Gets the current displayed status for a joint.
   */
  public getDisplayedStatus(jointKey: string): JointStatus {
    return this.states.get(jointKey)?.displayedStatus ?? 'Unknown';
  }

  public reset(): void {
    this.states.clear();
  }
}

export class JointHysteresisTracker {
  private manager = new HysteresisManager();

  public update(statuses: Record<string, JointStatus>): Record<string, JointStatus> {
    const result: Record<string, JointStatus> = {};
    for (const [k, v] of Object.entries(statuses)) {
      result[k] = this.manager.update(k, v);
    }
    return result;
  }

  public reset(): void {
    this.manager.reset();
  }
}
