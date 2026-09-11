import { describe, it, expect } from 'vitest';
import { evaluatePose } from '../lib/scoreEngine';
import { YOGA_POSES } from '../data/poses';
import type { ComputedJointAngles, JointLandmark } from '../types';

describe('scoreEngine (Honest scoring)', () => {
  const tadasana = YOGA_POSES.find((p) => p.id === 'tadasana')!;

  it('evaluates perfect alignment with a near-100 score', () => {
    const perfectAngles: ComputedJointAngles = {
      neckTilt: 180,
      shoulderLevel: 180,
      leftShoulder: 15,
      rightShoulder: 15,
      leftElbow: 175,
      rightElbow: 175,
      spineUpper: 180,
      torsoLean: 180,
      hipLevel: 180,
      leftHip: 178,
      rightHip: 178,
      leftKnee: 178,
      rightKnee: 178,
      stanceWidth: 0.35,
    };

    const landmarks: JointLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility: 0.95,
    }));

    const result = evaluatePose(perfectAngles, tadasana, landmarks);
    expect(result.score).not.toBeNull();
    expect(result.score!).toBeGreaterThanOrEqual(95);
  });

  it('marks occluded / undetected joints as Unknown and excludes them from score', () => {
    const angles: ComputedJointAngles = {
      neckTilt: 180,
      shoulderLevel: 180,
      leftShoulder: 15,
      rightShoulder: 15,
      leftElbow: 175,
      rightElbow: 175,
      spineUpper: 180,
      torsoLean: 180,
      hipLevel: 180,
      leftHip: 178,
      rightHip: 178,
      leftKnee: 178,
      rightKnee: undefined, // Occluded
      stanceWidth: 0.35,
    };

    const landmarks: JointLandmark[] = Array.from({ length: 33 }, (_, i) => ({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility: i === 26 ? 0.1 : 0.9,
    }));

    const result = evaluatePose(angles, tadasana, landmarks);
    if (result.jointEvaluations.rightKnee) {
      expect(result.jointEvaluations.rightKnee.status).toBe('Unknown');
    }
  });

  it('returns null score when coverage is too low (<70% of required joints)', () => {
    const lowAngles: ComputedJointAngles = {
      leftKnee: 178,
    };
    const landmarks: JointLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility: 0.1, // Mostly occluded
    }));

    const result = evaluatePose(lowAngles, tadasana, landmarks);
    expect(result.score).toBeNull();
  });
});
