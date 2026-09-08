import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';

interface BreathGuideProps {
  inhaleSec?: number;
  exhaleSec?: number;
  onClose?: () => void;
  className?: string;
}

export const BreathGuide: React.FC<BreathGuideProps> = ({
  inhaleSec = 4,
  exhaleSec = 4,
  onClose,
  className = '',
}) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'inhale') {
      timer = setTimeout(() => {
        setPhase('exhale');
      }, inhaleSec * 1000);
    } else {
      timer = setTimeout(() => {
        setPhase('inhale');
      }, exhaleSec * 1000);
    }
    return () => clearTimeout(timer);
  }, [phase, inhaleSec, exhaleSec]);

  return (
    <div
      className={`relative p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-glass-glow flex items-center gap-3.5 select-none ${className}`}
    >
      {/* Animated Liquid-Glass Pulsing Breathing Circle */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        {/* Soft Ambient Glow Layer */}
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
          animate={{
            scale: phase === 'inhale' ? 1.35 : 0.9,
            backgroundColor: phase === 'inhale' ? 'rgba(52, 211, 153, 0.45)' : 'rgba(245, 158, 11, 0.35)',
          }}
          transition={{ duration: phase === 'inhale' ? inhaleSec : exhaleSec, ease: 'easeInOut' }}
        />

        {/* Outer Expanding Glass Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#34D399]/60 shadow-inner"
          animate={{
            scale: phase === 'inhale' ? 1.25 : 0.85,
            borderColor: phase === 'inhale' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(245, 158, 11, 0.6)',
          }}
          transition={{ duration: phase === 'inhale' ? inhaleSec : exhaleSec, ease: 'easeInOut' }}
        />

        {/* Inner Glowing Core */}
        <motion.div
          className="w-7 h-7 rounded-full bg-gradient-to-br from-[#34D399] to-[#22C55E] flex items-center justify-center text-[#0A0E14] shadow-lg"
          animate={{
            scale: phase === 'inhale' ? 1.15 : 0.75,
            opacity: phase === 'inhale' ? 1.0 : 0.75,
          }}
          transition={{ duration: phase === 'inhale' ? inhaleSec : exhaleSec, ease: 'easeInOut' }}
        >
          <Wind className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.div>
      </div>

      {/* Breath Status Text & Cycle Indicator */}
      <div className="flex flex-col min-w-[70px]">
        <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block">
          Pacing Guide
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className={`font-display font-extrabold text-sm ${
              phase === 'inhale' ? 'text-[#34D399]' : 'text-[#F59E0B]'
            }`}
          >
            {phase === 'inhale' ? 'Inhale...' : 'Exhale...'}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] text-[#64748B] font-mono">
          {phase === 'inhale' ? `${inhaleSec}s in` : `${exhaleSec}s out`}
        </span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-[#64748B] hover:text-[#94A3B8] text-xs p-1 rounded-full transition-colors ml-1"
          title="Hide Breath Guide"
        >
          ✕
        </button>
      )}
    </div>
  );
};
