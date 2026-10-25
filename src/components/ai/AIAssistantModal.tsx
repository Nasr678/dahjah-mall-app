import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CurrencyCode } from '../../types';
import { PRODUCTS } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';
import { firestoreCatalogService } from '../../services/firebase';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ShoppingCart, 
  ArrowLeft, 
  Flame, 
  HelpCircle,
  RefreshCw,
  Star,
  CheckCircle2
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isStreaming?: boolean;
  isSearchingProducts?: boolean;
  suggestedProductIds?: string[];
  resolvedProducts?: Product[];
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSelectProduct,
  onAddToCart,
}) => {
  const { products: contextProducts, appSettings } = useMarketplace();
  const allAvailableProducts = (contextProducts && contextProducts.length > 0) ? contextProducts : PRODUCTS;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'مرحباً بك في مساعد ضَجّة AI! 🌷 أنا هنا لمساعدتك في كل ما يخص التسوق، الإجابة على استفساراتك، ومساعدتك في البحث عن أفضل الأزياء والمنتجات. كيف أقدر أساعدك اليوم؟',
      suggestedProductIds: [],
      timestamp: 'الآن',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);

  const quickPrompts = [
    '👗 أريد فستان سهرة فخم لمناسبة بحدود 20,000 ريال',
    '👠 أحتاج حذاء كعب مريح وفاخر للمناسبات',
    '👜 وريني شنطة يد نسائية جلد إيطالي',
    '👦 أطقم ولادي كاجوال صيفية',
    '💳 ما هي طرق الدفع المتاحة؟',
    '📦 كيف أتابع حالة طلبي؟'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Stream text generator helper: streams text progressively for immediate high-responsiveness
  const streamResponseText = useCallback(async (messageId: string, fullText: string) => {
    isStreamingRef.current = true;
    const words = fullText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      const isLast = i === words.length - 1;
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, text: currentText, isStreaming: !isLast }
            : msg
        )
      );

      // Fast, natural token streaming delay
      const delay = Math.min(25, Math.max(8, Math.floor(250 / words.length)));
      await new Promise((r) => setTimeout(r, delay));
    }
    isStreamingRef.current = false;
  }, []);

  // Decoupled background Firebase search for products only when required
  const performBackgroundFirebaseSearch = useCallback(async (
    messageId: string, 
    suggestedIds: string[], 
    queryText: string
  ) => {
    if (!suggestedIds || suggestedIds.length === 0) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isSearchingProducts: false } : m))
      );
      return;
    }

    try {
      // 1. Fetch live products from Firebase Firestore asynchronously in background
      const liveProducts = await firestoreCatalogService.getProducts();
      const productPool = (liveProducts && liveProducts.length > 0) ? liveProducts : allAvailableProducts;

      // 2. Resolve matching products from the live database
      const matched = productPool.filter((p) => suggestedIds.includes(p.id));

      // 3. Update the specific message in background with resolved products
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isSearchingProducts: false,
              suggestedProductIds: suggestedIds,
              resolvedProducts: matched.length > 0 ? matched : undefined,
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.warn('Background Firebase product search error:', err);
      // Fallback to local products pool without crashing UI
      const localMatched = allAvailableProducts.filter((p) => suggestedIds.includes(p.id));
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isSearchingProducts: false,
              suggestedProductIds: suggestedIds,
              resolvedProducts: localMatched.length > 0 ? localMatched : undefined,
            };
          }
          return msg;
        })
      );
    }
  }, [allAvailableProducts]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading || isStreamingRef.current) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };

    const currentHistory = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    const aiMessageId = `ai-${Date.now()}`;

    try {
      // 1. Send query to assistant endpoint
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          history: currentHistory,
          customInstructions: appSettings?.aiCustomInstructions,
          knowledgeBase: appSettings?.aiKnowledgeBase
        }),
      });

      const data = await res.json();
      const fullText = data.text || 'يسعدني دائماً مساعدتك في ضَجّة مول!';
      const suggestedIds: string[] = Array.isArray(data.suggestedProductIds) ? data.suggestedProductIds : [];
      const isProductIntent = (
        data.intent === 'PRODUCT_SEARCH' ||
        data.intent === 'PRODUCT_IMAGE_REQUEST' ||
        data.intent === 'PRODUCT_DETAILS'
      );
      const needsProductSearch = isProductIntent && suggestedIds.length > 0;

      // 2. Immediately inject the streaming AI message bubble
      const initialAiMsg: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        isSearchingProducts: needsProductSearch,
        suggestedProductIds: [],
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, initialAiMsg]);
      setIsLoading(false);

      // 3. Immediately start streaming the response text to the user!
      streamResponseText(aiMessageId, fullText);

      // 4. In parallel/background: Only execute Firebase search if query actually requires products
      if (needsProductSearch) {
        performBackgroundFirebaseSearch(aiMessageId, suggestedIds, query);
      }
    } catch (err) {
      console.error('Failed to communicate with AI endpoint:', err);
      setIsLoading(false);
      
      // Fallback message
      const fallbackAiMsg: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        isSearchingProducts: false,
        suggestedProductIds: [],
        timestamp: 'الآن',
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      streamResponseText(aiMessageId, 'أهلاً بك! أنا مساعد ضَجّة AI، كيف أستطيع مساعدتك اليوم؟');
    }
  };

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  return (
    <div className="fixed inset-0 z-[9993] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white flex flex-col h-full sm:h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 p-[1.5px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white">مساعد ضَجّة AI الذكي</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  استجابة فائقة السرعة
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                استجابة فورية بالبث المباشر وبحث Firebase بالخلفية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold rounded-br-none'
                    : 'bg-neutral-950/90 border border-neutral-800 text-neutral-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">
                  {msg.text}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse ms-1 align-middle rounded-sm" />
                  )}
                </p>

                {/* Background Firebase search indicator */}
                {msg.isSearchingProducts && (
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>جاري مطابقة المنتجات من قاعدة البيانات...</span>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-left ${
                    msg.sender === 'user' ? 'text-neutral-900/70' : 'text-neutral-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Recommended Product Cards from Firebase Background Search */}
              {((msg.resolvedProducts && msg.resolvedProducts.length > 0) || (msg.suggestedProductIds && msg.suggestedProductIds.length > 0)) && (
                <div className="mt-3 w-full max-w-[95%] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(msg.resolvedProducts || (msg.suggestedProductIds || []).map((pId) => allAvailableProducts.find((p) => p.id === pId)).filter(Boolean) as Product[]).map((prod) => {
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => onSelectProduct(prod)}
                        className="flex gap-2.5 p-2.5 rounded-2xl bg-neutral-950/90 border border-amber-500/30 hover:border-amber-500 cursor-pointer transition-all hover:bg-neutral-900 group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          <div>
                            {prod.discountPercentage ? (
                              <span className="text-[10px] text-rose-400 font-bold">
                                خصم {prod.discountPercentage}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-bold">
                                ضَجّة مول
                              </span>
                            )}
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                              {prod.name}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-black text-amber-400">
                              {formatPrice(prod.priceYER)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors"
                              title="أضف إلى السلة"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 w-fit">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs text-neutral-400 font-medium">
                جاري التفكير وتحليل طلبك...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800/80 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white text-xs font-medium transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اسأل المساعد الذكي عن أي شيء أو اطلب منتجاً..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 sm:p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AIAssistantModal;

