/**
 * Score Engine — honest scoring with weighted joints and no fake values (§3.10).
 *
 * Rules:
 * - Occluded/undetected joints → status: 'Unknown', EXCLUDED from score
 * - Weighted overall: Σ(score × weight) / Σ(weight) over evaluated joints only
 * - Frames with jointsEvaluated/jointsRequired < 0.7 → score: null (UI shows "—")
 * - Side-agnostic evaluation for lateral poses (§3.8)
 */

import type {
  CategoryBreakdown,
  ComputedJointAngles,
  FrameEvaluation,
  IdealJointAngles,
  JointEvaluation,
  JointLandmark,
  JointStatus,
  MeasurementSpace,
  YogaPose,
} from '../types';

export const ACCURACY_CORRECT_THRESHOLD = 75;

const COVERAGE_FLOOR = 0.7;

/**
 * Evaluates a single joint against its target. Returns 'Unknown' for missing data.
 */
export function evaluateSingleJoint(
  jointKey: string,
  displayName: string,
  actualAngle: number | undefined,
  targetAngle: number,
  tolerance: number,
  weight: number
): JointEvaluation {
  if (actualAngle === undefined || Number.isNaN(actualAngle)) {
    return {
      jointKey,
      displayName,
      actualAngle: 0,
      targetAngle,
      tolerance,
      deviation: 0,
      score: 0,
      status: 'Unknown',
      weight,
    };
  }

  const deviation = Math.abs(actualAngle - targetAngle);
  let score = 100;

  if (deviation > tolerance) {
    const excessDeviation = deviation - tolerance;
    score = Math.max(0, 100 - excessDeviation * 2.5);
  }

  let status: JointStatus = 'Good';
  if (score < 65) {
    status = 'Poor';
  } else if (score < 85) {
    status = 'Slight';
  }

  return {
    jointKey,
    displayName,
    actualAngle,
    targetAngle,
    tolerance,
    deviation: Math.round(deviation),
    score: Math.round(score),
    status,
    weight,
  };
}

/**
 * Swaps left/right keys in a joint angle set for side-agnostic evaluation.
 */
function mirrorAngles(angles: ComputedJointAngles): ComputedJointAngles {
  const mirrored: ComputedJointAngles = { ...angles };

  const swapPairs = [
    ['leftKnee', 'rightKnee'],
    ['leftElbow', 'rightElbow'],
    ['leftShoulder', 'rightShoulder'],
    ['leftHip', 'rightHip'],
    ['leftWrist', 'rightWrist'],
    ['leftAnkle', 'rightAnkle'],
  ];

  for (const [l, r] of swapPairs) {
    mirrored[l] = angles[r];
    mirrored[r] = angles[l];
  }

  return mirrored;
}

/**
 * Computes evaluation for a given angles/targets pair.
 */
function evaluateAnglesAgainstTargets(
  computedAngles: ComputedJointAngles,
  ideal: IdealJointAngles
): {
  jointEvals: Record<string, JointEvaluation>;
  totalWeightedScore: number;
  totalWeight: number;
  evaluatedCount: number;
  requiredCount: number;
} {
  const jointEvals: Record<string, JointEvaluation> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let evaluatedCount = 0;
  let requiredCount = 0;

  for (const key of Object.keys(ideal)) {
    const target = ideal[key];
    if (!target) continue;
    requiredCount++;

    const actual = computedAngles[key];
    const evalResult = evaluateSingleJoint(
      key,
      target.name,
      actual,
      target.targetAngle,
      target.tolerance,
      target.weight
    );
    jointEvals[key] = evalResult;

    if (evalResult.status !== 'Unknown') {
      totalWeightedScore += evalResult.score * evalResult.weight;
      totalWeight += evalResult.weight;
      evaluatedCount++;
    }
  }

  return { jointEvals, totalWeightedScore, totalWeight, evaluatedCount, requiredCount };
}

/**
 * Evaluates a pose frame with weighted scoring and side-agnostic evaluation.
 */
export function evaluatePoseFrame(
  computedAngles: ComputedJointAngles,
  pose: YogaPose,
  _rawLandmarks?: JointLandmark[] | null,
  measurementSpace: MeasurementSpace = 'world'
): FrameEvaluation {
  const ideal = pose.idealJointAngles;

  // Direct evaluation
  let result = evaluateAnglesAgainstTargets(computedAngles, ideal);
  let detectedSide: 'left' | 'right' | 'center' | null = 'center';

  // Side-agnostic: for lateral poses, try mirrored and keep the better score
  if (pose.symmetry === 'lateral') {
    const mirroredAngles = mirrorAngles(computedAngles);
    const mirroredResult = evaluateAnglesAgainstTargets(mirroredAngles, ideal);

    const directScore =
      result.totalWeight > 0 ? result.totalWeightedScore / result.totalWeight : 0;
    const mirroredScore =
      mirroredResult.totalWeight > 0
        ? mirroredResult.totalWeightedScore / mirroredResult.totalWeight
        : 0;

    if (mirroredScore > directScore) {
      result = mirroredResult;
      detectedSide = 'right'; // mirrored means they're on the opposite side
    } else {
      detectedSide = 'left';
    }
  }

  const { jointEvals, totalWeightedScore, totalWeight, evaluatedCount, requiredCount } = result;

  // Coverage check
  const coverage = requiredCount > 0 ? evaluatedCount / requiredCount : 0;
  const overall = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : null;

  // If coverage is below floor, score is null
  const finalScore = coverage >= COVERAGE_FLOOR ? overall : null;

  // Confidence = coverage percentage
  const confidence = Math.round(coverage * 100);

  // Category breakdown
  const getSubScore = (keys: string[]): number => {
    const validScores = keys
      .map((k) => jointEvals[k])
      .filter((e): e is JointEvaluation => e !== undefined && e.status !== 'Unknown');
    if (validScores.length === 0) return finalScore ?? 0;
    const sum = validScores.reduce((a, b) => a + b.score * b.weight, 0);
    const wSum = validScores.reduce((a, b) => a + b.weight, 0);
    return wSum > 0 ? Math.round(sum / wSum) : 0;
  };

  const categoryBreakdown: CategoryBreakdown = {
    overall: finalScore ?? 0,
    shoulder: getSubScore(['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow']),
    hip: getSubScore(['leftHip', 'rightHip']),
    knee: getSubScore(['leftKnee', 'rightKnee']),
    torso: getSubScore(['spineUpper', 'spineLower', 'torsoLean', 'neckTilt']),
    balance: Math.round(
      (getSubScore(['leftKnee', 'rightKnee']) + getSubScore(['leftHip', 'rightHip'])) / 2
    ),
  };

  return {
    score: finalScore,
    jointEvaluations: jointEvals,
    categoryBreakdown,
    timestamp: Date.now(),
    confidence,
    jointsEvaluated: evaluatedCount,
    jointsRequired: requiredCount,
    measurementSpace,
    detectedSide,
  };
}

export const evaluatePose = evaluatePoseFrame;
