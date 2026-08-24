import type { ComputedJointAngles, JointLandmark } from '../types';

/**
 * Calculates 3D/2D interior angle at joint p2 formed by (p1 -> p2 -> p3) in degrees.
 */
export function calculateJointAngle(
  p1: JointLandmark,
  p2: JointLandmark,
  p3: JointLandmark
): number {
  if (!p1 || !p2 || !p3) return 180;

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
  // Clamp cosTheta to [-1, 1] to prevent NaN due to floating point precision
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  const angleRad = Math.acos(cosTheta);
  return Math.round((angleRad * 180) / Math.PI);
}

/**
 * Calculates spine tilt angle relative to pure vertical axis.
 * 180 degrees = perfectly upright / straight spine.
 */
export function calculateSpineTilt(
  leftShoulder: JointLandmark,
  rightShoulder: JointLandmark,
  leftHip: JointLandmark,
  rightHip: JointLandmark
): number {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 180;

  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  // Spine vector from hip up to shoulder
  const dx = midShoulderX - midHipX;
  const dy = midShoulderY - midHipY; // in canvas Y points downward

  // Angle with negative Y axis (straight up = -1 in canvas space)
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return 180;

  const cosTheta = (-dy) / len; // -dy because Y increases downwards
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const tiltFromUpright = (Math.acos(clampedCos) * 180) / Math.PI;

  return Math.round(180 - tiltFromUpright);
}

/**
 * Extracts key joint angles from standard MediaPipe 33-point pose landmark array.
 */
export function computeAnglesFromLandmarks(landmarks: JointLandmark[]): ComputedJointAngles {
  if (!landmarks || landmarks.length < 29) {
    return {};
  }

  // MediaPipe Landmark Index Mapping:
  // 11: left_shoulder, 12: right_shoulder
  // 13: left_elbow, 14: right_elbow
  // 15: left_wrist, 16: right_wrist
  // 23: left_hip, 24: right_hip
  // 25: left_knee, 26: right_knee
  // 27: left_ankle, 28: right_ankle

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
    leftKnee: calculateJointAngle(leftHip, leftKnee, leftAnkle),
    rightKnee: calculateJointAngle(rightHip, rightKnee, rightAnkle),
    leftElbow: calculateJointAngle(leftShoulder, leftElbow, leftWrist),
    rightElbow: calculateJointAngle(rightShoulder, rightElbow, rightWrist),
    leftShoulder: calculateJointAngle(leftHip, leftShoulder, leftElbow),
    rightShoulder: calculateJointAngle(rightHip, rightShoulder, rightElbow),
    leftHip: calculateJointAngle(leftShoulder, leftHip, leftKnee),
    rightHip: calculateJointAngle(rightShoulder, rightHip, rightKnee),
    spineTilt: calculateSpineTilt(leftShoulder, rightShoulder, leftHip, rightHip),
  };
}
