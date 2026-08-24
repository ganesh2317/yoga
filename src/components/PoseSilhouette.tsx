import React from 'react';

interface PoseSilhouetteProps {
  poseId: string;
  className?: string;
}

export const PoseSilhouette: React.FC<PoseSilhouetteProps> = ({ poseId, className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`text-accent-emerald/80 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="50" cy="20" r="7" className="fill-accent-green/20" />
      
      {poseId === 'tadasana' && (
        <>
          {/* Standing erect */}
          <line x1="50" y1="27" x2="50" y2="60" />
          <line x1="50" y1="35" x2="35" y2="55" />
          <line x1="50" y1="35" x2="65" y2="55" />
          <line x1="50" y1="60" x2="42" y2="90" />
          <line x1="50" y1="60" x2="58" y2="90" />
        </>
      )}

      {poseId === 'vrikshasana' && (
        <>
          {/* Tree pose */}
          <line x1="50" y1="27" x2="50" y2="60" />
          {/* Arms raised up */}
          <path d="M 50 40 L 35 25 L 50 12" />
          <path d="M 50 40 L 65 25 L 50 12" />
          {/* Standing leg */}
          <line x1="50" y1="60" x2="50" y2="90" />
          {/* Bent leg */}
          <path d="M 50 60 L 70 72 L 50 72" />
        </>
      )}

      {poseId === 'trikonasana' && (
        <>
          {/* Triangle Pose */}
          <line x1="50" y1="27" x2="35" y2="55" />
          <line x1="35" y1="55" x2="25" y2="85" />
          <line x1="35" y1="55" x2="75" y2="85" />
          {/* Arms T line */}
          <line x1="15" y1="75" x2="55" y2="35" />
        </>
      )}

      {poseId === 'virabhadrasana1' && (
        <>
          {/* Warrior 1 */}
          <line x1="50" y1="27" x2="50" y2="55" />
          <line x1="50" y1="30" x2="50" y2="10" />
          {/* Front lunging leg */}
          <path d="M 50 55 L 30 70 L 30 90" />
          {/* Back extended leg */}
          <line x1="50" y1="55" x2="75" y2="88" />
        </>
      )}

      {poseId === 'bhujangasana' && (
        <>
          {/* Cobra pose */}
          <path d="M 30 30 Q 40 50 70 75" />
          <line x1="30" y1="30" x2="25" y2="55" />
          <line x1="25" y1="55" x2="40" y2="70" />
          <line x1="70" y1="75" x2="90" y2="75" />
        </>
      )}

      {poseId === 'adho_mukha' && (
        <>
          {/* Downward dog */}
          <circle cx="28" cy="65" r="7" className="fill-accent-green/20" />
          <path d="M 32 60 L 50 30 L 75 75" />
          <line x1="32" y1="60" x2="18" y2="75" />
        </>
      )}

      {poseId === 'setu_bandhasana' && (
        <>
          {/* Bridge pose */}
          <circle cx="20" cy="70" r="7" className="fill-accent-green/20" />
          <path d="M 25 70 Q 50 40 75 70" />
          <line x1="75" y1="70" x2="75" y2="85" />
        </>
      )}

      {poseId === 'padmasana' && (
        <>
          {/* Lotus pose */}
          <line x1="50" y1="27" x2="50" y2="60" />
          <path d="M 50 40 L 30 55 M 50 40 L 70 55" />
          <path d="M 50 60 Q 30 85 70 85 Q 50 85 30 85" />
        </>
      )}

      {/* Default stick figure if ID unmatched */}
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
          <line x1="50" y1="27" x2="50" y2="60" />
          <line x1="50" y1="40" x2="30" y2="30" />
          <line x1="50" y1="40" x2="70" y2="30" />
          <line x1="50" y1="60" x2="35" y2="85" />
          <line x1="50" y1="60" x2="65" y2="85" />
        </>
      )}
    </svg>
  );
};
