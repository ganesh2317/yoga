/**
 * Pose Geometry — all angle computation using world-space landmarks (§3.4).
 * World landmarks are metric, hip-centred, scale/distance/aspect-invariant.
 */

import type { ComputedJointAngles, JointLandmark } from '../types';
import { LM } from './poseTopology';

function isLandmarkVisible(p: JointLandmark | undefined, threshold = 0.6): boolean {
  if (!p) return false;
  if (p.visibility === undefined || p.visibility === null) return true;
  return p.visibility >= threshold;
}

/**
 * Calculates 3D interior angle at joint p2 formed by (p1 → p2 → p3) in degrees.
 * Returns undefined if any landmark is below visibility threshold.
 */
export function calculateJointAngle(
  p1: JointLandmark,
  p2: JointLandmark,
  p3: JointLandmark,
  minVisibility = 0.6
): number | undefined {
  if (
    !isLandmarkVisible(p1, minVisibility) ||
    !isLandmarkVisible(p2, minVisibility) ||
    !isLandmarkVisible(p3, minVisibility)
  ) {
    return undefined;
  }

  const ax = p1.x - p2.x;
  const ay = p1.y - p2.y;
  const az = (p1.z ?? 0) - (p2.z ?? 0);

  const bx = p3.x - p2.x;
  const by = p3.y - p2.y;
  const bz = (p3.z ?? 0) - (p2.z ?? 0);

  const dotProduct = ax * bx + ay * by + az * bz;
  const magA = Math.sqrt(ax * ax + ay * ay + az * az);
  const magB = Math.sqrt(bx * bx + by * by + bz * bz);

  if (magA * magB === 0) return 180;

  let cosTheta = dotProduct / (magA * magB);
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  const angleRad = Math.acos(cosTheta);
  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Calculates angle of a line relative to vertical (upward = 180°).
 */
function angleFromVertical(
  topX: number, topY: number,
  bottomX: number, bottomY: number
): number {
  const dx = topX - bottomX;
  const dy = topY - bottomY;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  return Math.round(Math.abs(angleDeg));
}

/**
 * Calculates horizontal level angle between two paired joints (180° = perfectly level).
 */
function calculateLevel(
  left: JointLandmark,
  right: JointLandmark,
  minVisibility = 0.6
): number | undefined {
  if (!isLandmarkVisible(left, minVisibility) || !isLandmarkVisible(right, minVisibility)) {
    return undefined;
  }
  const dy = left.y - right.y;
  const dx = left.x - right.x;
  const tiltRad = Math.atan2(Math.abs(dy), Math.abs(dx));
  const tiltDeg = (tiltRad * 180) / Math.PI;
  return Math.round(180 - tiltDeg);
}

/**
 * Full head-to-toe 20-measurement model (§3.8) from 33-point MediaPipe landmarks.
 */
export function computeAnglesFromLandmarks(landmarks: JointLandmark[]): ComputedJointAngles {
  if (!landmarks || landmarks.length < 33) {
    return {};
  }

  const nose = landmarks[LM.NOSE];
  const leftEar = landmarks[LM.LEFT_EAR];
  const rightEar = landmarks[LM.RIGHT_EAR];
  const leftShoulder = landmarks[LM.LEFT_SHOULDER];
  const rightShoulder = landmarks[LM.RIGHT_SHOULDER];
  const leftElbow = landmarks[LM.LEFT_ELBOW];
  const rightElbow = landmarks[LM.RIGHT_ELBOW];
  const leftWrist = landmarks[LM.LEFT_WRIST];
  const rightWrist = landmarks[LM.RIGHT_WRIST];
  const leftHip = landmarks[LM.LEFT_HIP];
  const rightHip = landmarks[LM.RIGHT_HIP];
  const leftKnee = landmarks[LM.LEFT_KNEE];
  const rightKnee = landmarks[LM.RIGHT_KNEE];
  const leftAnkle = landmarks[LM.LEFT_ANKLE];
  const rightAnkle = landmarks[LM.RIGHT_ANKLE];
  const leftFootIndex = landmarks[LM.LEFT_FOOT_INDEX];
  const rightFootIndex = landmarks[LM.RIGHT_FOOT_INDEX];

  // Midpoints for spinal axis
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  // Neck tilt
  let neckTilt: number | undefined;
  if (isLandmarkVisible(nose) && isLandmarkVisible(leftShoulder) && isLandmarkVisible(rightShoulder)) {
    neckTilt = angleFromVertical(nose.x, nose.y, midShoulderX, midShoulderY);
  }

  // Head yaw
  let headYaw: number | undefined;
  if (isLandmarkVisible(nose) && isLandmarkVisible(leftEar) && isLandmarkVisible(rightEar)) {
    const dLeft = Math.abs(nose.x - leftEar.x);
    const dRight = Math.abs(nose.x - rightEar.x);
    const total = dLeft + dRight;
    if (total > 0) {
      headYaw = Math.round((dLeft / total) * 180);
    }
  }

  // Shoulder level
  const shoulderLevel = calculateLevel(leftShoulder, rightShoulder);

  // Shoulder angles: hip → shoulder → elbow
  const leftShoulderAngle = calculateJointAngle(leftHip, leftShoulder, leftElbow);
  const rightShoulderAngle = calculateJointAngle(rightHip, rightShoulder, rightElbow);

  // Elbow angles: shoulder → elbow → wrist
  const leftElbowAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);

  // Wrist angles
  const leftWristAngle = leftElbowAngle;
  const rightWristAngle = rightElbowAngle;

  // Spine upper: mid-shoulder to mid-hip
  let spineUpper: number | undefined;
  if (
    isLandmarkVisible(leftShoulder) && isLandmarkVisible(rightShoulder) &&
    isLandmarkVisible(leftHip) && isLandmarkVisible(rightHip)
  ) {
    spineUpper = angleFromVertical(midShoulderX, midShoulderY, midHipX, midHipY);
  }

  // Spine lower: mid-hip to midpoint(ankles)
  const midAnkleX = (leftAnkle.x + rightAnkle.x) / 2;
  const midAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const spineLower = angleFromVertical(midHipX, midHipY, midAnkleX, midAnkleY);

  // Torso lean
  const torsoLean = spineUpper;

  // Hip level
  const hipLevel = calculateLevel(leftHip, rightHip);

  // Hip angles: shoulder → hip → knee
  const leftHipAngle = calculateJointAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculateJointAngle(rightShoulder, rightHip, rightKnee);

  // Knee angles: hip → knee → ankle
  const leftKneeAngle = calculateJointAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateJointAngle(rightHip, rightKnee, rightAnkle);

  // Ankle angles: knee → ankle → foot_index
  const leftAnkleAngle = calculateJointAngle(leftKnee, leftAnkle, leftFootIndex);
  const rightAnkleAngle = calculateJointAngle(rightKnee, rightAnkle, rightFootIndex);

  // Stance width: normalized ankle separation / shoulder width
  let stanceWidth: number | undefined;
  if (isLandmarkVisible(leftAnkle) && isLandmarkVisible(rightAnkle) &&
      isLandmarkVisible(leftShoulder) && isLandmarkVisible(rightShoulder)) {
    const ankleSpan = Math.sqrt(
      (leftAnkle.x - rightAnkle.x) ** 2 +
      (leftAnkle.z - rightAnkle.z) ** 2
    );
    const shoulderSpan = Math.sqrt(
      (leftShoulder.x - rightShoulder.x) ** 2 +
      (leftShoulder.z - rightShoulder.z) ** 2
    );
    if (shoulderSpan > 0.001) {
      stanceWidth = Math.round((ankleSpan / shoulderSpan) * 100);
    }
  }

  return {
    neckTilt,
    headYaw,
    shoulderLevel,
    leftShoulder: leftShoulderAngle,
    rightShoulder: rightShoulderAngle,
    leftElbow: leftElbowAngle,
    rightElbow: rightElbowAngle,
    leftWrist: leftWristAngle,
    rightWrist: rightWristAngle,
    spineUpper,
    spineLower,
    torsoLean,
    hipLevel,
    leftHip: leftHipAngle,
    rightHip: rightHipAngle,
    leftKnee: leftKneeAngle,
    rightKnee: rightKneeAngle,
    leftAnkle: leftAnkleAngle,
    rightAnkle: rightAnkleAngle,
    stanceWidth,
  };
}

export const computeWorldAngles = computeAnglesFromLandmarks;
export const computeImageAngles = computeAnglesFromLandmarks;
