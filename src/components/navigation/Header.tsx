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
    <header className="sticky top-0 z-50 w-full bg-neutral-950/98 backdrop-blur-xl border-b border-neutral-850 shadow-md">
      {/* Single Ultra-Compact Header Row matching Reference Layout */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-[50px] sm:h-[54px] flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* 1. Right Side (RTL): Wishlist Heart Icon ❤️ */}
        <button
          type="button"
          id="btn-header-wishlist"
          onClick={onOpenWishlist || onOpenProfile}
          className="relative p-2 rounded-xl text-neutral-300 hover:text-rose-400 hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
          title="المفضلة"
          aria-label="المفضلة"
        >
          <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
          {wishlistCount > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-sm">
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </button>

        {/* 2. Center: Compact Search Capsule 🔍 & 📷 Camera */}
        <button
          type="button"
          id="btn-header-search-bar"
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 text-neutral-400 hover:text-neutral-200 transition-all text-xs sm:text-sm cursor-pointer shadow-inner min-w-0"
        >
          <div className="flex items-center gap-1.5 truncate min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
            <span className="truncate text-right font-medium text-[11px] sm:text-xs">
              بحث في ضَجّة مول...
            </span>
          </div>
          <div className="flex items-center gap-1 text-neutral-400 flex-shrink-0">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:text-amber-400 transition-colors" />
          </div>
        </button>

        {/* 3. Left Side (RTL): Actions (Cart 🛒, Notifications 🔔, Customer Service 🎧, Profile 👤, Admin) */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
          {/* Shopping Cart 🛒 */}
          <button
            type="button"
            id="btn-header-cart"
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
            title="حقيبة التسوق"
            aria-label="حقيبة التسوق"
          >
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black flex items-center justify-center shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Notifications 🔔 */}
          <button
            type="button"
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
            title="الإشعارات"
            aria-label="الإشعارات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Customer Service 🎧 */}
          <button
            type="button"
            id="btn-header-support"
            onClick={onOpenSupport || (() => {})}
            className="p-2 rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
            title="خدمة العملاء"
            aria-label="خدمة العملاء"
          >
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Customer Login Button (Visible when not logged in) */}
          {!currentUser ? (
            <button
              type="button"
              id="btn-header-login"
              onClick={onOpenAuth || onOpenProfile}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400 text-neutral-950 hover:bg-amber-300 font-black text-[11px] sm:text-xs transition-all flex-shrink-0 shadow-sm cursor-pointer active:scale-95"
              title="تسجيل الدخول للعميل"
              aria-label="تسجيل الدخول"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          ) : (
            /* Profile / Account 👤 */
            <button
              type="button"
              id="btn-header-profile"
              onClick={onOpenProfile}
              className="p-2 rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
              title={currentUser.name || "حسابي"}
              aria-label="حسابي"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Admin Control Button (Visible ONLY to Owner / Admin) */}
          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              id="btn-header-admin"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-neutral-950 hover:bg-amber-300 font-black text-[11px] transition-all flex-shrink-0 shadow-sm cursor-pointer"
              title="لوحة الإدارة الشاملة"
              aria-label="لوحة الإدارة"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          {/* Currency Switcher Dropdown (Compact) */}
          <div className="hidden md:flex items-center gap-1 border-r border-neutral-800 pr-1.5 mr-0.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-neutral-900 text-[10px] font-bold text-amber-300 border border-neutral-800 rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
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

