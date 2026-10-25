import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DajjahLogo } from '../common/DajjahLogo';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onSkip }) => {
  const [phase, setPhase] = useState<number>(1);
  // Phase 1: Deep Dark (0ms)
  // Phase 2: Ambient Light (400ms)
  // Phase 3: Logo Emergence (900ms)
  // Phase 4: 3D Depth & Light Reflection (1500ms)
  // Phase 5: Brand Name "ضَجّة مول" Reveal (2200ms)
  // Phase 6: Tagline "ضَجّة في وجه الغلاء" Reveal (2800ms)
  // Phase 7: Transition Out (3800ms)

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(2), 250);
    const timer2 = setTimeout(() => setPhase(3), 550);
    const timer3 = setTimeout(() => setPhase(4), 950);
    const timer4 = setTimeout(() => setPhase(5), 1400);
    const timer5 = setTimeout(() => setPhase(6), 1800);
    const timer6 = setTimeout(() => {
      setPhase(7);
      setTimeout(onComplete, 400);
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07060A] text-white overflow-hidden select-none cursor-pointer"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={onSkip || onComplete}
      >
        {/* Skip button in corner */}
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip ? onSkip() : onComplete();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-xs font-semibold text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <span>تخطي العرض</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ambient Cosmic / Cinematic Lighting Grid */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Top-Right Golden Light Cone */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/20 via-amber-700/5 to-transparent blur-3xl" />
          {/* Bottom-Left Royal Violet Aura */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-800/25 via-violet-950/10 to-transparent blur-3xl" />
          {/* Center Light Pillar */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
        </motion.div>

        {/* Cinematic Particles & Star Dust */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-300/40"
              style={{
                top: `${(i * 19) % 95}%`,
                left: `${(i * 23) % 92}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase >= 3 ? [0.2, 0.8, 0.2] : 0,
                scale: phase >= 3 ? [0.8, 1.4, 0.8] : 0,
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* 3D Container with Parallax & Depth Tilt */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center p-6"
          initial={{ scale: 0.75, opacity: 0, y: 30, rotateX: 18 }}
          animate={{
            scale: phase >= 3 ? (phase >= 4 ? 1 : 0.95) : 0.75,
            opacity: phase >= 3 ? 1 : 0,
            y: phase >= 3 ? 0 : 30,
            rotateX: phase >= 4 ? [12, -4, 0] : 18,
            rotateY: phase >= 4 ? [-8, 6, 0] : 0,
          }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ perspective: 1200 }}
        >
          {/* Floating Gold Halo Reflection Behind Logo */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-amber-400/20 via-purple-500/20 to-amber-300/30 blur-2xl pointer-events-none"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: phase >= 4 ? [1, 1.25, 1.1] : 0.5,
              opacity: phase >= 4 ? 0.75 : 0,
            }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Light Reflection Sweeping across Logo */}
          <div className="relative">
            <DajjahLogo
              size="hero"
              withGlow={phase >= 4}
              customSize={window.innerWidth < 640 ? 190 : 230}
            />

            {/* Cinematic Lens Flare Specular Highlight */}
            {phase >= 4 && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                initial={{ x: '-120%', opacity: 0 }}
                animate={{ x: '140%', opacity: [0, 0.9, 0] }}
                transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.1 }}
              >
                <div className="w-20 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-25 blur-[2px]" />
              </motion.div>
            )}
          </div>

          {/* Brand Name Typography Reveal */}
          <motion.div
            className="mt-6 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase >= 5 ? 1 : 0,
              y: phase >= 5 ? 0 : 20,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]">
                ضَجّة مول
              </h1>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            {/* Tagline Reveal: "ضَجّة في وجه الغلاء" */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{
                opacity: phase >= 6 ? 1 : 0,
                y: phase >= 6 ? 0 : 12,
                filter: phase >= 6 ? 'blur(0px)' : 'blur(4px)',
              }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-2.5 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-900/30 to-amber-500/10 border border-amber-400/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <p className="text-sm sm:text-base md:text-lg font-bold text-amber-200/95 tracking-wide">
                ضَجّة في وجه الغلاء
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </motion.div>

            {/* Location & Global Badge */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 6 ? 0.6 : 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-3 text-xs text-neutral-400 font-medium tracking-widest"
            >
              المنصة العالمية الرائدة للتجارة والتسوق • اليمن والعالم
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Bottom subtle progress indicator */}
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-2">
          <div className="w-36 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-amber-300"
              initial={{ width: '0%' }}
              animate={{ width: phase >= 6 ? '100%' : `${(phase / 6) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">جاري تحميل أحدث العروض...</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
