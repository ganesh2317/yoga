import { describe, it, expect } from 'vitest';
import { YOGA_POSES } from '../data/poses';
import { YOGA_FLOWS } from '../data/flows';
import { JOURNEY_LEVELS } from '../data/journey';
import { POSE_ANIMATIONS } from '../data/poseAnimations';

describe('Data Integrity Assertions', () => {
  const poseIds = new Set(YOGA_POSES.map((p) => p.id));

  it('contains exactly 21 poses', () => {
    expect(YOGA_POSES.length).toBe(21);
  });

  it('includes virabhadrasana2 (Bug #1 Fix)', () => {
    expect(poseIds.has('virabhadrasana2')).toBe(true);
    const v2 = YOGA_POSES.find((p) => p.id === 'virabhadrasana2');
    expect(v2?.name).toBe('Warrior II');
  });

  it('every pose referenced in YOGA_FLOWS resolves to a real pose in YOGA_POSES', () => {
    for (const flow of YOGA_FLOWS) {
      for (const item of flow.poses) {
        expect(poseIds.has(item.poseId), `Flow "${flow.id}" references unknown pose "${item.poseId}"`).toBe(true);
      }
    }
  });

  it('every pose referenced in JOURNEY_LEVELS resolves to a real pose in YOGA_POSES', () => {
    for (const lvl of JOURNEY_LEVELS) {
      for (const pid of lvl.targetPoseIds) {
        expect(poseIds.has(pid), `Level ${lvl.level} references unknown pose "${pid}"`).toBe(true);
      }
    }
  });

  it('all 21 poses have authored animation keyframe data (>=4 keyframes each)', () => {
    for (const pose of YOGA_POSES) {
      const anim = POSE_ANIMATIONS[pose.id];
      expect(anim, `Missing animation for pose ${pose.id}`).toBeDefined();
      expect(anim.keyframes.length, `Pose ${pose.id} must have at least 4 keyframes`).toBeGreaterThanOrEqual(4);
    }
  });
});
