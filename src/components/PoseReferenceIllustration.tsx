import React from 'react';

interface PoseReferenceIllustrationProps {
  poseId: string;
  className?: string;
  strokeColor?: string;
}

export const PoseReferenceIllustration: React.FC<PoseReferenceIllustrationProps> = ({
  poseId,
  className = 'w-full h-full',
  strokeColor = '#34D399',
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
      {/* Tadasana */}
      {poseId === 'tadasana' && (
        <>
          <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />
          <line x1="50" y1="24" x2="50" y2="58" />
          <line x1="50" y1="32" x2="35" y2="52" />
          <line x1="50" y1="32" x2="65" y2="52" />
          <line x1="50" y1="58" x2="43" y2="90" />
          <line x1="50" y1="58" x2="57" y2="90" />
        </>
      )}

      {/* Vrikshasana (Tree) */}
      {poseId === 'vrikshasana' && (
        <>
          <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />
          <line x1="50" y1="24" x2="50" y2="58" />
          <path d="M 50 35 L 35 20 L 50 10" />
          <path d="M 50 35 L 65 20 L 50 10" />
          <line x1="50" y1="58" x2="50" y2="90" />
          <path d="M 50 58 L 70 70 L 50 70" />
        </>
      )}

      {/* Trikonasana (Triangle) */}
      {poseId === 'trikonasana' && (
        <>
          <circle cx="48" cy="22" r="6" stroke={strokeColor} strokeWidth="3" />
          <line x1="48" y1="28" x2="38" y2="52" />
          <line x1="38" y1="52" x2="22" y2="88" />
          <line x1="38" y1="52" x2="78" y2="88" />
          <line x1="18" y1="78" x2="58" y2="28" />
        </>
      )}

      {/* Virabhadrasana I (Warrior I) */}
      {poseId === 'virabhadrasana1' && (
        <>
          <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />
          <line x1="50" y1="24" x2="50" y2="52" />
          <line x1="50" y1="28" x2="40" y2="10" />
          <line x1="50" y1="28" x2="60" y2="10" />
          <path d="M 50 52 L 28 68 L 28 90" />
          <line x1="50" y1="52" x2="78" y2="88" />
        </>
      )}

      {/* Bhujangasana (Cobra) */}
      {poseId === 'bhujangasana' && (
        <>
          <circle cx="25" cy="26" r="6" stroke={strokeColor} strokeWidth="3" />
          <path d="M 25 32 Q 38 52 72 78" />
          <line x1="25" y1="32" x2="20" y2="58" />
          <line x1="20" y1="58" x2="38" y2="72" />
          <line x1="72" y1="78" x2="92" y2="78" />
        </>
      )}

      {/* Adho Mukha Svanasana (Downward Dog) */}
      {poseId === 'adho_mukha' && (
        <>
          <circle cx="28" cy="62" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 32 58 L 50 28 L 76 76" />
          <line x1="32" y1="58" x2="16" y2="76" />
        </>
      )}

      {/* Setu Bandhasana (Bridge) */}
      {poseId === 'setu_bandhasana' && (
        <>
          <circle cx="18" cy="72" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 23 72 Q 48 42 74 72" />
          <line x1="74" y1="72" x2="74" y2="88" />
        </>
      )}

      {/* Padmasana (Lotus) */}
      {poseId === 'padmasana' && (
        <>
          <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />
          <line x1="50" y1="24" x2="50" y2="58" />
          <path d="M 50 38 L 28 52 M 50 38 L 72 52" />
          <path d="M 50 58 Q 28 84 72 84 Q 50 84 28 84" />
        </>
      )}

      {/* Balasana (Child's Pose) */}
      {poseId === 'balasana' && (
        <>
          <circle cx="26" cy="68" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 31 70 Q 52 50 78 74" />
          <line x1="31" y1="70" x2="12" y2="70" />
        </>
      )}

      {/* Marjaryasana (Cat-Cow) */}
      {poseId === 'marjaryasana' && (
        <>
          <circle cx="22" cy="42" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 27 45 Q 50 65 75 45" />
          <line x1="27" y1="45" x2="27" y2="75" />
          <line x1="75" y1="45" x2="75" y2="75" />
        </>
      )}

      {/* Ustrasana (Camel) */}
      {poseId === 'ustrasana' && (
        <>
          <circle cx="30" cy="30" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 35 34 Q 50 18 68 50" />
          <line x1="68" y1="50" x2="68" y2="85" />
          <line x1="35" y1="34" x2="60" y2="72" />
        </>
      )}

      {/* Dhanurasana (Bow) */}
      {poseId === 'dhanurasana' && (
        <>
          <circle cx="22" cy="35" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 27 38 Q 50 80 82 45" />
          <line x1="27" y1="38" x2="82" y2="45" />
        </>
      )}

      {/* Navasana (Boat) */}
      {poseId === 'navasana' && (
        <>
          <circle cx="28" cy="28" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 33 32 L 52 70 L 80 32" />
          <line x1="52" y1="50" x2="75" y2="50" />
        </>
      )}

      {/* Paschimottanasana (Forward Bend) */}
      {poseId === 'paschimottanasana' && (
        <>
          <circle cx="68" cy="60" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 25 72 L 72 65 L 25 72" />
          <line x1="25" y1="72" x2="85" y2="72" />
        </>
      )}

      {/* Utkatasana (Chair) */}
      {poseId === 'utkatasana' && (
        <>
          <circle cx="42" cy="18" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 42 23 L 48 48 L 30 65 L 30 90" />
          <line x1="42" y1="28" x2="65" y2="12" />
        </>
      )}

      {/* Anjaneyasana (Low Lunge) */}
      {poseId === 'anjaneyasana' && (
        <>
          <circle cx="48" cy="20" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 48 25 L 48 50 M 48 28 L 65 12" />
          <path d="M 48 50 L 30 65 L 30 90" />
          <line x1="48" y1="50" x2="82" y2="85" />
        </>
      )}

      {/* Garudasana (Eagle) */}
      {poseId === 'garudasana' && (
        <>
          <circle cx="50" cy="18" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="50" y1="23" x2="50" y2="55" />
          <path d="M 50 35 L 38 48 L 50 48" />
          <path d="M 50 55 L 42 72 L 52 88" />
        </>
      )}

      {/* Natarajasana (Dancer) */}
      {poseId === 'natarajasana' && (
        <>
          <circle cx="42" cy="22" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 42 27 L 42 55 L 42 90" />
          <line x1="42" y1="35" x2="20" y2="35" />
          <path d="M 42 55 Q 75 40 68 28" />
        </>
      )}

      {/* Ardha Chandrasana (Half Moon) */}
      {poseId === 'ardha_chandrasana' && (
        <>
          <circle cx="45" cy="45" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="45" y1="50" x2="45" y2="88" />
          <line x1="45" y1="50" x2="88" y2="50" />
          <line x1="45" y1="35" x2="45" y2="12" />
        </>
      )}

      {/* Ardha Matsyendrasana (Half Spinal Twist) */}
      {poseId === 'ardha_matsyendrasana' && (
        <>
          <circle cx="50" cy="20" r="5" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="50" y1="25" x2="50" y2="60" />
          <path d="M 50 38 L 70 52 L 50 60" />
          <path d="M 50 60 Q 25 82 75 82" />
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
        'balasana',
        'marjaryasana',
        'ustrasana',
        'dhanurasana',
        'navasana',
        'paschimottanasana',
        'utkatasana',
        'anjaneyasana',
        'garudasana',
        'natarajasana',
        'ardha_chandrasana',
        'ardha_matsyendrasana',
      ].includes(poseId) && (
        <>
          <circle cx="50" cy="18" r="6" stroke={strokeColor} strokeWidth="3" />
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
