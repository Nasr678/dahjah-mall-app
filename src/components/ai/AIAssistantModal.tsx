import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Product, CurrencyCode } from '../../types';
import { PRODUCTS } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  X, 
  Send, 
  Sparkles, 
  ShoppingCart, 
  RefreshCw
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
      text: 'أهلاً بك في خدمة المساعد الذكي من ضَجّة مول. يمكنك سؤالي عن المنتجات، المقاسات، الأسعار، أو متابعة طلبك وسأرشح لك الخيارات المناسبة فوراً.',
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

  // Resolve suggested product IDs immediately from live in-memory catalog (eliminates duplicate Firestore reads)
  const resolveSuggestedProducts = useCallback((
    messageId: string,
    suggestedIds: string[]
  ) => {
    if (!suggestedIds || suggestedIds.length === 0) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isSearchingProducts: false } : m))
      );
      return;
    }

    const idSet = new Set(suggestedIds);
    const matched = allAvailableProducts.filter((p) => idSet.has(p.id));
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // 1. Send query to assistant endpoint with 15s AbortController timeout
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          message: query,
          history: currentHistory,
          customInstructions: appSettings?.aiCustomInstructions,
          knowledgeBase: appSettings?.aiKnowledgeBase
        }),
      });
      clearTimeout(timeoutId);

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

      // 3. Stream text and resolve products instantaneously from live catalog cache
      streamResponseText(aiMessageId, fullText);

      if (needsProductSearch) {
        resolveSuggestedProducts(aiMessageId, suggestedIds);
      }
    } catch (err) {
      clearTimeout(timeoutId);
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
      streamResponseText(aiMessageId, 'أهلاً بك في ضَجّة مول، يبدو أن الاتصال بطيء حالياً. يمكنك استخدام البحث الفوري أو إعادة إرسال استفسارك الآن.');
    }
  };

  const formatPrice = (priceYER: number) => {
    if (currency === 'USD') return `$${(priceYER / 530).toFixed(1)}`;
    if (currency === 'SAR') return `${(priceYER / 140).toFixed(0)} ر.س`;
    return `${priceYER.toLocaleString('ar-YE')} ر.ي`;
  };

  return (
    <div className="fixed inset-0 z-[9993] flex items-center justify-center p-0 sm:p-4 bg-neutral-950/50 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-t-3xl sm:rounded-3xl shadow-2xl text-neutral-900 flex flex-col h-full sm:h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-200 bg-white z-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-neutral-950">مستشار ضَجّة للتسوق</h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  خدمة العملاء الذكية
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                ترشيحات فورية للمقاسات، الأسعار، والعروض المتوفرة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#F6F7F9] hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F6F7F9]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-neutral-950 font-semibold rounded-br-none'
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">
                  {msg.text}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-amber-500 animate-pulse ms-1 align-middle rounded-sm" />
                  )}
                </p>

                {/* Background product matching indicator */}
                {msg.isSearchingProducts && (
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>جاري مطابقة المنتجات من قاعدة البيانات...</span>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-left tabular-nums ${
                    msg.sender === 'user' ? 'text-neutral-900/70' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Recommended Product Cards */}
              {((msg.resolvedProducts && msg.resolvedProducts.length > 0) || (msg.suggestedProductIds && msg.suggestedProductIds.length > 0)) && (
                <div className="mt-3 w-full max-w-[95%] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(msg.resolvedProducts || (msg.suggestedProductIds || []).map((pId) => allAvailableProducts.find((p) => p.id === pId)).filter(Boolean) as Product[]).map((prod) => {
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => onSelectProduct(prod)}
                        className="flex gap-2.5 p-2.5 rounded-2xl bg-white border border-neutral-200 hover:border-amber-400 cursor-pointer transition-all shadow-sm hover:shadow-md group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[#F6F7F9]"
                        />
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          <div>
                            {prod.discountPercentage ? (
                              <span className="text-[10px] text-rose-600 font-bold tabular-nums">
                                خصم {prod.discountPercentage}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-bold">
                                ضَجّة مول
                              </span>
                            )}
                            <h5 className="text-xs font-bold text-neutral-950 truncate group-hover:text-amber-700">
                              {prod.name}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-black text-neutral-950 tabular-nums">
                              {formatPrice(prod.priceYER)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(prod);
                              }}
                              className="p-1.5 rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-500 transition-colors cursor-pointer"
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
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-neutral-200 w-fit shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs text-neutral-600 font-medium">
                جاري التفكير وتحليل طلبك...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 bg-white border-t border-neutral-200 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-[#F6F7F9] hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 text-neutral-700 hover:text-neutral-950 text-xs font-medium transition-all cursor-pointer"
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
          className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-neutral-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اسأل المساعد الذكي عن أي شيء أو اطلب منتجاً..."
            className="flex-1 bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 sm:p-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AIAssistantModal;

