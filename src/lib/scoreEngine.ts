import type {
  CategoryBreakdown,
  ComputedJointAngles,
  FrameEvaluation,
  IdealJointAngles,
  JointEvaluation,
  JointStatus,
  YogaPose,
} from '../types';

/**
 * Computes individual joint score (0 - 100) and status based on deviation from target angle.
 */
export function evaluateSingleJoint(
  jointKey: string,
  displayName: string,
  actualAngle: number | undefined,
  targetAngle: number,
  tolerance: number
): JointEvaluation {
  if (actualAngle === undefined || Number.isNaN(actualAngle)) {
    return {
      jointKey,
      displayName,
      actualAngle: 0,
      targetAngle,
      tolerance,
      deviation: 0,
      score: 85, // Neutral score for occluded/non-visible joint
      status: 'Good',
    };
  }

  const deviation = Math.abs(actualAngle - targetAngle);
  let score = 100;

  if (deviation > tolerance) {
    const excessDeviation = deviation - tolerance;
    // Decay score by 2.5 points per degree outside tolerance
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
  };
}

/**
 * Evaluates current frame joint angles against reference target pose.
 * Only includes visible joints in overall score calculation to prevent occlusion distortion.
 */
export function evaluatePoseFrame(
  computedAngles: ComputedJointAngles,
  pose: YogaPose
): FrameEvaluation {
  const jointEvaluations: Record<string, JointEvaluation> = {};
  const ideal = pose.idealJointAngles;

  let totalScore = 0;
  let evaluatedCount = 0;

  const jointKeys: (keyof IdealJointAngles)[] = [
    'leftKnee',
    'rightKnee',
    'leftElbow',
    'rightElbow',
    'leftShoulder',
    'rightShoulder',
    'leftHip',
    'rightHip',
    'spineTilt',
  ];

  jointKeys.forEach((key) => {
    const targetConfig = ideal[key];
    if (targetConfig) {
      const actual = computedAngles[key];
      const evalResult = evaluateSingleJoint(
        key,
        targetConfig.name,
        actual,
        targetConfig.targetAngle,
        targetConfig.tolerance
      );
      jointEvaluations[key] = evalResult;

      // Only factor in joints that were reliably detected & visible
      if (actual !== undefined && !Number.isNaN(actual)) {
        totalScore += evalResult.score;
        evaluatedCount++;
      }
    }
  });

  const overall = evaluatedCount > 0 ? Math.round(totalScore / evaluatedCount) : 85;

  // Category breakdown roll-up
  const getSubScore = (keys: string[]): number => {
    const validScores = keys
      .map((k) => jointEvaluations[k]?.score)
      .filter((s): s is number => s !== undefined);
    if (validScores.length === 0) return overall;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  };

  const categoryBreakdown: CategoryBreakdown = {
    overall,
    shoulder: getSubScore(['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow']),
    hip: getSubScore(['leftHip', 'rightHip']),
    knee: getSubScore(['leftKnee', 'rightKnee']),
    torso: getSubScore(['spineTilt', 'leftElbow', 'rightElbow']),
    balance: Math.round(
      (getSubScore(['leftKnee', 'rightKnee']) + getSubScore(['leftHip', 'rightHip'])) / 2
    ),
  };

  return {
    score: overall,
    jointEvaluations,
    categoryBreakdown,
    timestamp: Date.now(),
  };
}
