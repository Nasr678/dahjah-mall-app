import React from 'react';
import { CurrencyCode, UserProfile } from '../../types';
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  Heart,
  Camera, 
  Headphones,
  User,
  ShieldCheck,
  Globe,
  LogIn
} from 'lucide-react';
import { DajjahLogo } from '../common/DajjahLogo';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  unreadNotifsCount: number;
  currentCurrency: CurrencyCode;
  currentCity?: string;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
  onCurrencyChange: (c: CurrencyCode) => void;
  onOpenLocation?: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAI: () => void;
  onOpenProfile: () => void;
  onOpenWishlist?: () => void;
  onOpenOffers: () => void;
  onOpenAdmin?: () => void;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  cartCount,
  wishlistCount,
  unreadNotifsCount,
  currentCurrency,
  isAdmin = false,
  currentUser = null,
  onCurrencyChange,
  onOpenSearch,
  onOpenCart,
  onOpenNotifications,
  onOpenProfile,
  onOpenWishlist,
  onOpenAdmin,
  onOpenSupport,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200/90 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-[54px] sm:h-[58px] flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* 1. Right Side (RTL): Official Brand Emblem + Wishlist */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="hidden xs:flex items-center gap-1.5 pl-1">
            <DajjahLogo size="xs" interactive />
            <span className="hidden md:inline-block text-sm font-black text-neutral-900 tracking-tight whitespace-nowrap">
              ضَجّة مول
            </span>
          </div>

          <button
            type="button"
            id="btn-header-wishlist"
            onClick={onOpenWishlist || onOpenProfile}
            className="relative min-w-[40px] min-h-[40px] p-2 rounded-xl text-neutral-700 hover:text-rose-600 hover:bg-neutral-100 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="المفضلة"
            aria-label="المفضلة"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs tabular-nums ring-2 ring-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. Center: Light Luxury Search Capsule */}
        <button
          type="button"
          id="btn-header-search-bar"
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between gap-2 px-3.5 py-2 rounded-full bg-[#F3F4F6] border border-neutral-200/90 hover:border-amber-500/60 hover:bg-white text-neutral-500 hover:text-neutral-900 transition-all text-xs sm:text-sm cursor-pointer shadow-xs min-w-0"
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <Search className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="truncate text-right font-medium text-[11px] sm:text-xs">
              ابحث في ضَجّة مول...
            </span>
          </div>
          <div className="flex items-center gap-1 text-neutral-400 flex-shrink-0">
            <Camera className="w-4 h-4 hover:text-amber-600 transition-colors" />
          </div>
        </button>

        {/* 3. Left Side (RTL): Cart, Notifications, Support, Profile/Login, Admin, Currency */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
          {/* Shopping Cart */}
          <button
            type="button"
            id="btn-header-cart"
            onClick={onOpenCart}
            className="relative min-w-[40px] min-h-[40px] p-2 rounded-xl text-neutral-700 hover:text-amber-700 hover:bg-neutral-100 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="حقيبة التسوق"
            aria-label="حقيبة التسوق"
          >
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black flex items-center justify-center shadow-xs tabular-nums ring-2 ring-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            className="relative min-w-[40px] min-h-[40px] p-2 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="الإشعارات"
            aria-label="الإشعارات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Customer Service */}
          <button
            type="button"
            id="btn-header-support"
            onClick={onOpenSupport || (() => {})}
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-neutral-600 hover:text-amber-700 hover:bg-neutral-100 transition-colors hidden sm:flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="خدمة العملاء"
            aria-label="خدمة العملاء"
          >
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Customer Login / Profile */}
          {!currentUser ? (
            <button
              type="button"
              id="btn-header-login"
              onClick={onOpenAuth || onOpenProfile}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-400 text-neutral-950 hover:from-amber-400 hover:to-amber-300 font-black text-[11px] sm:text-xs transition-all flex-shrink-0 shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
              title="تسجيل الدخول للعميل"
              aria-label="تسجيل الدخول"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-header-profile"
              onClick={onOpenProfile}
              className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-neutral-700 hover:text-amber-700 hover:bg-neutral-100 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              title={currentUser.name || "حسابي"}
              aria-label="حسابي"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Admin Control Button (Owner / Admin Only) */}
          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              id="btn-header-admin"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 text-amber-300 hover:bg-neutral-800 border border-amber-500/30 font-black text-[11px] transition-all flex-shrink-0 shadow-xs cursor-pointer whitespace-nowrap"
              title="لوحة الإدارة الشاملة"
              aria-label="لوحة الإدارة"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          {/* Currency Switcher Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 border-r border-neutral-200 pr-2 mr-0.5">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-[#F3F4F6] text-[11px] font-bold text-neutral-800 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="YER_NORTH">ريال (شمال)</option>
              <option value="YER_SOUTH">ريال (جنوب)</option>
              <option value="SAR">سعودي SAR</option>
              <option value="USD">دولار USD</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

