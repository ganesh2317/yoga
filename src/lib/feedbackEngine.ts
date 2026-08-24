import type { JointEvaluation, YogaPose } from '../types';

const JOINT_FEEDBACK_TEMPLATES: Record<string, { slight: string[]; poor: string[]; good: string }> = {
  leftKnee: {
    good: 'Great! Your left leg alignment is stable and well-supported.',
    slight: [
      'Left knee is slightly tilted outward — try to keep your left knee aligned with your foot.',
      'Softly micro-bend your left knee to avoid hyperextension.',
    ],
    poor: [
      'Keep your left knee aligned over your ankle and engage your thigh muscles.',
      'Straighten your left leg gently without locking your joint.',
    ],
  },
  rightKnee: {
    good: 'Excellent right knee position and grounding.',
    slight: [
      'Right knee is slightly out of plane — bring your knee in line with your middle toe.',
      'Keep your weight balanced through your right foot arch.',
    ],
    poor: [
      'Align your right knee directly over your foot to protect the joint.',
      'Adjust your right knee bend to match the target pose depth.',
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
      'Extend fully through your right elbow.',
      'Keep your right forearm engaged.',
    ],
    poor: [
      'Straighten your right elbow to lock in balance.',
      'Reach outward through right fingertips.',
    ],
  },
  leftHip: {
    good: 'Left hip position is centered and balanced.',
    slight: [
      'Square your left hip forward slightly.',
      'Keep your hips level across your pelvic basin.',
    ],
    poor: [
      'Rotate your left hip back into alignment with your torso.',
      'Engage your left glute to anchor the pelvic structure.',
    ],
  },
  rightHip: {
    good: 'Right hip alignment is solid.',
    slight: [
      'Draw your right hip gently inward.',
      'Level your hips to support your lower back.',
    ],
    poor: [
      'Press firmly into your foundation to align your right hip.',
      'Keep hips parallel with your mat edge.',
    ],
  },
  spineTilt: {
    good: 'Spine line is beautifully extended and centered.',
    slight: [
      'Lengthen your spine upward from the crown of your head.',
      'Keep your back straight and chest open.',
    ],
    poor: [
      'Lift your chest and lengthen your lumbar spine.',
      'Engage your abdominal core to stabilize your spinal column.',
    ],
  },
};

/**
 * Generates plain-English corrective feedback tips from evaluated joint states.
 */
export function generatePersonalizedFeedback(
  jointEvaluations: Record<string, JointEvaluation>,
  pose: YogaPose
): string[] {
  const tips: string[] = [];
  const evals = Object.values(jointEvaluations);

  const goodJoints = evals.filter((e) => e.status === 'Good');
  const slightJoints = evals.filter((e) => e.status === 'Slight');
  const poorJoints = evals.filter((e) => e.status === 'Poor');

  // Positive reinforcement first
  if (goodJoints.length > 0) {
    const randomGood = goodJoints[Math.floor(Math.random() * goodJoints.length)];
    const template = JOINT_FEEDBACK_TEMPLATES[randomGood.jointKey];
    if (template) {
      tips.push(template.good);
    } else {
      tips.push(`Great! Your ${randomGood.displayName.toLowerCase()} alignment is spot on.`);
    }
  } else {
    tips.push(`Nice effort on ${pose.name}! Focus on slow, steady deep breaths.`);
  }

  // Priority to Poor joints for critical corrections
  poorJoints.forEach((joint) => {
    const template = JOINT_FEEDBACK_TEMPLATES[joint.jointKey];
    if (template && template.poor.length > 0) {
      tips.push(template.poor[Math.floor(Math.random() * template.poor.length)]);
    } else {
      tips.push(`Adjust your ${joint.displayName.toLowerCase()} — target is ~${joint.targetAngle}° (currently ${joint.actualAngle}°).`);
    }
  });

  // Secondary to Slight joints for fine-tuning
  slightJoints.forEach((joint) => {
    const template = JOINT_FEEDBACK_TEMPLATES[joint.jointKey];
    if (template && template.slight.length > 0) {
      tips.push(template.slight[Math.floor(Math.random() * template.slight.length)]);
    } else {
      tips.push(`Slight tweak: align your ${joint.displayName.toLowerCase()} closer to ${joint.targetAngle}°.`);
    }
  });

  // Fallback if posture is near perfect
  if (tips.length === 1 && goodJoints.length >= evals.length - 1) {
    tips.push(`Incredible form! Maintain smooth nasal breathing to deepen your hold.`);
  }

  return tips.slice(0, 4); // Limit to top 4 clear tips
}
