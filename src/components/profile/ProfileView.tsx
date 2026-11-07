import React, { useState } from 'react';
import { Order } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { OrderTrackingModal } from '../orders/OrderTrackingModal';
import { 
  User as UserIcon, 
  Package, 
  Headphones, 
  Truck, 
  Settings, 
  Coins, 
  Ticket, 
  Award, 
  Wallet, 
  RotateCcw, 
  MessageSquareText, 
  FileText, 
  Clock, 
  Gift, 
  HelpCircle,
  ChevronLeft,
  ShieldCheck,
  LogOut,
  LogIn,
  MapPin,
  Play
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth: () => void;
  onOpenWishlist?: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  onNavigateHome?: () => void;
  onOpenStoreLocator?: () => void;
  onReplaySplash?: () => void;
  onOpenCurrencyAdmin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAuth,
  onOpenSupport,
  onOpenSettings,
  onOpenAdmin,
  onOpenStoreLocator,
  onReplaySplash,
  onOpenCurrencyAdmin,
}) => {
  const {
    currentUser,
    orders,
    formatPrice,
    coupons,
    isAdmin,
    logout,
    updateUserProfile,
  } = useMarketplace();

  const [activeOrdersFilter, setActiveOrdersFilter] = useState<'all' | 'unpaid' | 'processing' | 'shipped' | 'feedback' | 'returns' | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Check In Handler (persisted to real user in Firebase)
  const handleCheckIn = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (checkedInToday) {
      alert('تم تسجيل حضورك اليوم بالفعل! +50 نقطة.');
      return;
    }
    setCheckedInToday(true);
    const newPoints = (currentUser.points || 0) + 50;
    await updateUserProfile({ points: newPoints });
    alert('🎉 تم تسجيل حضورك اليوم بنجاح وإضافة 50 نقطة مكافأة إلى رصيدك في ضَجّة مول!');
  };

  // 5 Status classifications
  const unpaidOrders = orders.filter((o) => o.status === 'received' || (o.paymentMethod as string) === 'cod');
  const processingOrders = orders.filter((o) => o.status === 'processing');
  const shippedOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const feedbackOrders = orders.filter((o) => o.status === 'delivered');
  const returnOrders = orders.filter((o) => o.status === 'cancelled');

  const filteredOrders = activeOrdersFilter === 'unpaid' 
    ? unpaidOrders 
    : activeOrdersFilter === 'processing' 
    ? processingOrders 
    : activeOrdersFilter === 'shipped' 
    ? shippedOrders 
    : activeOrdersFilter === 'feedback' 
    ? feedbackOrders 
    : activeOrdersFilter === 'returns' 
    ? returnOrders 
    : orders;

  // If visitor is not authenticated (New Visitor / Incognito), present the Guest Login Portal
  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-4 pb-20 px-3 sm:px-4 select-none animate-fadeIn">
        {/* Guest Hero Card */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <UserIcon className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-white">مرحباً بك في ضَجّة مول</h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
              سجّل الدخول أو أنشئ حساباً جديداً للوصول إلى طلباتك، محفظتك، كوبوناتك، وعناوينك في أي وقت وعبر مختلف أجهزتك.
            </p>
          </div>

          <button
            type="button"
            id="btn-guest-login-main"
            onClick={onOpenAuth}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول / إنشاء حساب جديد</span>
          </button>
        </div>

        {/* Public Features & Assistance for Visitors */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 text-center">
          <button
            type="button"
            onClick={onOpenSupport}
            className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
          >
            <Headphones className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-bold">خدمة العملاء</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPoliciesModal(true)}
            className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
          >
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-bold">الضمان والسياسات</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-bold">إعدادات التطبيق</span>
          </button>
        </div>

        {/* Policies Modal for Guests */}
        {showPoliciesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 text-right">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-sm font-black text-white">سياسات وضمانات ضَجّة مول</h3>
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(false)}
                  className="text-neutral-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed max-h-64 overflow-y-auto">
                <p><strong>1. المعاينة قبل الدفع:</strong> يحق لك فحص المنتج بالكامل قبل سداد المبلغ في كل المحافظات اليمنية.</p>
                <p><strong>2. سياسة الاسترجاع:</strong> استرجاع واستبدال فوري خلال 3 أيام لأي عيب مصنعي أو اختلاف بالمقاس.</p>
                <p><strong>3. الدفع:</strong> نقداً أو عبر المحافظ الإلكترونية (الكريمي، جيب، جوالي).</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPoliciesModal(false)}
                className="w-full py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs"
              >
                تم
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-2.5 pb-20 px-2 sm:px-4 select-none">
      {/* 1. COMPACT HEADER (User Info / Login & Settings ⚙️) */}
      <div className="flex items-center justify-between py-1.5 px-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="truncate text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">{currentUser.name}</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-neutral-950 text-[8px] font-black">
                  مالك
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 block">{currentUser.email || currentUser.phone || 'عضو مميز'}</span>
          </div>
        </div>

        {/* Settings ⚙️ Button */}
        <button
          type="button"
          id="profile-btn-settings"
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-amber-400 transition-colors flex-shrink-0"
          title="الإعدادات"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ADMIN EXCLUSIVE CONTROL BANNER (Visible ONLY to Owner / Admin) */}
      {isAdmin && onOpenAdmin && (
        <div 
          id="admin-dashboard-launch-card"
          onClick={onOpenAdmin}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/10 border-2 border-amber-400/50 hover:border-amber-400 shadow-xl shadow-amber-500/10 flex items-center justify-between cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">لوحة تحكم وإدارة المتجر الشاملة</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black">Admin 🛡️</span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/80">إدارة المنتجات، الأقسام، البراندات، الطلبات، السياسات، وذكاء ضَجّة AI</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs group-hover:bg-amber-300 transition-colors whitespace-nowrap">
            فتح اللوحة
          </div>
        </div>
      )}

      {/* 2. ROW 1: COUPONS | POINTS | WALLET | GIFT CARD (Real Firebase Values) */}
      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm text-center">
        {/* كوبونات */}
        <div 
          onClick={() => alert(`لديك ${coupons.length} كوبونات خصم صالحة للاستخدام`)}
          className="flex flex-col items-center py-1 px-0.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <span className="text-xs sm:text-sm font-black text-amber-400">{coupons.length}</span>
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-300">
            <Ticket className="w-3 h-3 text-amber-400" />
            <span>كوبونات</span>
          </div>
        </div>

        {/* نقاط */}
        <div 
          onClick={handleCheckIn}
          className="flex flex-col items-center py-1 px-0.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <span className="text-xs sm:text-sm font-black text-amber-400">{currentUser.points || 0}</span>
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-300">
            <Award className="w-3 h-3 text-amber-400" />
            <span>نقاط</span>
          </div>
        </div>

        {/* محفظة */}
        <div 
          onClick={() => alert(`رصيد محفظتك: ${formatPrice(currentUser.walletBalanceYER || 0)}`)}
          className="flex flex-col items-center py-1 px-0.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <span className="text-xs sm:text-sm font-black text-amber-400">
            {currentUser.walletBalanceYER ? Math.round(currentUser.walletBalanceYER / 1000) + ' ألف' : '0'}
          </span>
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-300">
            <Wallet className="w-3 h-3 text-amber-400" />
            <span>محفظة</span>
          </div>
        </div>

        {/* بطاقة هدية */}
        <div 
          onClick={() => alert('قريباً: إمكانية إهداء بطاقات التسوق الإلكترونية')}
          className="flex flex-col items-center py-1 px-0.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
        >
          <span className="text-xs sm:text-sm font-black text-amber-400">0</span>
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-300">
            <Gift className="w-3 h-3 text-amber-400" />
            <span>بطاقة هدية</span>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: "طلباتي" (MY ORDERS 5 STATUS ICONS) */}
      <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>طلباتي</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter ? null : 'all')}
            className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <span>عرض الكل ({orders.length})</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        {/* 5 Compact Status Icons */}
        <div className="grid grid-cols-5 gap-1 text-center pt-0.5">
          {/* غير مدفوع */}
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter === 'unpaid' ? null : 'unpaid')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              activeOrdersFilter === 'unpaid' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-neutral-850 text-neutral-300'
            }`}
          >
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400" />
              {unpaidOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-amber-500 text-neutral-950 text-[7px] font-black flex items-center justify-center">
                  {unpaidOrders.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold leading-tight">غير مدفوع</span>
          </button>

          {/* قيد التجهيز */}
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter === 'processing' ? null : 'processing')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              activeOrdersFilter === 'processing' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-neutral-850 text-neutral-300'
            }`}
          >
            <div className="relative">
              <Clock className="w-4 h-4 text-amber-400" />
              {processingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-amber-500 text-neutral-950 text-[7px] font-black flex items-center justify-center">
                  {processingOrders.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold leading-tight">قيد التجهيز</span>
          </button>

          {/* تم الشحن */}
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter === 'shipped' ? null : 'shipped')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              activeOrdersFilter === 'shipped' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-neutral-850 text-neutral-300'
            }`}
          >
            <div className="relative">
              <Truck className="w-4 h-4 text-amber-400" />
              {shippedOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-amber-500 text-neutral-950 text-[7px] font-black flex items-center justify-center">
                  {shippedOrders.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold leading-tight">تم الشحن</span>
          </button>

          {/* التعليق */}
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter === 'feedback' ? null : 'feedback')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              activeOrdersFilter === 'feedback' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-neutral-850 text-neutral-300'
            }`}
          >
            <div className="relative">
              <MessageSquareText className="w-4 h-4 text-amber-400" />
              {feedbackOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-amber-500 text-neutral-950 text-[7px] font-black flex items-center justify-center">
                  {feedbackOrders.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold leading-tight">التعليق</span>
          </button>

          {/* المنتجات المسترجعة */}
          <button
            type="button"
            onClick={() => setActiveOrdersFilter(activeOrdersFilter === 'returns' ? null : 'returns')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
              activeOrdersFilter === 'returns' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-neutral-850 text-neutral-300'
            }`}
          >
            <div className="relative">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              {returnOrders.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-amber-500 text-neutral-950 text-[7px] font-black flex items-center justify-center">
                  {returnOrders.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold leading-tight">المسترجعة</span>
          </button>
        </div>

        {/* Orders Accordion / Dropdown if Clicked */}
        {activeOrdersFilter && (
          <div className="pt-2 border-t border-neutral-800 space-y-1.5">
            {filteredOrders.length === 0 ? (
              <p className="text-[10px] text-center text-neutral-500 py-2">لا توجد طلبات في هذا القسم حالياً</p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderForTracking(order)}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] cursor-pointer hover:border-amber-400/50"
                >
                  <div>
                    <span className="font-mono font-bold text-neutral-300">#{order.id.slice(0, 8)}</span>
                    <span className="text-neutral-500 mr-2">({order.items.length} منتجات)</span>
                  </div>
                  <span className="font-black text-amber-400">{formatPrice(order.totalYER || (order as any).totalPriceYER || 0)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. ROW 3: CUSTOMER SERVICE | POLICIES | HELP (خدمة العملاء | السياسات | المساعدة) */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm text-center">
        {/* خدمة العملاء */}
        <button
          type="button"
          onClick={onOpenSupport}
          className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
        >
          <Headphones className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">خدمة العملاء</span>
        </button>

        {/* السياسات */}
        <button
          type="button"
          onClick={() => setShowPoliciesModal(true)}
          className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">السياسات</span>
        </button>

        {/* المساعدة */}
        <button
          type="button"
          onClick={onOpenSupport}
          className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">المساعدة</span>
        </button>
      </div>

      {/* 5. ROW 4: ESSENTIAL TOOLS (خريطة الفروع | إعادة عرض الشعار | أسعار الصرف) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-neutral-400 px-1">أدوات المتجر الأساسية</span>
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm text-center">
          {/* خريطة الفروع والمستودعات */}
          <button
            type="button"
            id="profile-btn-store-locator"
            onClick={onOpenStoreLocator || (() => {})}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors cursor-pointer group"
            title="خريطة الفروع والمستودعات"
          >
            <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">خريطة الفروع</span>
          </button>

          {/* إعادة عرض شعار ضَجّة السينمائي */}
          <button
            type="button"
            id="profile-btn-replay-splash"
            onClick={onReplaySplash || (() => {})}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors cursor-pointer group"
            title="إعادة عرض شعار ضَجّة السينمائي"
          >
            <Play className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">شعار ضَجّة 3D</span>
          </button>

          {/* أسعار الصرف الحية */}
          <button
            type="button"
            id="profile-btn-currency-rates"
            onClick={onOpenCurrencyAdmin || (() => {})}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-neutral-850 text-neutral-200 transition-colors cursor-pointer group"
            title="إدارة وعرض أسعار الصرف"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">أسعار الصرف</span>
          </button>
        </div>
      </div>

      {/* 6. AUTHENTICATION ACTION BAR (Logout if logged in, Sign In / Sign Up if guest) */}
      <div className="pt-2">
        {currentUser ? (
          <button
            type="button"
            id="btn-profile-logout"
            onClick={() => {
              if (window.confirm('هل تريد بالتأكيد تسجيل الخروج من حسابك في ضَجّة مول؟')) {
                logout();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من الحساب (Firebase Auth)</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-profile-guest-login"
            onClick={onOpenAuth}
            className="w-full py-3 px-4 rounded-2xl bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول أو إنشاء حساب جديد</span>
          </button>
        )}
      </div>

      {/* Policies Modal */}
      {showPoliciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-black text-white">سياسات وضمانات ضَجّة مول</h3>
              <button
                type="button"
                onClick={() => setShowPoliciesModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed max-h-64 overflow-y-auto">
              <p><strong>1. المعاينة قبل الدفع:</strong> يحق لك فحص المنتج بالكامل قبل سداد المبلغ في كل المحافظات اليمنية.</p>
              <p><strong>2. سياسة الاسترجاع:</strong> استرجاع واستبدال فوري خلال 3 أيام لأي عيب مصنعي أو اختلاف بالمقاس.</p>
              <p><strong>3. الدفع:</strong> نقداً أو عبر المحافظ الإلكترونية (الكريمي، جيب، جوالي).</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPoliciesModal(false)}
              className="w-full py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs"
            >
              تم
            </button>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrderForTracking && (
        <OrderTrackingModal
          isOpen={Boolean(selectedOrderForTracking)}
          order={selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
        />
      )}
    </div>
  );
};
