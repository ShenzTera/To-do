import { motion } from 'motion/react';

export function LiquidBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/90 via-sky-100/60 to-indigo-100/70 dark:from-[#0b0e17] dark:via-[#111625] dark:to-[#090c14] transition-colors duration-700" />

      {/* Ambient Floating Liquid Orb 1 - Top Left */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-cyan-400/25 via-sky-300/20 to-indigo-400/25 dark:from-indigo-600/20 dark:via-cyan-500/15 dark:to-purple-600/20 blur-3xl opacity-80"
      />

      {/* Ambient Floating Liquid Orb 2 - Right Middle */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/4 -right-24 w-80 h-80 sm:w-[550px] sm:h-[550px] rounded-full bg-gradient-to-bl from-indigo-300/20 via-purple-300/25 to-pink-300/20 dark:from-purple-800/25 dark:via-indigo-700/20 dark:to-cyan-800/15 blur-3xl opacity-75"
      />

      {/* Ambient Floating Liquid Orb 3 - Bottom Left/Center */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -40, 20, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute -bottom-24 left-1/4 w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-sky-400/20 via-teal-300/15 to-emerald-300/15 dark:from-blue-900/20 dark:via-teal-800/15 dark:to-indigo-950/30 blur-3xl opacity-70"
      />

      {/* Subtle Liquid Noise / Specular Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-overlay" />
    </div>
  );
}
