import type { ComputedJointAngles, JointLandmark } from '../types';

/**
 * Checks if landmark is visible with at least 0.6 confidence.
 */

function isLandmarkVisible(p?: JointLandmark, threshold = 0.6): boolean {
  if (!p) return false;
  if (p.visibility === undefined || p.visibility === null) return true;
  return p.visibility >= threshold;
}

/**
 * Calculates 3D/2D interior angle at joint p2 formed by (p1 -> p2 -> p3) in degrees.
 * Returns undefined if any required landmark falls below visibility threshold.
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

  // Vector A = p1 - p2
  const ax = p1.x - p2.x;
  const ay = p1.y - p2.y;
  const az = (p1.z || 0) - (p2.z || 0);

  // Vector B = p3 - p2
  const bx = p3.x - p2.x;
  const by = p3.y - p2.y;
  const bz = (p3.z || 0) - (p2.z || 0);

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
 * Calculates spine tilt angle relative to pure vertical axis.
 * Returns undefined if shoulder or hip landmarks fall below visibility threshold.
 */
export function calculateSpineTilt(
  leftShoulder: JointLandmark,
  rightShoulder: JointLandmark,
  leftHip: JointLandmark,
  rightHip: JointLandmark,
  minVisibility = 0.6
): number | undefined {
  if (
    !isLandmarkVisible(leftShoulder, minVisibility) ||
    !isLandmarkVisible(rightShoulder, minVisibility) ||
    !isLandmarkVisible(leftHip, minVisibility) ||
    !isLandmarkVisible(rightHip, minVisibility)
  ) {
    return undefined;
  }

  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midShoulderY - midHipY;

  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return 180;

  const cosTheta = -dy / len;
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const tiltFromUpright = (Math.acos(clampedCos) * 180) / Math.PI;

  return Math.round(180 - tiltFromUpright);
}

/**
 * Extracts key joint angles from standard MediaPipe 33-point pose landmark array.
 * Applies per-landmark visibility gating (min 0.6 threshold).
 */
export function computeAnglesFromLandmarks(landmarks: JointLandmark[]): ComputedJointAngles {
  if (!landmarks || landmarks.length < 29) {
    return {};
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  return {
    leftKnee: calculateJointAngle(leftHip, leftKnee, leftAnkle, 0.6),
    rightKnee: calculateJointAngle(rightHip, rightKnee, rightAnkle, 0.6),
    leftElbow: calculateJointAngle(leftShoulder, leftElbow, leftWrist, 0.6),
    rightElbow: calculateJointAngle(rightShoulder, rightElbow, rightWrist, 0.6),
    leftShoulder: calculateJointAngle(leftHip, leftShoulder, leftElbow, 0.6),
    rightShoulder: calculateJointAngle(rightHip, rightShoulder, rightElbow, 0.6),
    leftHip: calculateJointAngle(leftShoulder, leftHip, leftKnee, 0.6),
    rightHip: calculateJointAngle(rightShoulder, rightHip, rightKnee, 0.6),
    spineTilt: calculateSpineTilt(leftShoulder, rightShoulder, leftHip, rightHip, 0.6),
  };
}
