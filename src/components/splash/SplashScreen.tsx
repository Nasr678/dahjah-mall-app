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
  const resumePromiseRef = useRef<Promise<void> | null>(null);

  // Synthesize Netflix-style luxury cinematic impact sound using Web Audio API (0kb download, zero lag, works offline)
  const playCinematicAudio = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        const p = ctx.resume().catch(() => {});
        resumePromiseRef.current = p;
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
    // Failsafe watchdog timer: guarantees app launch within 2400ms on all devices (especially Xiaomi/Android)
    const failsafeTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    const timerSound = setTimeout(playCinematicAudio, 150);
    const timer1 = setTimeout(() => setPhase(2), 150);
    const timer2 = setTimeout(() => setPhase(3), 400);
    const timer3 = setTimeout(() => setPhase(4), 750);
    const timer4 = setTimeout(() => setPhase(5), 1100);
    const timer5 = setTimeout(() => setPhase(6), 1500);
    const timer6 = setTimeout(() => {
      setPhase(7);
      setTimeout(onComplete, 250);
    }, 1900);

    return () => {
      clearTimeout(failsafeTimer);
      clearTimeout(timerSound);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx) {
        const safeClose = () => {
          if (ctx.state !== 'closed') {
            try {
              ctx.close().catch(() => {});
            } catch {}
          }
        };
        if (resumePromiseRef.current) {
          resumePromiseRef.current.finally(safeClose);
        } else {
          safeClose();
        }
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#FAFBFD] via-[#F6F7F9] to-[#F2ECE0] text-neutral-950 overflow-hidden select-none cursor-pointer"
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
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-amber-700 transition-colors flex items-center gap-1.5 backdrop-blur-md shadow-sm"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline text-[11px]">مكتوم</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">صوت سينمائي</span>
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-amber-50 border border-amber-300 text-xs font-black text-amber-800 hover:text-amber-900 shadow-sm backdrop-blur-md transition-all active:scale-95"
          >
            <span>تخطي العرض</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Luxury Warm Gold Light Streaks (Ribbon Effect) */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Center Light Pillar (Anamorphic Beam) */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_24px_rgba(217,119,6,0.45)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase >= 2 ? [0, 1.4, 0.4] : 0,
              opacity: phase >= 2 ? [0, 0.9, 0.15] : 0,
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* Warm Champagne & Soft Gold Ambient Orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/30 via-amber-200/15 to-transparent blur-3xl transform-gpu" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-400/20 via-amber-100/20 to-transparent blur-3xl transform-gpu" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.10)_0%,rgba(246,247,249,0.4)_65%,#F6F7F9_100%)]" />
        </motion.div>

        {/* Subtle Shimmer Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 3 === 0 ? '4px' : '2.5px',
                height: i % 3 === 0 ? '4px' : '2.5px',
                backgroundColor: i % 2 === 0 ? '#d97706' : '#f59e0b',
                top: `${(i * 19) % 92}%`,
                left: `${(i * 23) % 94}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase >= 3 ? [0.15, 0.65, 0.15] : 0,
                scale: phase >= 3 ? [0.6, 1.3, 0.6] : 0,
                y: [0, -20, 0],
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

        {/* Master Container with GPU-accelerated smooth depth */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center p-6 text-center gpu-layer"
          initial={{ scale: 0.75, opacity: 0, y: 30 }}
          animate={{
            scale: phase >= 3 ? (phase >= 5 ? 1 : 0.95) : 0.75,
            opacity: phase >= 3 ? 1 : 0,
            y: phase >= 3 ? 0 : 30,
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Warm Golden Halo Ring Behind Logo */}
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-amber-300/35 via-amber-200/25 to-amber-400/30 blur-2xl pointer-events-none"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: phase >= 3 ? [1, 1.25, 1.1] : 0.4,
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

            {/* Specular Light Sweep */}
            {phase >= 4 && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                initial={{ x: '-130%', opacity: 0 }}
                animate={{ x: '150%', opacity: [0, 0.85, 0] }}
                transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.1 }}
              >
                <div className="w-24 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-30 blur-[2px]" />
              </motion.div>
            )}
          </div>

          {/* Brand Name Typography Reveal */}
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
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-950">
                ضَجّة مول
              </h1>
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
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
              className="mt-3 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 shadow-sm"
            >
              <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
              <p className="text-sm sm:text-base font-black text-amber-900 tracking-wide">
                ضَجّة في وجه الغلاء
              </p>
              <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 6 ? 0.85 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2.5 text-[11px] sm:text-xs text-neutral-500 font-semibold tracking-wider font-mono"
            >
              DAHJAH MALL • YEMEN & WORLDWIDE
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Bottom Loading Progress Bar */}
        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-40 sm:w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden border border-neutral-300/60">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500"
              initial={{ width: '0%' }}
              animate={{ width: phase >= 6 ? '100%' : `${(phase / 6) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-[10px] text-neutral-500 font-semibold">جاري تجهيز المتجر والعروض الحصرية...</span>
        </div>
      </motion.div>
  );
};
