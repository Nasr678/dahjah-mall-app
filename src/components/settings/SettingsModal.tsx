import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CurrencyCode } from '../../types';
import { 
  X, 
  Settings, 
  User, 
  Lock, 
  ShieldCheck, 
  Coins, 
  Globe, 
  Eye, 
  Headphones, 
  MessageCircle, 
  Mail, 
  Info, 
  RotateCcw, 
  Truck, 
  Trash2, 
  RefreshCw, 
  LogOut,
  ChevronLeft,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onOpenSupport: () => void;
  onOpenAccessibility: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenSupport,
  onOpenAccessibility,
}) => {
  const {
    currentUser,
    currentCurrency,
    setCurrency,
    logout,
  } = useMarketplace();

  const [cacheCleared, setCacheCleared] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Currency options matching strictly requested names
  const currencyOptions: { code: CurrencyCode; label: string; desc: string }[] = [
    { code: 'YER_NORTH', label: 'ريال يمني (شمال)', desc: 'العملة المعتمدة في صنعاء والمحافظات الشمالية' },
    { code: 'YER_SOUTH', label: 'ريال يمني (جنوب)', desc: 'العملة المعتمدة في عدن والمحافظات الجنوبية' },
    { code: 'SAR', label: 'ريال سعودي (SAR)', desc: 'تحويل مباشر بالريال السعودي' },
    { code: 'USD', label: 'دولار أمريكي (USD)', desc: 'تحويل مباشر بالدولار الأمريكي' },
  ];

  const handleClearCache = () => {
    localStorage.removeItem('dajjah_temp_cart');
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateMessage('أنت تستخدم أحدث إصدار من تطبيق ضَجّة مول (v2.4.0)');
      setTimeout(() => setUpdateMessage(null), 3500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#F6F7F9] border border-neutral-200 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-black text-neutral-950">الإعدادات</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F6F7F9] hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-700">
          {/* 1. الحساب والأمان */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 px-2">الحساب والأمان</span>
            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <div className="text-right">
                    <div className="font-bold text-neutral-950">
                      {currentUser ? currentUser.name : 'تسجيل الدخول والحساب'}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {currentUser ? currentUser.email : 'تسجيل الدخول السريع بحساب Google أو البريد'}
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-neutral-800">تغيير كلمة المرور وطرق الأمان</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* 2. التطبيق والعملة */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 px-2">التطبيق والعملة</span>
            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              {/* Currency Selector */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-950 font-bold">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>العملة المعتمدة</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                    {currencyOptions.find((c) => c.code === currentCurrency)?.label || 'ريال يمني (شمال)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {currencyOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setCurrency(opt.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        currentCurrency === opt.code
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                          : 'bg-[#F6F7F9] border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-[11px] font-bold">{opt.label}</div>
                        <div className="text-[9px] text-neutral-500 truncate">{opt.desc}</div>
                      </div>
                      {currentCurrency === opt.code && <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mr-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-neutral-800">اللغة</span>
                </div>
                <span className="text-[11px] font-bold text-amber-700">العربية (اليمن)</span>
              </div>

              {/* Accessibility */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccessibility();
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <div className="text-right">
                    <span className="font-bold text-neutral-800 block">إمكانية الوصول</span>
                    <span className="text-[10px] text-neutral-500 block">حجم النص، تباين الألوان، وتقليل الحركة</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* 3. التواصل وخدمة العملاء */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 px-2">التواصل وخدمة العملاء</span>
            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-neutral-800">مركز خدمة العملاء والمساعدة</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-neutral-400" />
              </button>

              <a
                href="https://wa.me/967770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-neutral-800">محادثة واتساب مباشرة (24/7)</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono tabular-nums">+967 770 000 000</span>
              </a>

              <a
                href="mailto:support@dajjahmall.com"
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-neutral-800">البريد الإلكتروني للدعم</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">support@dajjahmall.com</span>
              </a>
            </div>
          </div>

          {/* 4. عن ضَجّة مول والسياسات */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 px-2">عن ضَجّة مول والسياسات</span>
            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              <div className="p-3">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                  <Info className="w-4 h-4" />
                  <span>عن منصة ضَجّة مول</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  المنصة الأولى للتسوق الإلكتروني في الجمهورية اليمنية تحت شعار «ضَجّة في وجه الغلاء»، بأقوى التخفيضات وضمان المعاينة قبل الدفع.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="font-bold text-neutral-950 block">معاينة قبل الدفع</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200">
                  <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="font-bold text-neutral-950 block">استرجاع 3 أيام</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200">
                  <Truck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="font-bold text-neutral-950 block">توصيل لكل المدن</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. إعدادات التطبيق والتخزين المؤقت */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 px-2">إعدادات التطبيق</span>
            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleClearCache}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <div className="text-right">
                    <span className="font-bold text-neutral-800 block">مسح التخزين المؤقت (Cache)</span>
                    <span className="text-[10px] text-neutral-500">تسريع التطبيق وتحرير الذاكرة</span>
                  </div>
                </div>
                {cacheCleared ? (
                  <span className="text-[10px] font-bold text-emerald-700">تم المسح ✓</span>
                ) : (
                  <ChevronLeft className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCheckUpdate}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F6F7F9] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className={`w-4 h-4 text-amber-600 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  <span className="font-bold text-neutral-800">التحقق من تحديث التطبيق</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono tabular-nums">v2.4.0</span>
              </button>

              {updateMessage && (
                <div className="p-2.5 bg-emerald-50 border-t border-emerald-200 text-emerald-700 text-[10px] font-bold text-center">
                  {updateMessage}
                </div>
              )}
            </div>
          </div>

          {/* 6. تسجيل الخروج */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
