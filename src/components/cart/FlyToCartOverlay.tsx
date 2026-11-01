import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

export interface FlyEventDetail {
  id?: string;
  imageUrl: string;
  startX?: number;
  startY?: number;
}

interface FlyingParticle {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

/**
 * Lightweight safe haptic vibration wrapper for Android WebView
 */
export const safeHaptic = (pattern: number | number[] = 20) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Suppress any platform permission or security warnings
  }
};

/**
 * Triggers the Fly-to-Cart animation from anywhere in the app.
 * Defers measurement with requestAnimationFrame to prevent Layout Thrashing.
 */
export const triggerFlyToCart = (
  imageUrl: string,
  source?: { x: number; y: number } | HTMLElement | null
) => {
  // 1. Instant gentle haptic tap
  safeHaptic(15);

  // 2. Offload geometry measurement to requestAnimationFrame to prevent main-thread freeze
  requestAnimationFrame(() => {
    let startX: number | undefined;
    let startY: number | undefined;

    if (source) {
      try {
        if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
          const rect = source.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        } else if ('x' in source && 'y' in source) {
          startX = source.x;
          startY = source.y;
        }
      } catch {
        // Fallback safely
      }
    }

    window.dispatchEvent(
      new CustomEvent<FlyEventDetail>('dahjah:fly-to-cart', {
        detail: {
          id: `fly-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          imageUrl,
          startX,
          startY,
        },
      })
    );
  });
};

export const FlyToCartOverlay: React.FC = () => {
  const [particles, setParticles] = useState<FlyingParticle[]>([]);
  const targetPosCache = useRef<{ x: number; y: number } | null>(null);

  const handleFlyEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<FlyEventDetail>;
    const detail = customEvent.detail;
    if (!detail || !detail.imageUrl) return;

    // Use cached target or measure top header cart button (#btn-header-cart)
    let targetX = window.innerWidth - 56;
    let targetY = 28;

    try {
      const cartBtn = document.getElementById('btn-header-cart');
      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetPosCache.current = { x: targetX, y: targetY };
      } else if (targetPosCache.current) {
        targetX = targetPosCache.current.x;
        targetY = targetPosCache.current.y;
      }
    } catch {
      if (targetPosCache.current) {
        targetX = targetPosCache.current.x;
        targetY = targetPosCache.current.y;
      }
    }

    // Default start position if not provided
    const startX = detail.startX !== undefined ? detail.startX : window.innerWidth / 2;
    const startY = detail.startY !== undefined ? detail.startY : window.innerHeight * 0.72;

    const newParticle: FlyingParticle = {
      id: detail.id || `fly-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: detail.imageUrl,
      startX,
      startY,
      targetX,
      targetY,
    };

    setParticles((prev) => [...prev, newParticle]);
  }, []);

  useEffect(() => {
    window.addEventListener('dahjah:fly-to-cart', handleFlyEvent, { passive: true });
    return () => window.removeEventListener('dahjah:fly-to-cart', handleFlyEvent);
  }, [handleFlyEvent]);

  const onParticleComplete = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));

    // Request animation frame for smooth bounce without frame drops
    requestAnimationFrame(() => {
      // 1. Bounce header cart button
      const cartBtn = document.getElementById('btn-header-cart');
      if (cartBtn) {
        cartBtn.classList.remove('animate-cart-bounce');
        void cartBtn.offsetWidth; // Reflow trigger
        cartBtn.classList.add('animate-cart-bounce');
        setTimeout(() => cartBtn.classList.remove('animate-cart-bounce'), 500);
      }

      // 2. Bounce bottom navigation cart icon
      const bottomCart = document.getElementById('bottom-nav-cart');
      if (bottomCart) {
        bottomCart.classList.remove('animate-cart-bounce');
        void bottomCart.offsetWidth;
        bottomCart.classList.add('animate-cart-bounce');
        setTimeout(() => bottomCart.classList.remove('animate-cart-bounce'), 500);
      }

      // 3. Arrival feedback haptic
      safeHaptic([20, 25]);
    });
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              transform: `translate3d(${p.startX - 28}px, ${p.startY - 28}px, 0px) scale(1) rotate(0deg)`,
              opacity: 1,
            }}
            animate={{
              transform: `translate3d(${p.targetX - 14}px, ${p.targetY - 14}px, 0px) scale(0.24) rotate(-18deg)`,
              opacity: 0.65,
            }}
            exit={{
              transform: `translate3d(${p.targetX}px, ${p.targetY}px, 0px) scale(0.1)`,
              opacity: 0,
            }}
            transition={{
              duration: 0.42, // Ultra responsive 420ms
              ease: [0.18, 0.89, 0.32, 1.05], // Fast crisp curve
            }}
            onAnimationComplete={() => onParticleComplete(p.id)}
            className="absolute top-0 left-0 w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-neutral-900 shadow-2xl shadow-amber-500/40 ring-2 ring-amber-400/50 gpu-layer"
            style={{
              willChange: 'transform, opacity',
              transformOrigin: 'center center',
            }}
          >
            <img
              src={getOptimizedImageUrl(p.imageUrl, 'thumb')}
              alt="Flying Product"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
