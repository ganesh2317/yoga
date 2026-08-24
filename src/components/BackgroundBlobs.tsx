import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background base */}
      <div className="absolute inset-0 bg-[#0B0F14]" />

      {/* Blob 1 - Top Left Emerald */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-600/10 blur-[100px]"
      />

      {/* Blob 2 - Bottom Right Cyan */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-40 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-green-500/10 via-emerald-600/12 to-cyan-500/10 blur-[120px]"
      />

      {/* Blob 3 - Center Glow */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-emerald-900/10 via-teal-900/15 to-transparent blur-[140px]"
      />
    </div>
  );
};
