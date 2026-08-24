import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grain">
      {/* Base warm near-black background */}
      <div className="absolute inset-0 bg-[#090D12]" />

      {/* Blob 1 - Top Left Refined Sage */}
      <motion.div
        animate={{
          x: [0, 30, -15, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -left-36 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-emerald-600/10 via-teal-700/8 to-transparent blur-[110px]"
      />

      {/* Blob 2 - Bottom Right Muted Warm Amber / Terracotta */}
      <motion.div
        animate={{
          x: [0, -35, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-48 -right-36 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-amber-600/8 via-orange-700/6 to-emerald-900/5 blur-[130px]"
      />

      {/* Blob 3 - Center Subtle Ambient Illumination */}
      <motion.div
        animate={{
          opacity: [0.12, 0.20, 0.12],
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-gradient-to-r from-emerald-950/15 via-teal-900/10 to-transparent blur-[150px]"
      />
    </div>
  );
};
