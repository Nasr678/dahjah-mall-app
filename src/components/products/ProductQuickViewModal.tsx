import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Product, CurrencyCode } from '../../types';
import { CachedImage } from '../common/CachedImage';
import { triggerFlyToCart, safeHaptic } from '../cart/FlyToCartOverlay';
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
  ChevronRight, 
  Check, 
  AlertCircle, 
  Plus, 
  Minus,
  Barcode,
  Copy
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAddingAnimation, setIsAddingAnimation] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const imageRef = useRef<HTMLDivElement | null>(null);

  // Initialize selection when product opens or changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setValidationError(null);
      setIsAddingAnimation(false);
      setCopiedSku(false);
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];

  const productSku = product.sku || `DJH-${(product.category || 'GEN').slice(0, 3).toUpperCase()}-${product.id.replace(/^prod-/, '').toUpperCase()}`;

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
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (onShowToast) onShowToast('تم نسخ رابط المنتج بنجاح ✓');
      } catch {
        if (onShowToast) onShowToast('رابط المنتج: ' + window.location.href);
      }
    }
  };

  const validateSelection = (): boolean => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setValidationError('يرجى اختيار اللون أولاً');
      if (onShowToast) onShowToast('يرجى اختيار اللون');
      return false;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError('يرجى اختيار المقاس أولاً');
      if (onShowToast) onShowToast('يرجى اختيار المقاس');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    if (!validateSelection()) return;

    // 1. Instantly trigger visual flying animation & button state (Zero Lag)
    setIsAddingAnimation(true);
    triggerFlyToCart(images[activeImageIndex] || images[0], imageRef.current || (e.currentTarget as HTMLElement));

    // 2. Decouple cart update by ~100ms so animation launches at pure 60fps without state recalculation overhead
    setTimeout(() => {
      onAddToCart(product, {
        color: selectedColor,
        size: selectedSize,
        quantity,
      });

      if (onShowToast) {
        onShowToast(`تمت إضافة ${quantity} من "${product.name}" إلى السلة 🛍️`);
      }
    }, 100);

    // 3. Smoothly close bottom sheet after animation completes
    setTimeout(() => {
      setIsAddingAnimation(false);
      onClose();
    }, 420);
  };

  const handleBuyNowClick = () => {
    if (!validateSelection()) return;

    // Safe tactile haptic feedback
    safeHaptic([20, 25]);

    onBuyNow(product, {
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    onClose();
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center bg-neutral-950/50 backdrop-blur-md overflow-hidden p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-transparent cursor-pointer"
        aria-label="إغلاق الخلفية"
      />

      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-w-lg bg-white border-t sm:border border-neutral-200 rounded-t-3xl sm:rounded-3xl shadow-2xl text-neutral-900 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden z-10 gpu-layer"
      >
        {/* Top Drag Handle Bar (iOS / Modern Bottom Sheet style) */}
        <div className="w-full pt-2.5 pb-1 flex justify-center bg-white sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
        </div>

        {/* Top Header Bar: [إغلاق] [اسم مختصر] [المفضلة ومشاركة] */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold text-neutral-500 sm:inline hidden">إغلاق</span>
          </button>

          <span className="text-xs font-black text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>الشراء السريع</span>
          </span>

          <div className="flex items-center gap-1.5">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-full border transition-all active:scale-90 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-[#F6F7F9] border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title="المفضلة"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-[#F6F7F9] border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer active:scale-95"
              title="مشاركة المنتج"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Compact Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Main Visual & Info Header */}
          <div className="flex gap-3 sm:gap-4 items-start">
            {/* Interactive Image Gallery Carousel with Flipping */}
            <div 
              ref={imageRef}
              className="relative w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden bg-[#F3F4F6] border border-neutral-200/80 flex-shrink-0 shadow-sm group select-none"
            >
              <CachedImage
                src={images[activeImageIndex]}
                alt={product.name}
                preset="card"
                fallbackText={product.name}
                priority
                containerClassName="w-full h-full"
                className="w-full h-full object-cover object-center transition-all duration-200"
              />

              {/* Prev / Next controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 text-neutral-800 hover:bg-amber-400 hover:text-neutral-950 shadow-sm border border-neutral-200/80 transition-all cursor-pointer active:scale-90"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 text-neutral-800 hover:bg-amber-400 hover:text-neutral-950 shadow-sm border border-neutral-200/80 transition-all cursor-pointer active:scale-90"
                    aria-label="الصورة التالية"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Image Counter Badge (1/3) */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[9px] font-mono font-bold text-neutral-800 border border-neutral-200 shadow-sm tabular-nums">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {product.discountPercentage && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md tabular-nums">
                  <Flame className="w-2.5 h-2.5 fill-white" />
                  <span>{product.discountPercentage}%-</span>
                </div>
              )}
            </div>

            {/* Product Name, Rating & Price */}
            <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
              <div>
                <div className="flex items-center gap-1 text-[11px] text-amber-700 mb-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-500 text-[10px]">({product.reviewCount} تقييم)</span>
                </div>

                <h2 className="text-xs sm:text-sm font-black text-neutral-900 leading-snug line-clamp-2 mb-2">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-1 tabular-nums">
                  <span className="text-base sm:text-xl font-black text-neutral-950">
                    {formatPrice(product.priceYER)}
                  </span>
                  {product.originalPriceYER && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(product.originalPriceYER)}
                    </span>
                  )}
                </div>

                {/* Stock Tag */}
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-bold">متوفر في المستودع</span>
                  {product.stock <= 8 && (
                    <span className="text-amber-700 font-bold tabular-nums">
                      (متبقي {product.stock} فقط)
                    </span>
                  )}
                </div>

                {/* SKU Field for Inventory Management (رمز التخزين لإدارة الجرد) */}
                <div className="mt-2 pt-2 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-neutral-500 font-medium">رمز المخزون:</span>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await navigator.clipboard.writeText(productSku);
                          setCopiedSku(true);
                          safeHaptic(25);
                          setTimeout(() => setCopiedSku(false), 2000);
                          if (onShowToast) onShowToast(`تم نسخ رمز SKU (${productSku}) بنجاح ✓`);
                        } catch {}
                      }}
                      title="انقر لنسخ رمز المنتج (SKU)"
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F6F7F9] hover:bg-amber-50 border border-neutral-200 hover:border-amber-400 text-[10px] text-amber-800 transition-colors group cursor-pointer active:scale-95"
                    >
                      <Barcode className="w-3.5 h-3.5 text-amber-600 group-hover:scale-105 transition-transform" />
                      <span className="font-mono font-bold tracking-wider">{productSku}</span>
                      {copiedSku ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-neutral-400 group-hover:text-amber-700" />
                      )}
                    </button>
                  </div>
                  {product.brandName && (
                    <span className="text-[9px] text-neutral-600 bg-[#F6F7F9] px-1.5 py-0.5 rounded border border-neutral-200 truncate max-w-[100px] font-semibold">
                      {product.brandName}
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
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 w-fit mt-2 pt-1.5 border-t border-neutral-200/80 cursor-pointer active:scale-95 transition-transform"
              >
                <span>عرض التفاصيل الكاملة والتقييمات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery Strip (if > 1 image) */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-[#F3F4F6] ${
                    activeImageIndex === idx
                      ? 'border-amber-500 ring-2 ring-amber-400/30 scale-105'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <CachedImage
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-1.5 pt-2.5 border-t border-neutral-200/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">اللون:</span>
                <span className="text-amber-700 font-bold">{selectedColor || 'اختر اللون'}</span>
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
                        safeHaptic(15);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-neutral-950 ring-1 ring-amber-400/50'
                          : 'border-neutral-200 bg-[#F6F7F9] text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-700 mr-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-1.5 pt-2.5 border-t border-neutral-200/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">المقاس:</span>
                <span className="text-amber-700 font-bold">{selectedSize || 'اختر المقاس'}</span>
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
                        safeHaptic(15);
                      }}
                      className={`min-w-10 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                          : 'border-neutral-200 bg-[#F6F7F9] text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Total Price Preview */}
          <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/70 text-xs">
            <div>
              <span className="font-bold text-neutral-800 block">الكمية:</span>
              <span className="text-[11px] text-amber-700 font-bold tabular-nums">
                الإجمالي: {formatPrice((product.priceYER || 0) * quantity)}
              </span>
            </div>

            <div className="flex items-center bg-[#F6F7F9] border border-neutral-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => Math.max(1, q - 1));
                  safeHaptic(15);
                }}
                className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200/80 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                aria-label="إنقاص الكمية"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-black text-neutral-950 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => Math.min(product.stock || 99, q + 1));
                  safeHaptic(15);
                }}
                className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200/80 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                aria-label="زيادة الكمية"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fast Guarantee Strip */}
          <div className="p-3 rounded-xl bg-[#F6F7F9] border border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>توصيل فوري ومعاينة قبل الدفع</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ضمان أصلي 100%</span>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Buttons: [ أضف إلى السلة ] [ اشتري الآن ] */}
        <div className="p-3.5 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] border-t border-neutral-200 bg-white/95 backdrop-blur-xl flex items-center gap-2 sm:gap-3 z-30">
          {/* Add to Cart CTA with Fly Animation trigger */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border font-black text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer ${
              isAddingAnimation
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-900 text-white'
            }`}
          >
            {isAddingAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>

          {/* Buy Now CTA: Direct to Checkout */}
          <button
            type="button"
            onClick={handleBuyNowClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>اشتري الآن</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
