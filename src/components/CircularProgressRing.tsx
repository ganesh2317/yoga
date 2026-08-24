import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'forest' | 'ochre' | 'rust';
  children?: React.ReactNode;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  colorScheme = 'forest',
  children,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    forest: { stroke: '#3F6B4F', glow: 'rgba(63, 107, 79, 0.28)', text: 'text-[#88C49D]' },
    ochre: { stroke: '#C9A66B', glow: 'rgba(201, 166, 107, 0.28)', text: 'text-[#C9A66B]' },
    rust: { stroke: '#C1502E', glow: 'rgba(193, 80, 46, 0.28)', text: 'text-[#C1502E]' },
  }[colorScheme];

  return (
    <div className="relative flex flex-col items-center justify-center inline-flex select-none">
      {/* Soft background ambient glow */}
      <div
        className="absolute rounded-full blur-xl pointer-events-none transition-all duration-500"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          backgroundColor: colors.glow,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(244, 241, 236, 0.07)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Center overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
        {children ? (
          children
        ) : (
          <>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-serif font-extrabold tracking-tight ${colors.text}`}
              style={{ fontSize: size * 0.28 }}
            >
              {Math.round(value)}
            </motion.span>
            {label && (
              <span className="text-[10px] font-bold text-[#A8A29B] uppercase tracking-widest mt-0.5">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] text-[#635E58] mt-0.5">{sublabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
