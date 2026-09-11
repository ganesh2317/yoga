export type JourneyTier = 'Foundation' | 'Alignment' | 'Strength' | 'Flow' | 'Mastery';

export interface JourneyLevel {
  level: number;
  title: string;
  subtitle: string;
  tier: JourneyTier;
  description: string;
  targetPoseIds: string[];
  requiredAccuracy: number;
  requiredHoldSeconds: number;
  requiredSessionsPerPose: number;
  badgeName: string;
  icon: string;
}

export const JOURNEY_TIER_COLORS: Record<
  JourneyTier,
  { bg: string; text: string; border: string; accent: string }
> = {
  Foundation: {
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#10b981',
    border: 'rgba(16, 185, 129, 0.3)',
    accent: '#10b981',
  },
  Alignment: {
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.3)',
    accent: '#3b82f6',
  },
  Strength: {
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.3)',
    accent: '#f59e0b',
  },
  Flow: {
    bg: 'rgba(168, 85, 247, 0.12)',
    text: '#a855f7',
    border: 'rgba(168, 85, 247, 0.3)',
    accent: '#a855f7',
  },
  Mastery: {
    bg: 'rgba(236, 72, 153, 0.12)',
    text: '#ec4899',
    border: 'rgba(236, 72, 153, 0.3)',
    accent: '#ec4899',
  },
};

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    level: 1,
    title: 'Grounding Basics',
    subtitle: 'Foundation of Posture & Breath',
    tier: 'Foundation',
    description: 'Master stillness, spinal length, and resting postures that form the bedrock of your practice.',
    targetPoseIds: ['tadasana', 'balasana', 'marjaryasana_bitilasana'],
    requiredAccuracy: 70,
    requiredHoldSeconds: 10,
    requiredSessionsPerPose: 1,
    badgeName: 'Earth Root',
    icon: '🌱',
  },
  {
    level: 2,
    title: 'Standing Strength',
    subtitle: 'Lower Body Stability',
    tier: 'Foundation',
    description: 'Awaken your quads, glutes, and foundation with powerful standing postures.',
    targetPoseIds: ['virabhadrasana2', 'utkatasana'],
    requiredAccuracy: 72,
    requiredHoldSeconds: 12,
    requiredSessionsPerPose: 1,
    badgeName: 'Steadfast Warrior',
    icon: '⚡',
  },
  {
    level: 3,
    title: 'Balance & Focus',
    subtitle: 'Proprioception & Lateral Extension',
    tier: 'Alignment',
    description: 'Cultivate single-leg balance and lateral spine extension with precise spatial focus.',
    targetPoseIds: ['vrikshasana', 'trikonasana'],
    requiredAccuracy: 75,
    requiredHoldSeconds: 12,
    requiredSessionsPerPose: 2,
    badgeName: 'Balanced Branch',
    icon: '🌿',
  },
  {
    level: 4,
    title: 'Core & Inversion',
    subtitle: 'Full-Body Structural Tone',
    tier: 'Alignment',
    description: 'Engage deep abdominal stabilizers and lengthen the posterior chain in inverted V.',
    targetPoseIds: ['plank', 'adho_mukha_svanasana'],
    requiredAccuracy: 75,
    requiredHoldSeconds: 15,
    requiredSessionsPerPose: 2,
    badgeName: 'Pillar of Strength',
    icon: '🏛️',
  },
  {
    level: 5,
    title: 'Heart Openers',
    subtitle: 'Spinal Extension & Chest Expansion',
    tier: 'Strength',
    description: 'Open your chest, strengthen the posterior chain, and cultivate gentle backbends.',
    targetPoseIds: ['bhujangasana', 'setu_bandhasana'],
    requiredAccuracy: 78,
    requiredHoldSeconds: 15,
    requiredSessionsPerPose: 2,
    badgeName: 'Radiant Heart',
    icon: '☀️',
  },
  {
    level: 6,
    title: 'Warrior Path',
    subtitle: 'Dynamic Power & Horizontal Balance',
    tier: 'Strength',
    description: 'Challenge endurance and multi-plane balance through the full Warrior lineage.',
    targetPoseIds: ['virabhadrasana1', 'virabhadrasana3'],
    requiredAccuracy: 80,
    requiredHoldSeconds: 15,
    requiredSessionsPerPose: 2,
    badgeName: 'Ascendant Warrior',
    icon: '🗡️',
  },
  {
    level: 7,
    title: 'Fluid Transitions',
    subtitle: 'Vinyasa Flow Foundation',
    tier: 'Flow',
    description: 'Hone the core upper body transitions connecting plank, staff, and upward dog.',
    targetPoseIds: ['chaturanga', 'urdhva_mukha_svanasana'],
    requiredAccuracy: 80,
    requiredHoldSeconds: 15,
    requiredSessionsPerPose: 3,
    badgeName: 'Liquid Flow',
    icon: '🌊',
  },
  {
    level: 8,
    title: 'Lateral Balance',
    subtitle: 'Complex Multi-Plane Stability',
    tier: 'Flow',
    description: 'Command single-leg lateral expansion and twisted balance wraps.',
    targetPoseIds: ['ardha_chandrasana', 'garudasana'],
    requiredAccuracy: 82,
    requiredHoldSeconds: 15,
    requiredSessionsPerPose: 3,
    badgeName: 'Crescent Moon',
    icon: '🌙',
  },
  {
    level: 9,
    title: 'Deep Flexibility & Twists',
    subtitle: 'Spinal Rotation & Forward Lengthening',
    tier: 'Mastery',
    description: 'Release deep posterior tension and detoxify through seated spinal rotation.',
    targetPoseIds: ['paschimottanasana', 'ardha_matsyendrasana'],
    requiredAccuracy: 85,
    requiredHoldSeconds: 18,
    requiredSessionsPerPose: 3,
    badgeName: 'Spinal Alchemist',
    icon: '🌀',
  },
  {
    level: 10,
    title: 'Asana Mastery',
    subtitle: 'Peak Arm Balance & Backbend Poise',
    tier: 'Mastery',
    description: 'The pinnacle of balance, courage, and full-body poise in Crow and Dancer poses.',
    targetPoseIds: ['bakasana', 'natarajasana'],
    requiredAccuracy: 88,
    requiredHoldSeconds: 20,
    requiredSessionsPerPose: 4,
    badgeName: 'Enlightened Yogin',
    icon: '👑',
  },
];
