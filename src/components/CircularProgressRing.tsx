import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'emerald' | 'amber' | 'red' | 'forest' | 'ochre' | 'rust';
  children?: React.ReactNode;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  colorScheme = 'emerald',
  children,
}) => {
  const activeScheme = colorScheme === 'forest' ? 'emerald' : colorScheme === 'ochre' ? 'amber' : colorScheme === 'rust' ? 'red' : colorScheme;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    emerald: { stroke: '#22C55E', glow: 'rgba(34, 197, 94, 0.32)', text: 'text-[#34D399]' },
    amber: { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.32)', text: 'text-[#F59E0B]' },
    red: { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.32)', text: 'text-[#EF4444]' },
  }[activeScheme];

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
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Main Progress circle */}
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

        {/* Traveling Amber Liquid-Glass Glint Ring Overlay */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FBBF24"
          strokeWidth={strokeWidth * 0.8}
          strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: [circumference, 0] }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
          strokeLinecap="round"
          fill="transparent"
          opacity={0.7}
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
              className={`font-display font-extrabold tracking-tight ${colors.text}`}
              style={{ fontSize: size * 0.28 }}
            >
              {Math.round(value)}
            </motion.span>
            {label && (
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] text-[#64748B] mt-0.5">{sublabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
