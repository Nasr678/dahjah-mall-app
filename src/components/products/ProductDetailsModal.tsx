import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CurrencyCode, Review } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from './ProductCard';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { createWhatsAppLink, createProductInquiryWhatsAppMessage } from '../../utils/whatsappHelper';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  MessageCircle,
  ThumbsUp,
  MapPin,
  Lock,
  LogIn,
  CheckCircle2,
  Filter,
  UserCheck,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, options?: { color?: string; size?: string; quantity?: number }) => void;
  onBuyNow: (product: Product, options?: { color?: string; size?: string; quantity?: number }) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAuth?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: 'استثنائي وفائق الروعة (5 من 5)',
  4: 'ممتاز وأنصح به بشدة (4 من 5)',
  3: 'جيد ومناسب للاستخدام (3 من 5)',
  2: 'أقل من المتوقع (2 من 5)',
  1: 'ضعيف جداً ولا يلبي التوقعات (1 من 5)',
};

const QUICK_REVIEW_TAGS = [
  'خامة وجودة ممتازة',
  'توصيل سريع وفي الموعد',
  'مطابق للصور تماماً',
  'تغليف أنيق ومحمي',
  'سعر مناسب ومنافس',
  'مقاس مضبوط بدقة'
];

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  currency,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  onOpenAuth,
}) => {
  const { 
    products: allCatalogProducts, 
    appSettings,
    currentUser,
    isAdmin,
    hasUserPurchasedProduct,
    submitProductReview
  } = useMarketplace();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Rating & Review form states
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [reviewsList, setReviewsList] = useState<Review[]>(product?.reviews || []);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // Sync state if product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setReviewsList(product.reviews || []);
      setActiveTab('details');
      setNewReviewRating(5);
      setHoveredRating(0);
      setNewReviewComment('');
      setReviewMessage(null);
      setSelectedStarFilter('all');
    }
  }, [product?.id]);

  if (!product) return null;

  // Check if current user has purchased the product
  const hasPurchased = hasUserPurchasedProduct(product.id);

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  // Review statistics & breakdown calculations
  const totalReviewsCount = reviewsList.length;
  const averageRating = useMemo(() => {
    if (totalReviewsCount === 0) return product.rating || 5;
    const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((sum / totalReviewsCount).toFixed(1));
  }, [reviewsList, totalReviewsCount, product.rating]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviewsList]);

  const satisfactionPercentage = useMemo(() => {
    if (totalReviewsCount === 0) return 98;
    const positiveCount = (ratingCounts[5] || 0) + (ratingCounts[4] || 0);
    return Math.round((positiveCount / totalReviewsCount) * 100);
  }, [ratingCounts, totalReviewsCount]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedStarFilter === 'all') return reviewsList;
    return reviewsList.filter((r) => Math.round(r.rating || 5) === selectedStarFilter);
  }, [reviewsList, selectedStarFilter]);

  const handleToggleQuickTag = (tag: string) => {
    setNewReviewComment((prev) => {
      if (prev.includes(tag)) {
        return prev.replace(tag, '').replace(/\s{2,}/g, ' ').trim();
      }
      return prev ? `${prev} - ${tag}` : tag;
    });
  };

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      setReviewMessage({ type: 'error', text: 'يرجى كتابة تعليق أو تجربة حول المنتج قبل النشر.' });
      return;
    }

    if (!currentUser) {
      setReviewMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً لتتمكن من إضافة تقييمك.' });
      return;
    }

    if (!hasPurchased && !isAdmin) {
      setReviewMessage({ 
        type: 'error', 
        text: 'عذراً، التقييم متاح فقط للمشترين الموثقين الذين اشتروا هذا المنتج سابقاً.' 
      });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await submitProductReview(
        product.id,
        newReviewRating,
        newReviewComment
      );

      if (res.success && res.review) {
        setReviewsList((prev) => [res.review!, ...prev]);
        setNewReviewComment('');
        setReviewMessage({ type: 'success', text: res.message });
        setTimeout(() => setReviewMessage(null), 5000);
      } else {
        setReviewMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setReviewMessage({
        type: 'error',
        text: err?.message || 'حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً.'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const switchToReviewsTab = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const similarProducts = (allCatalogProducts || []).filter(
    (p) => p.id !== product.id && (p.category === product.category || p.storeId === product.storeId)
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-[9994] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Top Sticky Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">ضَجّة مول — منتج أصلي ومضمون</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-full border transition-colors ${
                isFavorite
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
              title="المفضلة"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: `تسوق ${product.name} على ضَجّة مول بأفضل سعر!`,
                    url: window.location.href,
                  }).catch(() => {});
                }
              }}
              className="p-2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {/* Main Visual & Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner group">
                <img
                  src={getOptimizedImageUrl(product.images[activeImageIndex] || product.images[0], 'card')}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Discount Badge */}
                {product.discountPercentage && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-lg">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>خصم {product.discountPercentage}%</span>
                  </div>
                )}

                {/* Left/Right navigation for images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) => (prev - 1 + product.images.length) % product.images.length
                        )
                      }
                      className="absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-amber-500 hover:text-neutral-950 backdrop-blur-sm transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev + 1) % product.images.length)
                      }
                      className="absolute top-1/2 -translate-y-1/2 left-2 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-amber-500 hover:text-neutral-950 backdrop-blur-sm transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === i
                          ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={getOptimizedImageUrl(img, 'thumb')} 
                        alt="" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Controls */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug mb-2.5">
                  {product.name}
                </h1>

                {/* Rating & Reviews summary with interactive click */}
                <button
                  type="button"
                  onClick={switchToReviewsTab}
                  className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800 hover:text-white transition-colors group cursor-pointer text-right w-full"
                  title="انقر لعرض آراء المشترين أو كتابة تقييمك"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                    <div className="flex text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-black text-amber-300">{averageRating}</span>
                  </div>

                  <span className="text-neutral-300 font-semibold group-hover:text-amber-400 underline decoration-amber-500/30 transition-colors">
                    ({totalReviewsCount} تقييم مشترين)
                  </span>

                  <span className="text-neutral-600">•</span>

                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متوفر في المستودع</span>
                  </span>
                </button>

                {/* Pricing Box */}
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between mb-5">
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">السعر الحصري</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-amber-400">
                        {formatPrice(product.priceYER)}
                      </span>
                      {product.originalPriceYER && (
                        <span className="text-sm text-neutral-500 line-through">
                          {formatPrice(product.originalPriceYER)}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.originalPriceYER && (
                    <div className="text-right">
                      <span className="text-[11px] text-neutral-400 block">وفرت معنا</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-400">
                        {formatPrice(product.originalPriceYER - product.priceYER)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      اللون المختار:{' '}
                      <span className="text-amber-400 font-normal">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            selectedColor === c.name
                              ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      المقاس المختار:{' '}
                      <span className="text-amber-400 font-normal">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            selectedSize === s
                              ? 'border-amber-500 bg-amber-500 text-neutral-950 shadow-md'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="flex items-center gap-4 mb-5">
                  <label className="text-xs font-bold text-neutral-300">الكمية:</label>
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-black text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-neutral-500">
                    (المتبقي بالمخزون: {product.stock} قطعة)
                  </span>
                </div>

                {/* Fast Shipping Promise Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      توصيل فوري خلال <strong>24 ساعة</strong> إلى صنعاء، عدن، وجميع المحافظات.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <RotateCcw className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>ضمان استبدال ومعاينة عند الاستلام قبل الدفع.</span>
                  </div>
                </div>

                {/* 1-Click WhatsApp Inquiry & Order */}
                <a
                  href={createWhatsAppLink(
                    appSettings?.contactWhatsapp,
                    createProductInquiryWhatsAppMessage(product.name, formatPrice(product.priceYER), product.id)
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-3 py-2.5 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>طلب فوري واستفسار مباشر عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>

          {/* Tab Navigation (Details / Specs / Reviews) */}
          <div ref={reviewsSectionRef} className="pt-6 border-t border-neutral-800">
            <div className="flex border-b border-neutral-800 mb-5 gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${
                  activeTab === 'details' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                الوصف والمميزات
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${
                  activeTab === 'specs' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                المواصفات الفنية
                {activeTab === 'specs' && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'reviews' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>آراء وتقييمات العملاء</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {reviewsList.length}
                </span>
                {activeTab === 'reviews' && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'details' && (
              <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                <p>{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-white mb-2">أبرز المزايا:</h4>
                    <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                      {product.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-hidden rounded-2xl border border-neutral-800">
                <table className="w-full text-xs sm:text-sm text-right">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-neutral-950/60' : 'bg-neutral-900/60'}
                      >
                        <td className="p-3 font-bold text-neutral-400 border-b border-neutral-800/60 w-1/3">
                          {key}
                        </td>
                        <td className="p-3 text-white border-b border-neutral-800/60">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* 1. Rating Summary & Interactive Stars Breakdown Dashboard */}
                <div className="p-4 sm:p-6 rounded-3xl bg-neutral-950/90 border border-neutral-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Overall Score */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
                    <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
                      <span>{averageRating}</span>
                      <span className="text-lg font-bold text-neutral-500">/ 5</span>
                    </div>

                    <div className="flex text-amber-400 gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            s <= Math.round(averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-neutral-300">
                      مبني على {totalReviewsCount} تقييم حقيقي
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{satisfactionPercentage}% من المشترين يوصون بهذا المنتج</span>
                    </div>
                  </div>

                  {/* Right Column: Star Breakdown Bars */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                      <span className="font-bold text-neutral-300">تفاصيل تقييمات النجوم:</span>
                      {selectedStarFilter !== 'all' && (
                        <button
                          onClick={() => setSelectedStarFilter('all')}
                          className="text-amber-400 hover:underline text-[11px] font-bold"
                        >
                          عرض كل التقييمات
                        </button>
                      )}
                    </div>

                    {[5, 4, 3, 2, 1].map((starNum) => {
                      const count = ratingCounts[starNum] || 0;
                      const percentage = totalReviewsCount > 0 
                        ? Math.round((count / totalReviewsCount) * 100) 
                        : (starNum === 5 ? 85 : starNum === 4 ? 15 : 0);
                      const isSelected = selectedStarFilter === starNum;

                      return (
                        <button
                          key={starNum}
                          type="button"
                          onClick={() => setSelectedStarFilter(isSelected ? 'all' : starNum)}
                          className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all text-xs ${
                            isSelected 
                              ? 'bg-amber-500/15 border border-amber-500/40' 
                              : 'hover:bg-neutral-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-1 w-12 text-neutral-300 flex-shrink-0 font-bold">
                            <span>{starNum}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>

                          <div className="flex-1 h-2.5 rounded-full bg-neutral-800 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                starNum >= 4 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-neutral-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="w-12 text-left text-[11px] text-neutral-400 flex-shrink-0">
                            <span>{percentage}%</span>
                            <span className="text-neutral-500 text-[10px] mr-1">({count})</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Rating & Review Interactive Box with Verified Purchase Protection */}
                {!currentUser ? (
                  // State A: User is not logged in
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        سجل دخولك لتقييم المنتجات التي اشتريتها
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
                        نظام التقييم والنجوم في ضَجّة مول مخصص لعملائنا الموثقين بعد تجربة الشراء لضمان تقديم مراجعات حقيقية موثوقة بنسبة 100%.
                      </p>
                    </div>
                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>تسجيل الدخول / إنشاء حساب</span>
                      </button>
                    )}
                  </div>
                ) : !hasPurchased && !isAdmin ? (
                  // State B: Logged in, but hasn't purchased this product
                  <div className="p-4 sm:p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            التقييم بالنجوم متاح فقط للمشترين الموثقين
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                            ضمان المصداقية
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                          مرحباً بك يا <strong>{currentUser.name}</strong>. للحفاظ على الشفافية وحماية حقوق المتسوقين، يتم فتح إمكانية تقييم المنتج ونشر المراجعة فور طلب المنتج واستلامه.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() =>
                          onAddToCart(product, {
                            color: selectedColor,
                            size: selectedSize,
                            quantity,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                        <span>إضافة للسلة لتجربته وتقييمه</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onBuyNow(product, {
                            color: selectedColor,
                            size: selectedSize,
                            quantity,
                          });
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors"
                      >
                        شراء المنتج الآن
                      </button>
                    </div>
                  </div>
                ) : (
                  // State C: User has purchased the product (or is Admin) -> Full Rating System Form
                  <form
                    onSubmit={handleAddReview}
                    className="p-5 sm:p-6 rounded-3xl bg-neutral-950 border border-amber-500/30 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Verified Buyer Top Banner */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-emerald-400 block">
                            {isAdmin && !hasPurchased
                              ? 'صلاحية الإدارة — إضافة تقييم معتمد'
                              : '✓ مشتري موثق — يمكنك الآن تقييم هذا المنتج'}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            شارك رأيك الحقيقي حول جودة المنتج ومطابقته للتوقعات
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">
                        {currentUser.name}
                      </span>
                    </div>

                    {/* Interactive 5 Stars Picker with dynamic feedback */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <label className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>اختر تقييمك بالنجوم (1 إلى 5):</span>
                        </label>
                        <span className="text-xs font-bold text-amber-400">
                          {RATING_LABELS[hoveredRating || newReviewRating]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const activeVal = hoveredRating || newReviewRating;
                            const isFilled = star <= activeVal;

                            return (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setNewReviewRating(star)}
                                className="p-1 rounded-xl transition-transform active:scale-125 focus:outline-none"
                                title={`تقييم ${star} نجوم`}
                              >
                                <Star
                                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                    isFilled
                                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                      : 'text-neutral-700 hover:text-amber-400/50'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs text-neutral-500 mr-2 border-r border-neutral-800 pr-3">
                          انقر على النجمة لتثبيت التقييم
                        </span>
                      </div>
                    </div>

                    {/* Quick Tags for Instant Feedback */}
                    <div>
                      <span className="text-[11px] font-bold text-neutral-400 block mb-2">
                        عبارات سريعة يمكنك إضافتها بنقرة واحدة:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_REVIEW_TAGS.map((tag) => {
                          const isTagActive = newReviewComment.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleQuickTag(tag)}
                              className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                                isTagActive
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                              }`}
                            >
                              {tag} {isTagActive ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Written Review Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white block">
                        ملاحظاتك ومراجعتك المكتوبة (اختياري / مفصل):
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="اكتب تقييمك الصادق، جودة الخامة، التغليف، وتجربة التوصيل لمساعدة المشترين الآخرين..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Status Feedback Notice */}
                    {reviewMessage && (
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                          reviewMessage.type === 'success'
                            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {reviewMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span>{reviewMessage.text}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-500">
                        سيتم نشر تقييمك وربطه بملفك كمشتري موثق فوراً
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmittingReview || !newReviewComment.trim()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                            <span>جاري النشر...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-neutral-950" />
                            <span>نشر التقييم الآن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. Customer Reviews List with Star Filter Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>قائمة آراء المتسوقين</span>
                      {selectedStarFilter !== 'all' && (
                        <span className="text-xs text-amber-400 font-normal">
                          (فلترة: {selectedStarFilter} نجوم)
                        </span>
                      )}
                    </h4>

                    <span className="text-xs text-neutral-400">
                      عرض {filteredReviews.length} من {totalReviewsCount}
                    </span>
                  </div>

                  {filteredReviews.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-neutral-950/40 border border-neutral-800 text-neutral-400 space-y-2">
                      <p className="text-xs sm:text-sm">لا توجد مراجعات تطابق الفلتر المحدد حالياً.</p>
                      <button
                        onClick={() => setSelectedStarFilter('all')}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        إعادة تعيين الفلتر وعرض جميع المراجعات
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2.5 transition-all hover:border-neutral-700"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {rev.userAvatar ? (
                                <img
                                  src={rev.userAvatar}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-amber-400">
                                  {rev.userName ? rev.userName[0] : 'ع'}
                                </div>
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">
                                    {rev.userName}
                                  </span>
                                  {rev.verifiedPurchase && (
                                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40 font-semibold inline-flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      <span>مشتري موثق</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] text-neutral-500">{rev.date}</span>
                          </div>

                          {/* Star Row */}
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400 gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= Math.round(rev.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-neutral-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-neutral-300">
                              {rev.rating} من 5
                            </span>
                          </div>

                          {/* Review comment */}
                          <p className="text-xs text-neutral-200 leading-relaxed">
                            {rev.comment}
                          </p>

                          {/* Helpful button */}
                          <div className="flex items-center justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleHelpfulClick(rev.id)}
                              className="text-[11px] text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>مفيد ({helpfulVotes[rev.id] || 0})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-6 border-t border-neutral-800">
              <h3 className="text-base font-black text-white mb-4">
                منتجات مشابهة قد تعجبك
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarProducts.map((simProd) => (
                  <ProductCard
                    key={simProd.id}
                    product={simProd}
                    currency={currency}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavorite}
                    onAddToCart={onAddToCart}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-xl flex items-center gap-2 sm:gap-3 z-30">
          <button
            type="button"
            onClick={() => {
              onAddToCart(product, {
                color: selectedColor,
                size: selectedSize,
                quantity,
              });
              setIsAddedToCart(true);
              setTimeout(() => setIsAddedToCart(false), 1400);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer ${
              isAddedToCart
                ? 'bg-emerald-500 text-neutral-950 border border-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
          >
            {isAddedToCart ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>تمت الإضافة إلى السلة بنجاح!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onBuyNow(product, {
                color: selectedColor,
                size: selectedSize,
                quantity,
              });
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>اشترِ الآن فوراً</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
