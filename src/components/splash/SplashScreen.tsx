import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { DajjahLogo } from '../common/DajjahLogo';
import { Sparkles, ArrowLeft, Volume2, VolumeX, Flame } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onSkip }) => {
  const [phase, setPhase] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize Netflix-style luxury cinematic impact sound using Web Audio API (0kb download, zero lag, works offline)
  const playCinematicAudio = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Sub-Bass Cinema Impact Boom (Netflix-style low frequency punch)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.45, now + 0.08);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 2.1);

      // 2. Shimmering Gold Harmonic Swell (Luxury brass / crystal chime)
      const freqs = [220, 277.18, 329.63, 440, 554.37, 659.25]; // A major luxury chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * 0.98, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 1.6);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + 0.35 + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.2);
        osc.stop(now + 2.3);
      });
    } catch {
      // Audio autoplay policy fallback (silent mode without breaking)
    }
  }, [isMuted]);

  useEffect(() => {
    // Phase 1: Deep cinematic darkness (0ms)
    // Phase 2: Anamorphic Light Bar Flare & Sub Boom (250ms)
    // Phase 3: 3D Logo Emergence & Ribbon Burst (600ms)
    // Phase 4: Specular Golden Scan & Tilt Depth (1100ms)
    // Phase 5: Brand Name "ضَجّة مول" 3D Reveal (1600ms)
    // Phase 6: Slogan "ضَجّة في وجه الغلاء" & Climax (2100ms)
    // Phase 7: Smooth Exit to Main App (2800ms)

    const timerSound = setTimeout(playCinematicAudio, 250);
    const timer1 = setTimeout(() => setPhase(2), 250);
    const timer2 = setTimeout(() => setPhase(3), 600);
    const timer3 = setTimeout(() => setPhase(4), 1100);
    const timer4 = setTimeout(() => setPhase(5), 1600);
    const timer5 = setTimeout(() => setPhase(6), 2100);
    const timer6 = setTimeout(() => {
      setPhase(7);
      setTimeout(onComplete, 400);
    }, 2850);

    return () => {
      clearTimeout(timerSound);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [onComplete, playCinematicAudio]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSkip) onSkip();
    else onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050408] text-white overflow-hidden select-none cursor-pointer"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        onClick={handleSkip}
      >
        {/* Top Controls Bar: Sound Toggle & Skip Button */}
        <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-6 z-50 flex items-center justify-between pointer-events-auto">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 backdrop-blur-md"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline text-[11px]">مكتوم</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">صوت سينمائي</span>
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/30 text-xs font-black text-amber-300 hover:text-amber-200 shadow-lg shadow-black/40 backdrop-blur-md transition-all active:scale-95"
          >
            <span>تخطي العرض</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cinematic Netflix-style Red/Gold Light Streaks (Ribbon Effect) */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Center Light Pillar (Anamorphic Beam) */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_24px_rgba(251,191,36,0.9)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase >= 2 ? [0, 1.4, 0.4] : 0,
              opacity: phase >= 2 ? [0, 1, 0.2] : 0,
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* Deep Ambient Cosmic Glowing Orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/25 via-rose-600/10 to-transparent blur-3xl transform-gpu" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-800/25 via-violet-950/15 to-transparent blur-3xl transform-gpu" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,rgba(5,4,8,0.85)_65%,#050408_100%)]" />
        </motion.div>

        {/* Dynamic Star Dust Embers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 3 === 0 ? '3px' : '2px',
                height: i % 3 === 0 ? '3px' : '2px',
                backgroundColor: i % 2 === 0 ? '#fbbf24' : '#f43f5e',
                boxShadow: '0 0 6px currentColor',
                top: `${(i * 17) % 94}%`,
                left: `${(i * 23) % 96}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase >= 3 ? [0.2, 0.85, 0.2] : 0,
                scale: phase >= 3 ? [0.6, 1.4, 0.6] : 0,
                y: [0, -25, 0],
              }}
              transition={{
                duration: 2.5 + (i % 3),
                repeat: Infinity,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* 3D Master Container with Cinematic Depth */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center p-6 text-center"
          initial={{ scale: 0.65, opacity: 0, y: 40, rotateX: 25 }}
          animate={{
            scale: phase >= 3 ? (phase >= 5 ? 1 : 0.95) : 0.65,
            opacity: phase >= 3 ? 1 : 0,
            y: phase >= 3 ? 0 : 40,
            rotateX: phase >= 4 ? [18, -4, 0] : 25,
            rotateY: phase >= 4 ? [-10, 8, 0] : 0,
          }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
        >
          {/* 3D Golden Halo Ring Behind Logo */}
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-amber-400/25 via-rose-500/20 to-amber-300/30 blur-2xl pointer-events-none"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: phase >= 3 ? [1, 1.3, 1.15] : 0.4,
              opacity: phase >= 3 ? 0.85 : 0,
            }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* 3D Emblem with Metallic Reflection Sweep */}
          <div className="relative transform-gpu">
            <DajjahLogo
              size="hero"
              withGlow={phase >= 4}
              customSize={window.innerWidth < 640 ? 190 : 240}
            />

            {/* Specular Light Sweep (Netflix Cinematic Lens Flare) */}
            {phase >= 4 && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                initial={{ x: '-130%', opacity: 0 }}
                animate={{ x: '150%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.1 }}
              >
                <div className="w-24 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent transform -skew-x-30 blur-[2px]" />
              </motion.div>
            )}
          </div>

          {/* Brand Name Typography Reveal (3D Gold Extrusion) */}
          <motion.div
            className="mt-6 flex flex-col items-center"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{
              opacity: phase >= 5 ? 1 : 0,
              y: phase >= 5 ? 0 : 24,
              scale: phase >= 5 ? 1 : 0.9,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
                ضَجّة مول
              </h1>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            {/* Slogan Reveal: "ضَجّة في وجه الغلاء" */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{
                opacity: phase >= 6 ? 1 : 0,
                y: phase >= 6 ? 0 : 12,
                filter: phase >= 6 ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={{ duration: 0.6 }}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-950/40 to-amber-500/15 border border-amber-400/30 shadow-lg shadow-black/50"
            >
              <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
              <p className="text-sm sm:text-base font-black text-amber-200 tracking-wide">
                ضَجّة في وجه الغلاء
              </p>
              <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 6 ? 0.75 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2.5 text-[11px] sm:text-xs text-neutral-400 font-semibold tracking-wider font-mono"
            >
              DAHJAH MALL • YEMEN & WORLDWIDE
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Bottom Loading Progress Bar */}
        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-40 sm:w-48 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-300"
              initial={{ width: '0%' }}
              animate={{ width: phase >= 6 ? '100%' : `${(phase / 6) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">جاري تجهيز المتجر والعروض الحصرية...</span>
        </div>
      </motion.div>
  );
};
