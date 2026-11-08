import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface SplashScreenProps {
  onDismiss?: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, forceShow }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for ~1.8 seconds, then initiate smooth fade-out
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [forceShow, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="fabrica-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-slate-100 select-none overflow-hidden"
          role="dialog"
          aria-label="Welcome to Fabrica"
        >
          {/* Subtle noise texture */}
          <div className="absolute inset-0 noise-overlay pointer-events-none opacity-40" />

          {/* Dual ambient glow blobs matching LoneWolf Studio */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/15 blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -10 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            {/* LoneWolf Studio Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-display uppercase tracking-[0.25em] text-pink-400 font-bold">
                LoneWolf Presents
              </span>
            </div>

            {/* Giant Display Title */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-300 drop-shadow-[0_0_35px_rgba(255,42,133,0.35)] mb-3">
              FABRICA
            </h1>

            {/* Minimal glowing rule divider */}
            <div className="w-16 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full mb-4 shadow-[0_0_10px_rgba(255,42,133,0.8)]" />

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-light text-slate-300 tracking-wide max-w-md font-sans">
              Creative Developer & Designer Portal
            </p>

            {/* Subtle skip affordance */}
            <button
              onClick={() => {
                setIsVisible(false);
                if (onDismiss) onDismiss();
              }}
              className="mt-8 px-4 py-1.5 rounded-full text-[11px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all tracking-wider uppercase font-medium cursor-pointer"
            >
              Skip Intro ➔
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
