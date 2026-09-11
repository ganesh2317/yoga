/* ─── Domain Categories (bug #10 fix: split PoseCategory and PoseFilter) ─── */
export type PoseCategory = 'Standing' | 'Seated' | 'Backbend' | 'Inversion' | 'Balance' | 'Twist';
export type PoseFilter = PoseCategory | 'All';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type JointStatus = 'Good' | 'Slight' | 'Poor' | 'Unknown';

/* ─── Branded landmark types (§3.4) ─── */
declare const normalizedBrand: unique symbol;
declare const worldBrand: unique symbol;

export interface NormalizedLandmark {
  readonly [normalizedBrand]: true;
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface WorldLandmark {
  readonly [worldBrand]: true;
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/** Legacy compat alias — use NormalizedLandmark or WorldLandmark where possible */
export interface JointLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/* ─── Pose Joint Model (§3.8 extended head-to-toe) ─── */
export interface JointAngleTarget {
  name: string;
  targetAngle: number;
  tolerance: number;
  weight: number;
}

export interface IdealJointAngles {
  neckTilt?: JointAngleTarget;
  headYaw?: JointAngleTarget;
  shoulderLevel?: JointAngleTarget;
  leftShoulder?: JointAngleTarget;
  rightShoulder?: JointAngleTarget;
  leftElbow?: JointAngleTarget;
  rightElbow?: JointAngleTarget;
  leftWrist?: JointAngleTarget;
  rightWrist?: JointAngleTarget;
  spineUpper?: JointAngleTarget;
  spineLower?: JointAngleTarget;
  torsoLean?: JointAngleTarget;
  hipLevel?: JointAngleTarget;
  leftHip?: JointAngleTarget;
  rightHip?: JointAngleTarget;
  leftKnee?: JointAngleTarget;
  rightKnee?: JointAngleTarget;
  leftAnkle?: JointAngleTarget;
  rightAnkle?: JointAngleTarget;
  stanceWidth?: JointAngleTarget;
  [key: string]: JointAngleTarget | undefined;
}

export interface ComputedJointAngles {
  neckTilt?: number;
  headYaw?: number;
  shoulderLevel?: number;
  leftShoulder?: number;
  rightShoulder?: number;
  leftElbow?: number;
  rightElbow?: number;
  leftWrist?: number;
  rightWrist?: number;
  spineUpper?: number;
  spineLower?: number;
  torsoLean?: number;
  hipLevel?: number;
  leftHip?: number;
  rightHip?: number;
  leftKnee?: number;
  rightKnee?: number;
  leftAnkle?: number;
  rightAnkle?: number;
  stanceWidth?: number;
  [key: string]: number | undefined;
}

/* ─── Pose Definition (§3.8) ─── */
export type PoseSymmetry = 'symmetric' | 'lateral';

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  category: PoseCategory;
  difficulty: Difficulty;
  description: string;
  benefits: string[];
  setupSteps: string[];
  alignmentCues: string[];
  idealJointAngles: IdealJointAngles;
  primaryJoints: string[];
  contraindications: string[];
  symmetry: PoseSymmetry;
  thumbnailSvg?: string;
  estimatedCaloriesPerMin: number;
}

/* ─── Evaluation (§3.10) ─── */
export interface JointEvaluation {
  jointKey: string;
  displayName: string;
  actualAngle: number;
  targetAngle: number;
  tolerance: number;
  deviation: number;
  score: number;
  status: JointStatus;
  weight: number;
}

export interface CategoryBreakdown {
  overall: number;
  shoulder: number;
  hip: number;
  knee: number;
  torso: number;
  balance: number;
}

export type MeasurementSpace = 'world' | 'image';

export interface FrameEvaluation {
  score: number | null;
  jointEvaluations: Record<string, JointEvaluation>;
  categoryBreakdown: CategoryBreakdown;
  timestamp: number;
  confidence: number;
  jointsEvaluated: number;
  jointsRequired: number;
  measurementSpace: MeasurementSpace;
  detectedSide: 'left' | 'right' | 'center' | null;
}

/* ─── Session (§4.3) ─── */
export interface SessionSummary {
  id: string;
  userId: string;
  poseId: string;
  poseName: string;
  sanskritName: string;
  timestamp: string;
  dateString: string;
  durationSeconds: number;
  averageScore: number;
  accuracyPercent?: number;
  inPositionSeconds?: number;
  totalTrackedSeconds?: number;
  longestHoldSeconds?: number;
  levelAtSession?: number;
  trackingQualityAvg?: number;
  confidenceAvg?: number;
  detectedSide?: 'left' | 'right' | 'center' | null;
  categoryBreakdown: CategoryBreakdown;
  jointEvaluations: Record<string, JointEvaluation>;
  feedbackTips: string[];
  caloriesBurned: number;
}

/* ─── User ─── */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dailyGoalMinutes: number;
  createdAt: string;
}

export interface UserStreak {
  currentStreak: number;
  lastActiveDate: string;
  totalMinutes: number;
  totalSessions: number;
}
