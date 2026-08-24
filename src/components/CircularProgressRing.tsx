import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressRingProps {
  value: number; // 0 to 100 or current metric
  max?: number; // default 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'green' | 'amber' | 'red' | 'emerald';
  children?: React.ReactNode;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  colorScheme = 'green',
  children,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    green: { stroke: '#22C55E', glow: 'rgba(34, 197, 94, 0.35)', text: 'text-accent-green' },
    emerald: { stroke: '#34D399', glow: 'rgba(52, 211, 153, 0.35)', text: 'text-accent-emerald' },
    amber: { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', text: 'text-status-slight' },
    red: { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.35)', text: 'text-status-poor' },
  }[colorScheme];

  return (
    <div className="relative flex flex-col items-center justify-center inline-flex select-none">
      {/* Background ambient glow behind ring */}
      <div
        className="absolute rounded-full blur-xl pointer-events-none transition-all duration-500"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: colors.glow,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress animated circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
              className={`font-display font-extrabold ${colors.text}`}
              style={{ fontSize: size * 0.28 }}
            >
              {Math.round(value)}
            </motion.span>
            {label && (
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mt-0.5">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] text-text-tertiary mt-0.5">{sublabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
