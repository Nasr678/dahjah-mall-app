import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CurrencyCode } from '../../types';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { 
  X, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  Flame, 
  ShieldCheck, 
  Truck, 
  ChevronLeft, 
  Check,
  AlertCircle
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, options: { color: string; size: string; quantity: number }) => void;
  onBuyNow: (product: Product, options: { color: string; size: string; quantity: number }) => void;
  onOpenFullDetails: (product: Product) => void;
  onShowToast?: (message: string) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onOpenFullDetails,
  onShowToast,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAddingAnimation, setIsAddingAnimation] = useState(false);

  // Initialize selection when product opens or changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setValidationError(null);
      setIsAddingAnimation(false);
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `شاهد ${product.name} على ضَجّة مول بسعر ${formatPrice(product.priceYER)}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored if user dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (onShowToast) {
          onShowToast('تم نسخ رابط المنتج بنجاح ✓');
        }
      } catch (err) {
        if (onShowToast) {
          onShowToast('رابط المنتج: ' + window.location.href);
        }
      }
    }
  };

  const validateSelection = (): boolean => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setValidationError('يرجى اختيار اللون أولاً');
      if (onShowToast) onShowToast('يرجى اختيار المقاس واللون أولًا');
      return false;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError('يرجى اختيار المقاس أولاً');
      if (onShowToast) onShowToast('يرجى اختيار المقاس واللون أولًا');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCartClick = () => {
    if (!validateSelection()) return;

    setIsAddingAnimation(true);
    setTimeout(() => {
      onAddToCart(product, {
        color: selectedColor,
        size: selectedSize,
        quantity,
      });
      setIsAddingAnimation(false);
      onClose();
    }, 300);
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;

    onBuyNow(product, {
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-transparent cursor-pointer"
        aria-label="Close backdrop"
      />

      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden z-10"
      >
        {/* Top Header Bar: [←]                                [♡] [مشاركة] */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 p-2 -mr-1 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Back / Close"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold text-neutral-400 sm:inline hidden">إغلاق</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-full border transition-all active:scale-90 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-500'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
              title="المفضلة"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="مشاركة المنتج"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Compact Content - Optimized for mobile viewport without long scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Main Visual & Info Header */}
          <div className="flex gap-4 items-start">
            {/* Product Image */}
            <div className="relative w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex-shrink-0 shadow-inner">
              <img
                src={getOptimizedImageUrl(product.images[0], 'thumb')}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
              {product.discountPercentage && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md">
                  <Flame className="w-2.5 h-2.5 fill-white" />
                  <span>{product.discountPercentage}%-</span>
                </div>
              )}
            </div>

            {/* Product Name, Rating & Price */}
            <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
              <div>
                <div className="flex items-center gap-1 text-[11px] text-amber-400 mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-500 text-[10px]">({product.reviewCount} تقييم)</span>
                </div>

                <h2 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2 mb-2">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg sm:text-xl font-black text-amber-400">
                    {formatPrice(product.priceYER)}
                  </span>
                  {product.originalPriceYER && (
                    <span className="text-xs text-neutral-500 line-through">
                      {formatPrice(product.originalPriceYER)}
                    </span>
                  )}
                </div>

                {/* Stock Tag */}
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">متوفر في المستودع</span>
                  {product.stock <= 8 && (
                    <span className="text-amber-400 text-[10px]">
                      (متبقي {product.stock} فقط)
                    </span>
                  )}
                </div>
              </div>

              {/* Link to Full Details */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullDetails(product);
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 w-fit mt-2 pt-1 border-t border-neutral-800/80 cursor-pointer"
              >
                <span>تفاصيل أكثر والمواصفات الكاملة</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">اللون:</span>
                <span className="text-amber-400 font-bold">{selectedColor || 'اختر اللون'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setValidationError(null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400/50'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-400 mr-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">المقاس:</span>
                <span className="text-amber-400 font-bold">{selectedSize || 'اختر المقاس'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSize(s);
                        setValidationError(null);
                      }}
                      className={`min-w-10 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-400'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
            <span className="font-bold text-neutral-300">الكمية:</span>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="w-9 text-center text-sm font-black text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Fast Guarantee Strip */}
          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>توصيل فوري 24 ساعة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>معاينة قبل الدفع</span>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Buttons: [ أضف إلى السلة ] [ اشتري الآن ] */}
        <div className="p-3.5 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-xl flex items-center gap-2 sm:gap-3 z-30">
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border font-black text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer ${
              isAddingAnimation
                ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 hover:text-white'
            }`}
          >
            {isAddingAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNowClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>اشتري الآن</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
