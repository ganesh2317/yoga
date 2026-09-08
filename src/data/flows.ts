export interface FlowPoseConfig {
  poseId: string;
  targetHoldSeconds: number;
}

export interface Flow {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDurationMinutes: number;
  poses: FlowPoseConfig[];
  benefits: string[];
}

export const YOGA_FLOWS: Flow[] = [
  {
    id: 'morning_energy_flow',
    name: 'Morning Energy Routine',
    sanskritName: 'Prana Vinyasa',
    description: 'A dynamic 5-pose sequence designed to awaken joint mobility, boost circulation, and ground your breathing for the day ahead.',
    difficulty: 'Beginner',
    estimatedDurationMinutes: 4,
    poses: [
      { poseId: 'tadasana', targetHoldSeconds: 10 },
      { poseId: 'vrikshasana', targetHoldSeconds: 12 },
      { poseId: 'virabhadrasana2', targetHoldSeconds: 15 },
      { poseId: 'trikonasana', targetHoldSeconds: 12 },
      { poseId: 'utkatasana', targetHoldSeconds: 10 },
    ],
    benefits: [
      'Increases morning joint mobility',
      'Energizes core & leg muscles',
      'Builds focus and balance',
      'Stimulates deep nasal breathing',
    ],
  },
  {
    id: 'beginner_foundation_flow',
    name: 'Beginner Foundation Routine',
    sanskritName: 'Sthira Vinyasa',
    description: 'Master foundational standing and balancing postures with generous hold times and guided form feedback.',
    difficulty: 'Beginner',
    estimatedDurationMinutes: 3,
    poses: [
      { poseId: 'tadasana', targetHoldSeconds: 10 },
      { poseId: 'vrikshasana', targetHoldSeconds: 10 },
      { poseId: 'virabhadrasana2', targetHoldSeconds: 12 },
      { poseId: 'trikonasana', targetHoldSeconds: 10 },
    ],
    benefits: [
      'Establishes correct alignment habits',
      'Strengthens lower body foundation',
      'Builds steady spatial awareness',
    ],
  },
  {
    id: 'warrior_strength_flow',
    name: 'Warrior Strength Routine',
    sanskritName: 'Virabhadra Vinyasa',
    description: 'An empowering sequence focusing on lower body endurance, open chest alignment, and deep core stability.',
    difficulty: 'Intermediate',
    estimatedDurationMinutes: 5,
    poses: [
      { poseId: 'tadasana', targetHoldSeconds: 8 },
      { poseId: 'virabhadrasana2', targetHoldSeconds: 15 },
      { poseId: 'trikonasana', targetHoldSeconds: 15 },
      { poseId: 'utkatasana', targetHoldSeconds: 15 },
      { poseId: 'vrikshasana', targetHoldSeconds: 12 },
    ],
    benefits: [
      'Strengthens thighs, calves & ankles',
      'Opens hips and shoulders',
      'Fosters resilience & stamina',
    ],
  },
];
