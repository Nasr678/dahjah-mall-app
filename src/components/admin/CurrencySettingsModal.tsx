import React, { useState } from 'react';
import { 
  Coins, 
  X, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  Info
} from 'lucide-react';
import { CurrencyCode, ExchangeRates } from '../../types';
import { CURRENCY_CONFIGS, DEFAULT_EXCHANGE_RATES, formatPriceWithCurrency } from '../../services/currencyService';
import { useMarketplace } from '../../context/MarketplaceContext';

interface CurrencySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency?: CurrencyCode;
  rates?: ExchangeRates;
  onSelectCurrency?: (code: CurrencyCode) => void;
  onUpdateRates?: (rates: ExchangeRates) => void;
}

export const CurrencySettingsModal: React.FC<CurrencySettingsModalProps> = ({
  isOpen,
  onClose,
  currentCurrency: propCurrentCurrency,
  rates: propRates,
  onSelectCurrency: propOnSelectCurrency,
  onUpdateRates: propOnUpdateRates,
}) => {
  const marketplace = useMarketplace();

  const currentCurrency = propCurrentCurrency || marketplace?.currentCurrency || 'YER_NORTH';
  const rates = propRates || marketplace?.currencyRates || DEFAULT_EXCHANGE_RATES;
  const onSelectCurrency = propOnSelectCurrency || marketplace?.setCurrency || (() => {});
  const onUpdateRates = propOnUpdateRates || marketplace?.updateCurrencyRates || (() => {});

  const [activeTab, setActiveTab] = useState<'select' | 'rates'>('select');
  const [southRate, setSouthRate] = useState<number>(rates?.YER_SOUTH || 3.0);
  const [usdRate, setUsdRate] = useState<number>(Math.round(1 / (rates?.USD || 0.0018868))); // 530 YER/USD
  const [sarRate, setSarRate] = useState<number>(Math.round(1 / (rates?.SAR || 0.0071428))); // 140 YER/SAR
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSaveCustomRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRates: ExchangeRates = {
      ...rates,
      YER_NORTH: 1.0,
      YER_SOUTH: southRate > 0 ? southRate : 3.0,
      USD: usdRate > 0 ? 1 / usdRate : 0.0018868,
      SAR: sarRate > 0 ? 1 / sarRate : 0.0071428,
    };
    onUpdateRates(updatedRates);
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 2500);
  };

  const handleResetDefaults = () => {
    setSouthRate(3.0);
    setUsdRate(530);
    setSarRate(140);
    onUpdateRates(DEFAULT_EXCHANGE_RATES);
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-white my-auto overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">نظام العملات والصرف (اليمن)</h3>
              <p className="text-xs text-neutral-400">الريال اليمني الشمالي، الجنوبي، والعملات الدولية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex gap-2">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'select'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>اختيار عملة التسوق</span>
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rates'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>إعدادات أسعار الصرف (قابلة للتعديل)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {activeTab === 'select' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  اختر العملة المناسبة لمنطقتك. سيتم حساب جميع الأسعار وسلة التسوق تلقائياً وفقاً للعملة المحددة دون خلط.
                </span>
              </div>

              {(['YER_NORTH', 'YER_SOUTH', 'USD', 'SAR'] as CurrencyCode[]).map((code) => {
                const conf = CURRENCY_CONFIGS[code];
                const isSelected = currentCurrency === code;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      onSelectCurrency(code);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-950/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-400'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {conf.symbol.split(' ')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black flex items-center gap-2">
                          <span>{conf.name}</span>
                          {code === 'YER_NORTH' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                              الأساس (صنعاء)
                            </span>
                          )}
                          {code === 'YER_SOUTH' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              عدن والمحافظات الجنوبية
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          مثال: 20,000 ريال شمالي = {formatPriceWithCurrency(20000, code, rates)}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-amber-500 text-neutral-950">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSaveCustomRates} className="space-y-4">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>معادلة الصرف المعتمدة لليمن (ديناميكية وغير ثابتة):</span>
                </div>
                <p className="text-neutral-400">
                  القيمة الأساسية للمنتجات مسجلة بـ (الريال الشمالي). يمكن لإدارة المتجر أو المستخدم تعديل معامل التحويل للجنوبي في أي وقت:
                </p>
              </div>

              {/* South Yemen Rate Input */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white">معامل التحويل (ريال شمالي ➔ ريال جنوبي):</label>
                  <span className="text-xs font-mono font-bold text-amber-400">1 شمالي = {southRate} جنوبي</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="20"
                    value={southRate}
                    onChange={(e) => setSouthRate(parseFloat(e.target.value) || 3.0)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-neutral-400">1,000 شمالي = {(1000 * southRate).toLocaleString()} جنوبي</span>
                </div>
              </div>

              {/* USD Rate Input */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white">سعر صرف الدولار (1 USD بالريال الشمالي):</label>
                  <span className="text-xs font-mono font-bold text-amber-400">{usdRate} ر.ي</span>
                </div>
                <input
                  type="number"
                  step="1"
                  value={usdRate}
                  onChange={(e) => setUsdRate(parseFloat(e.target.value) || 530)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SAR Rate Input */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white">سعر صرف الريال السعودي (1 SAR بالريال الشمالي):</label>
                  <span className="text-xs font-mono font-bold text-amber-400">{sarRate} ر.ي</span>
                </div>
                <input
                  type="number"
                  step="1"
                  value={sarRate}
                  onChange={(e) => setSarRate(parseFloat(e.target.value) || 140)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {isSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>تم حفظ وتحديث أسعار الصرف بنجاح! سيتم تطبيقها فوراً.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استعادة المعدلات الافتراضية</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تطبيق وحفظ الأسعار</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
