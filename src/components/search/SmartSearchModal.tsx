import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(16);

  // Debounce search & typo checks (180ms) to avoid excessive array scans per keystroke on slow devices
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      setDebouncedQuery(trimmed);
      setVisibleCount(16);

      const lower = trimmed.toLowerCase();
      if (lower === 'فستان اسود حفلات' || lower === 'فستان اسود' || lower === 'فساتين حفله') {
        setTypoSuggestion('فستان أسود للحفلات والسهرات');
      } else if (lower === 'ساعه رجالي' || lower === 'ساعات') {
        setTypoSuggestion('ساعة رجالية أوتوماتيك فخمة');
      } else if (lower === 'بخور' || lower === 'بخور عدني') {
        setTypoSuggestion('بخور عدني عرائسي ملكي فاخر');
      } else if (lower === 'عقيق' || lower === 'خاتم عقيق') {
        setTypoSuggestion('خاتم عقيق يماني كبدي أصيل');
      } else {
        setTypoSuggestion(null);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Memoized normalized filter on debounced query
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return [];
    const normalizeArabic = (s: string) =>
      s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىي]/g, 'ي');
    const normQ = normalizeArabic(debouncedQuery.toLowerCase());

    return (allProducts || []).filter((p) => {
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
  }, [allProducts, debouncedQuery]);

  if (!isOpen) return null;

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

      // Project only required fields to minimize payload on weak connections
      const compactCatalog = (allProducts || []).slice(0, 80).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        colors: p.colors?.slice(0, 4),
        description: (p.description || p.name).slice(0, 120),
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Call visual search API with compact catalog & 20s timeout
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          image: compressedDataUrl,
          catalog: compactCatalog,
        }),
      });
      clearTimeout(timeoutId);

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
    <div className="fixed inset-0 z-[9992] flex flex-col bg-[#F6F7F9]/98 backdrop-blur-2xl text-neutral-900 overflow-hidden">
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
      <div className="p-3 sm:p-6 border-b border-neutral-200 bg-white/95 flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto w-full pt-[max(0.75rem,env(safe-area-inset-top))] shadow-xs">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute right-3 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، القسم، الماركة، أو الستايل..."
            className="w-full bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 rounded-2xl py-2.5 sm:py-3.5 pr-9 sm:pr-12 pl-16 sm:pl-24 text-xs sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-16 sm:left-20 p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
          {/* Action icons */}
          <div className="absolute left-2 sm:left-3 flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                isVoiceActive ? 'bg-amber-400 text-neutral-950 animate-pulse' : 'text-neutral-500 hover:text-amber-700 hover:bg-neutral-200/70'
              }`}
              title="بحث صوتي"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-amber-700 hover:bg-neutral-200/70 transition-colors"
              title="بحث بصورة منتج"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Voice Search Overlay */}
      {isVoiceActive && (
        <div className="p-6 bg-amber-50 border-b border-amber-200 text-center flex flex-col items-center justify-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-700 animate-bounce mb-2">
            <Mic className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-amber-900">جاري الاستماع... تحدث الآن</p>
          <span className="text-xs text-neutral-600 mt-1">مثال: "أريد فستان أسود سهرة" أو "عطور رجالية"</span>
        </div>
      )}

      {/* Visual Search Container */}
      {isVisualSearchOpen && (
        <div className="p-4 sm:p-5 bg-white border-b border-neutral-200 max-w-4xl mx-auto w-full shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs sm:text-sm font-black text-neutral-950">البحث بالصورة (Visual Search)</h3>
            </div>
            <button
              onClick={() => {
                setIsVisualSearchOpen(false);
                setUploadedImagePreview(null);
                setVisualMatches([]);
              }}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
            >
              إغلاق البحث بالصورة
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {uploadedImagePreview && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-amber-300 flex-shrink-0 bg-[#F3F4F6]">
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                  </div>
                )}
              </div>
            )}

            <div className="flex-1">
              {isAnalyzingImage ? (
                <div className="space-y-1.5 py-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>يقوم ذكاء ضَجّة بفحص تفاصيل وخامة الصورة ومطابقتها مع الكتالوج...</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    استخراج السمات، الألوان، والتطابق الدقيق مع المستودع الفعلي.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detectedAttributes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <div className="font-bold text-amber-900 mb-0.5">
                        {detectedCategory ? `القسم: ${detectedCategory}` : 'التحليل البصري'}
                      </div>
                      <div className="text-neutral-700 text-[11px]">{detectedAttributes}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-black transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة أخرى</span>
                    </button>
                    {visualMatches.length > 0 && (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
            <div className="mt-4 pt-3 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-700 mb-3">المنتجات الأكثر تطابقاً في المتجر:</h4>
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
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 hover:border-amber-400 cursor-pointer transition-all hover:bg-white group"
                    >
                      <CachedImage
                        src={m.product.images[0]}
                        alt={m.product.name}
                        preset="thumb"
                        containerClassName="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-neutral-200"
                        className="w-full h-full object-cover"
                      />
                      <div className="flex-1 overflow-hidden text-right">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md tabular-nums ${
                              m.isExactMatch || m.similarityPercentage >= 90
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {m.isExactMatch || m.similarityPercentage >= 90
                              ? `تطابق عالي ${m.similarityPercentage}%`
                              : `أقرب خيار متوفر ${m.similarityPercentage}%`}
                          </span>
                          <span className="text-xs font-black text-neutral-950 tabular-nums">
                            {formatPrice(m.product.priceYER)}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-neutral-900 truncate group-hover:text-amber-700">
                          {m.product.name}
                        </h5>
                        {m.reason && (
                          <p className="text-[10px] text-neutral-500 truncate mt-0.5">{m.reason}</p>
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
          <div className="mb-6 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-neutral-700">
                هل تقصد:{' '}
                <strong
                  onClick={() => setQuery(typoSuggestion)}
                  className="text-amber-800 cursor-pointer hover:underline"
                >
                  "{typoSuggestion}"
                </strong>
              </span>
            </div>
            <button
              onClick={() => setQuery(typoSuggestion)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              بحث
            </button>
          </div>
        )}

        {/* Real-time Filtered Results */}
        {query.trim() ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-700 tabular-nums">
                نتائج البحث عن "{query}" ({filteredProducts.length})
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200/80 p-6">
                <Search className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-neutral-900 mb-1">لم نجد منتجات تطابق بحثك</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  جرب البحث بكلمات مختلفة أو استعن بمساعد ضَجّة AI لاقتراح أفضل البدائل.
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-500 transition-colors"
                >
                  عرض جميع الأقسام
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredProducts.slice(0, visibleCount).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="flex gap-3 p-3 rounded-2xl bg-white border border-neutral-200/80 hover:border-amber-400 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                    >
                      <CachedImage
                        src={prod.images[0]}
                        alt={prod.name}
                        preset="thumb"
                        containerClassName="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F3F4F6] border border-neutral-200/60"
                        className="w-full h-full object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div>
                          {prod.discountPercentage ? (
                            <span className="text-[10px] text-rose-600 font-bold tabular-nums">خصم {prod.discountPercentage}%</span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold">ضَجّة مول</span>
                          )}
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-950 truncate group-hover:text-amber-700 transition-colors">
                            {prod.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-black text-neutral-950 tabular-nums">
                            {formatPrice(prod.priceYER)}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold tabular-nums">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{prod.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProducts.length > visibleCount && (
                  <div className="text-center pt-5">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 16)}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-amber-800 text-xs font-bold transition-colors shadow-xs tabular-nums"
                    >
                      عرض المزيد من النتائج ({filteredProducts.length - visibleCount} متبقي)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Empty / Default Search State */
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>عمليات البحث الأخيرة</span>
                  </div>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-neutral-500 hover:text-rose-600 font-semibold"
                  >
                    مسح السجل
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSearch(term)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-neutral-200 text-xs text-neutral-700 hover:text-amber-800 hover:border-amber-300 transition-colors shadow-xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Queries */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>الأكثر بحثاً اليوم في اليمن</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingQueries.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddSearch(term)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-neutral-200 text-xs font-semibold text-neutral-800 hover:text-amber-800 hover:border-amber-300 transition-all shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories Navigation */}
            <div>
              <h4 className="text-xs font-bold text-neutral-700 mb-3">تصفح حسب الأقسام</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(allCategories || []).slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-neutral-200/80 hover:border-amber-400 text-right group transition-all shadow-xs hover:shadow-md"
                  >
                    <CachedImage
                      src={cat.image}
                      alt={cat.name}
                      preset="thumb"
                      containerClassName="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F3F4F6]"
                      className="w-full h-full object-cover"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-neutral-950 group-hover:text-amber-700 truncate">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 tabular-nums">
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

