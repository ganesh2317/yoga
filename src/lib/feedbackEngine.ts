import type { JointEvaluation, YogaPose } from '../types';

export const JOINT_FEEDBACK_TEMPLATES: Record<
  string,
  { slight: string[]; poor: string[]; good: string }
> = {
  neckTilt: {
    good: 'Neck is neutral and well aligned with spine.',
    slight: [
      'Gently bring your head back to neutral center.',
      'Lengthen the back of your neck.',
    ],
    poor: [
      'Avoid tilting or straining your neck sideways.',
      'Keep your gaze steady and neck in line with your spine.',
    ],
  },
  headYaw: {
    good: 'Head turn is balanced with the pose.',
    slight: [
      'Turn your head gently in the direction of the gaze cue.',
      'Ease your neck rotation slightly toward center.',
    ],
    poor: [
      'Align your head rotation with your chest and gaze point.',
      'Do not force the neck turn — keep it comfortable.',
    ],
  },
  shoulderLevel: {
    good: 'Shoulders are level and balanced.',
    slight: [
      'Level your shoulders — avoid hiking one shoulder up.',
      'Drop your shoulders evenly away from your ears.',
    ],
    poor: [
      'Keep both shoulders squared and evenly balanced.',
      'Release upper-body tension and level your collarbones.',
    ],
  },
  leftShoulder: {
    good: 'Great! Your left shoulder is relaxed and open.',
    slight: [
      'Drop your left shoulder away from your ear to relieve neck tension.',
      'Extend outward through your left fingertips.',
    ],
    poor: [
      'Open your chest and roll your left shoulder back.',
      'Keep both shoulders level and relaxed.',
    ],
  },
  rightShoulder: {
    good: 'Right shoulder posture is strong and aligned.',
    slight: [
      'Draw your right shoulder blade back toward your spine.',
      'Ease tension in your upper right back.',
    ],
    poor: [
      'Relax your right shoulder downward away from your ear.',
      'Extend fully through your right arm.',
    ],
  },
  leftElbow: {
    good: 'Left arm extension is clean and steady.',
    slight: [
      'Straighten your left arm slightly more for full extension.',
      'Soften left elbow to maintain smooth arm energy.',
    ],
    poor: [
      'Extend your left arm straight from shoulder to wrist.',
      'Align left arm to maintain symmetry.',
    ],
  },
  rightElbow: {
    good: 'Right arm position is ideal.',
    slight: [
      'Extend outward evenly through your right arm.',
      'Keep your right elbow gently engaged, not locked.',
    ],
    poor: [
      'Fully reach through your right arm to match the posture.',
      'Maintain strong alignment from right shoulder to fingertips.',
    ],
  },
  leftWrist: {
    good: 'Left wrist alignment is neutral.',
    slight: [
      'Keep left wrist in line with your forearm.',
      'Avoid excessive flexing in your left wrist.',
    ],
    poor: [
      'Flatten and stabilize your left wrist.',
      'Distribute weight evenly across the palm and fingers.',
    ],
  },
  rightWrist: {
    good: 'Right wrist alignment is neutral.',
    slight: [
      'Keep right wrist aligned with forearm.',
      'Relax over-flexing in the right wrist.',
    ],
    poor: [
      'Stabilize your right wrist in line with your arm.',
      'Ground down through your palm and fingers.',
    ],
  },
  spineUpper: {
    good: 'Upper spine is extended and tall.',
    slight: [
      'Lift gently through the sternum to lengthen upper spine.',
      'Broaden across your collarbones.',
    ],
    poor: [
      'Avoid hunching or rounding through the upper back.',
      'Open your chest and lengthen through your crown.',
    ],
  },
  spineLower: {
    good: 'Lower back is long and supported by core.',
    slight: [
      'Engage your lower abdomen to support your lumbar spine.',
      'Lengthen your tailbone toward the ground.',
    ],
    poor: [
      'Avoid excessive arching or collapsing in the lower back.',
      'Draw navel in toward spine to stabilize the posture.',
    ],
  },
  torsoLean: {
    good: 'Torso lean angle is spot on.',
    slight: [
      'Adjust your torso angle slightly to match the pose incline.',
      'Stack your ribs over your pelvis.',
    ],
    poor: [
      'Bring your torso to the intended angle without slouching.',
      'Engage your core to maintain strong torso alignment.',
    ],
  },
  hipLevel: {
    good: 'Hips are level and squared.',
    slight: [
      'Square your hips evenly toward the front.',
      'Drop your higher hip down to maintain a level pelvis.',
    ],
    poor: [
      'Keep your pelvis level and balanced on both sides.',
      'Avoid twisting or collapsing into one hip.',
    ],
  },
  leftHip: {
    good: 'Left hip angle is well positioned.',
    slight: [
      'Adjust your left hip hinge to deepen or ease the fold.',
      'Keep the left hip open and grounded.',
    ],
    poor: [
      'Hinge deeply from your left hip crease.',
      'Stabilize and engage your left hip muscles.',
    ],
  },
  rightHip: {
    good: 'Right hip angle is well positioned.',
    slight: [
      'Adjust your right hip hinge for balanced alignment.',
      'Keep your right hip active and steady.',
    ],
    poor: [
      'Hinge cleanly from your right hip crease.',
      'Support the posture with active right hip engagement.',
    ],
  },
  leftKnee: {
    good: 'Great! Your left leg alignment is stable and well-supported.',
    slight: [
      'Left knee is slightly off target — track it with your foot.',
      'Softly micro-bend your left knee to avoid hyperextension.',
    ],
    poor: [
      'Keep your left knee aligned over your ankle and engage your thigh.',
      'Straighten or bend your left leg to match target angle.',
    ],
  },
  rightKnee: {
    good: 'Excellent right knee position and grounding.',
    slight: [
      'Right knee is slightly off angle — align with your toes.',
      'Keep your weight balanced through your right foot arch.',
    ],
    poor: [
      'Align your right knee directly over your ankle.',
      'Adjust your right knee bend to match the target depth.',
    ],
  },
  leftAnkle: {
    good: 'Left ankle is solid and stable.',
    slight: [
      'Distribute weight evenly through all four corners of left foot.',
      'Keep left ankle from rolling inward or outward.',
    ],
    poor: [
      'Press firmly into your left foot and stabilize the ankle.',
      'Root your left heel and big toe knuckle down.',
    ],
  },
  rightAnkle: {
    good: 'Right ankle is solid and stable.',
    slight: [
      'Balance weight evenly across your right foot.',
      'Avoid rolling onto the inner or outer edge of right ankle.',
    ],
    poor: [
      'Ground firmly through your right foot and ankle.',
      'Firm your ankle to create a solid foundation.',
    ],
  },
  stanceWidth: {
    good: 'Stance width is optimal for this posture.',
    slight: [
      'Widen or narrow your feet slightly for better base.',
      'Adjust your stance for maximum stability.',
    ],
    poor: [
      'Set your feet to the recommended stance width.',
      'Step your feet to a stable foundation width.',
    ],
  },
};

/**
 * Generates prioritized corrective tips based on joint evaluations.
 */
export function generateFeedbackTips(
  jointEvaluations: Record<string, JointEvaluation>,
  pose?: YogaPose
): string[] {
  const poorJoints = Object.values(jointEvaluations).filter((j) => j.status === 'Poor');
  const slightJoints = Object.values(jointEvaluations).filter((j) => j.status === 'Slight');

  const tips: string[] = [];

  // Sort by weighted deviation (higher priority first)
  poorJoints.sort((a, b) => b.weight * b.deviation - a.weight * a.deviation);
  slightJoints.sort((a, b) => b.weight * b.deviation - a.weight * a.deviation);

  for (const j of poorJoints) {
    const template = JOINT_FEEDBACK_TEMPLATES[j.jointKey];
    if (template && template.poor.length > 0) {
      tips.push(template.poor[0]);
    } else {
      tips.push(`Adjust ${j.displayName} — target is ${j.targetAngle}°, currently at ${j.actualAngle}°.`);
    }
    if (tips.length >= 3) break;
  }

  if (tips.length < 3) {
    for (const j of slightJoints) {
      const template = JOINT_FEEDBACK_TEMPLATES[j.jointKey];
      if (template && template.slight.length > 0) {
        tips.push(template.slight[0]);
      } else {
        tips.push(`Fine-tune ${j.displayName} to get closer to ${j.targetAngle}°.`);
      }
      if (tips.length >= 3) break;
    }
  }

  // If everything is Good, add posture cues from pose definition or default celebration
  if (tips.length === 0) {
    if (pose?.alignmentCues && pose.alignmentCues.length > 0) {
      tips.push(pose.alignmentCues[0]);
    } else {
      tips.push('Outstanding alignment! Keep breathing smoothly and hold the posture.');
    }
  }

  return tips;
}
