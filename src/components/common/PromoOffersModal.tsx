import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Tag, Gift, ArrowLeft, Check, Copy } from 'lucide-react';
import { PopupOffer } from '../../types';
import { DEFAULT_POPUP_OFFER } from '../../data/mockData';

interface PromoOffersModalProps {
  offer?: PopupOffer | null;
  onOpenCategory?: (categoryId: string) => void;
  onOpenDeals?: () => void;
  onApplyCoupon?: (code: string) => void;
}

export const PromoOffersModal: React.FC<PromoOffersModalProps> = ({
  offer: customOffer,
  onOpenCategory,
  onOpenDeals,
  onApplyCoupon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const offer = customOffer || DEFAULT_POPUP_OFFER;

  useEffect(() => {
    if (!offer || offer.isActive === false) return;

    // Check frequency in localStorage
    const storageKey = `dajjah_popup_seen_${offer.id}`;
    const seenTimestamp = localStorage.getItem(storageKey);

    if (offer.showFrequency === 'once_per_session') {
      const sessionSeen = sessionStorage.getItem(storageKey);
      if (sessionSeen) return;
    } else if (offer.showFrequency === 'once_per_day' && seenTimestamp) {
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(seenTimestamp, 10) < oneDay) return;
    }

    const delay = (offer.delaySeconds || 2) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
      if (offer.showFrequency === 'once_per_session') {
        sessionStorage.setItem(storageKey, 'true');
      } else {
        localStorage.setItem(storageKey, Date.now().toString());
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [offer]);

  if (!isOpen || !offer || offer.isActive === false) return null;

  const handleCopyCoupon = () => {
    if (offer.couponCode) {
      navigator.clipboard.writeText(offer.couponCode);
      setCopied(true);
      if (onApplyCoupon) onApplyCoupon(offer.couponCode);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCtaClick = () => {
    setIsOpen(false);
    if (offer.couponCode && onApplyCoupon) {
      onApplyCoupon(offer.couponCode);
    }
    if (offer.linkType === 'category' && onOpenCategory) {
      onOpenCategory(offer.linkTarget || 'women');
    } else if (onOpenDeals) {
      onOpenDeals();
    }
  };

  return (
    <div 
      id="promo-popup-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-md"
    >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl text-right select-none"
          id="promo-popup-card"
        >
          {/* Close button */}
          <button
            type="button"
            id="btn-close-promo-popup"
            onClick={() => setIsOpen(false)}
            className="absolute top-3 left-3 z-30 p-1.5 rounded-full bg-white/90 border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-white transition-colors cursor-pointer shadow-md"
            aria-label="إغلاق الإعلان"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top image or visual header */}
          <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-[#F3F4F6]">
            <img
              src={offer.imageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop'}
              alt={offer.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent" />
            
            {offer.discountPercentage ? (
              <div className="absolute bottom-2 right-3 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-black text-xs shadow-md flex items-center gap-1.5 animate-bounce tabular-nums">
                <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>خصم {offer.discountPercentage}%</span>
              </div>
            ) : (
              <div className="absolute bottom-2 right-3 px-3 py-1 rounded-full bg-neutral-900 text-amber-300 font-black text-xs shadow-md flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>عرض خاص</span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>ضَجّة مول — عرض محدود</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-neutral-950 leading-tight">
                {offer.title}
              </h3>
              {offer.subtitle && (
                <p className="text-xs font-bold text-neutral-700">
                  {offer.subtitle}
                </p>
              )}
              <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                {offer.description}
              </p>
            </div>

            {/* Coupon Box (if coupon available) */}
            {offer.couponCode && (
              <div className="p-2.5 rounded-2xl bg-[#F6F7F9] border border-dashed border-amber-500/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  id="btn-copy-popup-coupon"
                  onClick={handleCopyCoupon}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكوبون</span>
                    </>
                  )}
                </button>
                <div className="text-left font-mono font-black text-amber-800 text-sm tracking-wider px-2">
                  {offer.couponCode}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              type="button"
              id="btn-popup-cta-shop"
              onClick={handleCtaClick}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 text-neutral-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{offer.ctaText || 'تسوّق واستفد من العرض الآن'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
  );
};
