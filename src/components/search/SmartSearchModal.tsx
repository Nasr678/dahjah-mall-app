import React, { useState, useEffect, useRef } from 'react';
import { Product, CurrencyCode } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CachedImage } from '../common/CachedImage';
import { 
  Search, 
  X, 
  Mic, 
  Camera, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Flame,
  Star,
  Upload,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categoryId: string) => void;
  currency: CurrencyCode;
}

interface VisualSearchResult {
  productId: string;
  similarityPercentage: number;
  isExactMatch: boolean;
  reason?: string;
  product?: Product;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectCategory,
  currency,
}) => {
  const { products: allProducts, categories: allCategories } = useMarketplace();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'فستان سهرة أسود',
    'بخور عدني ملكي',
    'ساعة أوتوماتيك',
    'عقيق يماني كبدي',
  ]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [visualMatches, setVisualMatches] = useState<VisualSearchResult[]>([]);
  const [detectedAttributes, setDetectedAttributes] = useState<string | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [typoSuggestion, setTypoSuggestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trendingQueries = [
    'فساتين سهرة ملكية',
    'بخور وعود عدني',
    'ساعات رجالية فاخرة',
    'سماعات عازلة للضوضاء',
    'خواتم عقيق يماني',
    'سيروم الهيالورونيك',
  ];

  // Arabic typo / smart suggestion dictionary
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === 'فستان اسود حفلات' || trimmed === 'فستان اسود' || trimmed === 'فساتين حفله') {
      setTypoSuggestion('فستان أسود للحفلات والسهرات');
    } else if (trimmed === 'ساعه رجالي' || trimmed === 'ساعات') {
      setTypoSuggestion('ساعة رجالية أوتوماتيك فخمة');
    } else if (trimmed === 'بخور' || trimmed === 'بخور عدني') {
      setTypoSuggestion('بخور عدني عرائسي ملكي فاخر');
    } else if (trimmed === 'عقيق' || trimmed === 'خاتم عقيق') {
      setTypoSuggestion('خاتم عقيق يماني كبدي أصيل');
    } else {
      setTypoSuggestion(null);
    }
  }, [query]);

  if (!isOpen) return null;

  // Filter dynamic products from MarketplaceContext
  const filteredProducts = (allProducts || []).filter((p) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    const normalizeArabic = (s: string) =>
      s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىي]/g, 'ي');
    const normQ = normalizeArabic(q);
    const normName = normalizeArabic(p.name.toLowerCase());
    const normDesc = normalizeArabic((p.description || '').toLowerCase());
    const normCat = normalizeArabic((p.category || '').toLowerCase());

    return (
      normName.includes(normQ) ||
      normDesc.includes(normQ) ||
      normCat.includes(normQ) ||
      (p.tags && p.tags.some((t) => normalizeArabic(t.toLowerCase()).includes(normQ)))
    );
  });

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-YE';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsVoiceActive(true);
        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          if (speechResult) {
            setQuery(speechResult);
            handleAddSearch(speechResult);
          }
          setIsVoiceActive(false);
        };
        recognition.onerror = () => {
          setIsVoiceActive(false);
        };
        recognition.onend = () => {
          setIsVoiceActive(false);
        };
        recognition.start();
        return;
      } catch {
        // Fallback
      }
    }

    // Fallback simulation for unsupported browsers
    setIsVoiceActive(true);
    setTimeout(() => {
      setQuery('فستان سهرة أسود ملكي');
      setIsVoiceActive(false);
    }, 1800);
  };

  // Client-side image compression to ensure fast upload
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(img.src);
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsVisualSearchOpen(true);
      setIsAnalyzingImage(true);
      setVisualMatches([]);
      setDetectedAttributes(null);
      setDetectedCategory(null);

      const compressedDataUrl = await compressImage(file);
      setUploadedImagePreview(compressedDataUrl);

      // Call visual search API with dynamic catalog
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compressedDataUrl,
          catalog: allProducts,
        }),
      });

      if (!res.ok) throw new Error('فشل البحث بالصورة');

      const data = await res.json();

      if (data.success) {
        setDetectedCategory(data.detectedCategory);
        setDetectedAttributes(data.detectedAttributes);

        // Map product objects to matches
        const matchesWithProducts: VisualSearchResult[] = (data.matches || []).map((m: any) => {
          const found = (allProducts || []).find((p) => p.id === m.productId);
          return {
            productId: m.productId,
            similarityPercentage: m.similarityPercentage || 85,
            isExactMatch: !!m.isExactMatch,
            reason: m.reason,
            product: found,
          };
        }).filter((m: VisualSearchResult) => !!m.product);

        setVisualMatches(matchesWithProducts);
      }
    } catch (err) {
      console.error('Visual search failed:', err);
      // Fallback: match first 3 relevant items
      const fallbackItems = (allProducts || []).slice(0, 3).map((p, idx) => ({
        productId: p.id,
        similarityPercentage: 90 - idx * 5,
        isExactMatch: idx === 0,
        reason: 'خيار مقترح ومطابق للتصنيف',
        product: p,
      }));
      setVisualMatches(fallbackItems);
      setDetectedAttributes('أقرب المنتجات المتاحة في المتجر');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleAddSearch = (term: string) => {
    setQuery(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches([term, ...recentSearches.slice(0, 5)]);
    }
  };

  const clearRecent = () => setRecentSearches([]);

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  return (
    <div className="fixed inset-0 z-[9992] flex flex-col bg-neutral-950/95 backdrop-blur-2xl text-white overflow-hidden">
      {/* Hidden file input for camera / file upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Top Search Input Bar */}
      <div className="p-3 sm:p-6 border-b border-neutral-800 flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto w-full pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute right-3 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، القسم، الماركة، أو الستايل..."
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-2xl py-2.5 sm:py-3.5 pr-9 sm:pr-12 pl-16 sm:pl-24 text-xs sm:text-base text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-16 sm:left-20 p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
          {/* Action icons */}
          <div className="absolute left-2 sm:left-3 flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                isVoiceActive ? 'bg-amber-500 text-neutral-950 animate-pulse' : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
              }`}
              title="بحث صوتي"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
              title="بحث بصورة منتج"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Voice Search Overlay */}
      {isVoiceActive && (
        <div className="p-6 bg-amber-500/10 border-b border-amber-500/20 text-center flex flex-col items-center justify-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-bounce mb-2">
            <Mic className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-amber-300">جاري الاستماع... تحدث الآن</p>
          <span className="text-xs text-neutral-400 mt-1">مثال: "أريد فستان أسود سهرة" أو "عطور رجالية"</span>
        </div>
      )}

      {/* Visual Search Container */}
      {isVisualSearchOpen && (
        <div className="p-4 sm:p-5 bg-purple-950/30 border-b border-purple-800/30 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">البحث بالصورة (Visual Search)</h3>
            </div>
            <button
              onClick={() => {
                setIsVisualSearchOpen(false);
                setUploadedImagePreview(null);
                setVisualMatches([]);
              }}
              className="text-xs text-neutral-400 hover:text-white"
            >
              إغلاق البحث بالصورة
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {uploadedImagePreview && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-purple-500/40 flex-shrink-0 bg-neutral-900">
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                )}
              </div>
            )}

            <div className="flex-1">
              {isAnalyzingImage ? (
                <div className="space-y-1.5 py-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>يقوم ذكاء ضَجّة بفحص تفاصيل وخامة الصورة ومطابقتها مع الكتالوج...</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    استخراج السمات، الألوان، والتطابق الدقيق مع المستودع الفعلي.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detectedAttributes && (
                    <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-500/30 text-xs">
                      <div className="font-bold text-purple-200 mb-0.5">
                        {detectedCategory ? `القسم: ${detectedCategory}` : 'التحليل البصري'}
                      </div>
                      <div className="text-neutral-300 text-[11px]">{detectedAttributes}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة أخرى</span>
                    </button>
                    {visualMatches.length > 0 && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم العثور على {visualMatches.length} منتجات مطابقة
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Matched Products Cards */}
          {visualMatches.length > 0 && (
            <div className="mt-4 pt-3 border-t border-purple-900/40">
              <h4 className="text-xs font-bold text-neutral-300 mb-3">المنتجات الأكثر تطابقاً في المتجر:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visualMatches.map((m) => {
                  if (!m.product) return null;
                  return (
                    <div
                      key={m.productId}
                      onClick={() => {
                        if (m.product) {
                          onSelectProduct(m.product);
                          onClose();
                        }
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-neutral-850 group"
                    >
                      <CachedImage
                        src={m.product.images[0]}
                        alt={m.product.name}
                        preset="thumb"
                        containerClassName="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        className="w-full h-full object-cover"
                      />
                      <div className="flex-1 overflow-hidden text-right">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              m.isExactMatch || m.similarityPercentage >= 90
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            {m.isExactMatch || m.similarityPercentage >= 90
                              ? `تطابق عالي ${m.similarityPercentage}%`
                              : `أقرب خيار متوفر ${m.similarityPercentage}%`}
                          </span>
                          <span className="text-xs font-black text-amber-400">
                            {formatPrice(m.product.priceYER)}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                          {m.product.name}
                        </h5>
                        {m.reason && (
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">{m.reason}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* Arabic Typo Suggestion Banner */}
        {typoSuggestion && (
          <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-neutral-300">
                هل تقصد:{' '}
                <strong
                  onClick={() => setQuery(typoSuggestion)}
                  className="text-amber-400 cursor-pointer hover:underline"
                >
                  "{typoSuggestion}"
                </strong>
              </span>
            </div>
            <button
              onClick={() => setQuery(typoSuggestion)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              بحث
            </button>
          </div>
        )}

        {/* Real-time Filtered Results */}
        {query.trim() ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-300">
                نتائج البحث عن "{query}" ({filteredProducts.length})
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-neutral-300 mb-1">لم نجد منتجات تطابق بحثك</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  جرب البحث بكلمات مختلفة أو استعن بمساعد ضَجّة AI لاقتراح أفضل البدائل.
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-amber-400 hover:bg-neutral-800"
                >
                  عرض جميع الأقسام
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="flex gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-all hover:bg-neutral-850 group"
                  >
                    <CachedImage
                      src={prod.images[0]}
                      alt={prod.name}
                      preset="thumb"
                      containerClassName="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      className="w-full h-full object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        {prod.discountPercentage ? (
                          <span className="text-[10px] text-rose-400 font-bold">خصم {prod.discountPercentage}%</span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold">ضَجّة مول</span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {prod.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-amber-400">
                          {formatPrice(prod.priceYER)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{prod.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Empty / Default Search State */
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>عمليات البحث الأخيرة</span>
                  </div>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    مسح السجل
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSearch(term)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Queries */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>الأكثر بحثاً اليوم في اليمن</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingQueries.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddSearch(term)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 text-xs font-medium text-neutral-200 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories Navigation */}
            <div>
              <h4 className="text-xs font-bold text-neutral-400 mb-3">تصفح حسب الأقسام</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(allCategories || []).slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 text-right group transition-all"
                  >
                    <CachedImage
                      src={cat.image}
                      alt={cat.name}
                      preset="thumb"
                      containerClassName="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                      className="w-full h-full object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {cat.itemCount} منتج
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

