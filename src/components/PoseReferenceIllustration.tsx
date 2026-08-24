import React from 'react';

interface PoseReferenceIllustrationProps {
  poseId: string;
  className?: string;
  strokeColor?: string;
}

export const PoseReferenceIllustration: React.FC<PoseReferenceIllustrationProps> = ({
  poseId,
  className = 'w-full h-full',
  strokeColor = '#C9A66B',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className}`}
      fill="none"
      stroke={strokeColor}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head circle */}
      <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />

      {poseId === 'tadasana' && (
        <>
          {/* Standing erect (Tadasana) */}
          <line x1="50" y1="24" x2="50" y2="58" />
          <line x1="50" y1="32" x2="35" y2="52" />
          <line x1="50" y1="32" x2="65" y2="52" />
          <line x1="50" y1="58" x2="43" y2="90" />
          <line x1="50" y1="58" x2="57" y2="90" />
        </>
      )}

      {poseId === 'vrikshasana' && (
        <>
          {/* Tree pose (Vrikshasana) */}
          <line x1="50" y1="24" x2="50" y2="58" />
          {/* Arms raised up in Anjali Mudra */}
          <path d="M 50 35 L 35 20 L 50 10" />
          <path d="M 50 35 L 65 20 L 50 10" />
          {/* Standing leg */}
          <line x1="50" y1="58" x2="50" y2="90" />
          {/* Bent leg foot against thigh */}
          <path d="M 50 58 L 70 70 L 50 70" />
        </>
      )}

      {poseId === 'trikonasana' && (
        <>
          {/* Triangle Pose (Trikonasana) */}
          <line x1="50" y1="24" x2="38" y2="52" />
          <line x1="38" y1="52" x2="22" y2="88" />
          <line x1="38" y1="52" x2="78" y2="88" />
          {/* Arms extended in line */}
          <line x1="18" y1="78" x2="58" y2="28" />
        </>
      )}

      {poseId === 'virabhadrasana1' && (
        <>
          {/* Warrior I (Virabhadrasana I) */}
          <line x1="50" y1="24" x2="50" y2="52" />
          <line x1="50" y1="28" x2="40" y2="10" />
          <line x1="50" y1="28" x2="60" y2="10" />
          {/* Front lunging leg */}
          <path d="M 50 52 L 28 68 L 28 90" />
          {/* Back extended leg */}
          <line x1="50" y1="52" x2="78" y2="88" />
        </>
      )}

      {poseId === 'bhujangasana' && (
        <>
          {/* Cobra pose (Bhujangasana) */}
          <path d="M 25 32 Q 38 52 72 78" />
          <line x1="25" y1="32" x2="20" y2="58" />
          <line x1="20" y1="58" x2="38" y2="72" />
          <line x1="72" y1="78" x2="92" y2="78" />
        </>
      )}

      {poseId === 'adho_mukha' && (
        <>
          {/* Downward Dog (Adho Mukha Svanasana) */}
          <circle cx="28" cy="62" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 32 58 L 50 28 L 76 76" />
          <line x1="32" y1="58" x2="16" y2="76" />
        </>
      )}

      {poseId === 'setu_bandhasana' && (
        <>
          {/* Bridge Pose (Setu Bandhasana) */}
          <circle cx="18" cy="72" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 23 72 Q 48 42 74 72" />
          <line x1="74" y1="72" x2="74" y2="88" />
        </>
      )}

      {poseId === 'padmasana' && (
        <>
          {/* Lotus Pose (Padmasana) */}
          <line x1="50" y1="24" x2="50" y2="58" />
          <path d="M 50 38 L 28 52 M 50 38 L 72 52" />
          <path d="M 50 58 Q 28 84 72 84 Q 50 84 28 84" />
        </>
      )}

      {/* Fallback default */}
      {![
        'tadasana',
        'vrikshasana',
        'trikonasana',
        'virabhadrasana1',
        'bhujangasana',
        'adho_mukha',
        'setu_bandhasana',
        'padmasana',
      ].includes(poseId) && (
        <>
          <line x1="50" y1="24" x2="50" y2="58" />
          <line x1="50" y1="35" x2="32" y2="28" />
          <line x1="50" y1="35" x2="68" y2="28" />
          <line x1="50" y1="58" x2="36" y2="88" />
          <line x1="50" y1="58" x2="64" y2="88" />
        </>
      )}
    </svg>
  );
};
