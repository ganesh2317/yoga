export type PoseCategory = 'All' | 'Standing' | 'Seated' | 'Backbend' | 'Inversion' | 'Balance' | 'Twist';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type JointStatus = 'Good' | 'Slight' | 'Poor';

export interface JointAngleTarget {
  name: string;
  targetAngle: number; // in degrees
  tolerance: number; // +- degrees allowed for full score
  weight?: number; // relative weight in total calculation
}

export interface IdealJointAngles {
  leftKnee?: JointAngleTarget;
  rightKnee?: JointAngleTarget;
  leftElbow?: JointAngleTarget;
  rightElbow?: JointAngleTarget;
  leftShoulder?: JointAngleTarget;
  rightShoulder?: JointAngleTarget;
  leftHip?: JointAngleTarget;
  rightHip?: JointAngleTarget;
  spineTilt?: JointAngleTarget;
}

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
  thumbnailSvg?: string;
  estimatedCaloriesPerMin: number;
}

export interface JointLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface ComputedJointAngles {
  leftKnee?: number;
  rightKnee?: number;
  leftElbow?: number;
  rightElbow?: number;
  leftShoulder?: number;
  rightShoulder?: number;
  leftHip?: number;
  rightHip?: number;
  spineTilt?: number;
  [key: string]: number | undefined;
}

export interface JointEvaluation {
  jointKey: string;
  displayName: string;
  actualAngle: number;
  targetAngle: number;
  tolerance: number;
  deviation: number;
  score: number; // 0 - 100
  status: JointStatus;
}

export interface CategoryBreakdown {
  overall: number;
  shoulder: number;
  hip: number;
  knee: number;
  torso: number;
  balance: number;
}

export interface FrameEvaluation {
  score: number;
  jointEvaluations: Record<string, JointEvaluation>;
  categoryBreakdown: CategoryBreakdown;
  timestamp: number;
}

export interface SessionSummary {
  id: string;
  userId: string;
  poseId: string;
  poseName: string;
  sanskritName: string;
  timestamp: string; // ISO date
  dateString: string; // YYYY-MM-DD
  durationSeconds: number;
  averageScore: number;
  categoryBreakdown: CategoryBreakdown;
  jointEvaluations: Record<string, JointEvaluation>;
  feedbackTips: string[];
  caloriesBurned: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dailyGoalMinutes: number;
  createdAt: string;
}

export interface UserStreak {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalMinutes: number;
  totalSessions: number;
}
