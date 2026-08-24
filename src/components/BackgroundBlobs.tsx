import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grain">
      {/* Neutral graphite-black base background */}
      <div className="absolute inset-0 bg-[#0C0D10]" />

      {/* Blob 1 - Top Left Deep Muted Forest Green */}
      <motion.div
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 15, 0],
          scale: [1, 1.06, 0.97, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-44 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#3F6B4F]/10 via-[#528364]/6 to-transparent blur-[120px]"
      />

      {/* Blob 2 - Bottom Right Warm Ochre / Terracotta */}
      <motion.div
        animate={{
          x: [0, -30, 18, 0],
          y: [0, 25, -18, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-52 -right-40 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-[#C9A66B]/7 via-[#C1502E]/5 to-transparent blur-[140px]"
      />
    </div>
  );
};
