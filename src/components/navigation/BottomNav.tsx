import React from 'react';
import { 
  Store, 
  LayoutGrid, 
  Bot,
  ShoppingBag, 
  User 
} from 'lucide-react';

export type NavTab = 'home' | 'categories' | 'trends' | 'cart' | 'profile' | 'offers' | 'ai' | 'wishlist' | 'brands';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cartCount: number;
  wishlistCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  activeTab,
  onSelectTab,
  cartCount,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'متجر',
      icon: Store,
    },
    {
      id: 'categories' as NavTab,
      label: 'الفئات',
      icon: LayoutGrid,
    },
    {
      id: 'ai' as NavTab,
      label: 'مساعد ضَجّة AI',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'cart' as NavTab,
      label: 'حقيبة التسوق',
      icon: ShoppingBag,
      badge: cartCount,
    },
    {
      id: 'profile' as NavTab,
      label: 'أنا',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-neutral-200/90 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-6px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={tab.id === 'cart' ? 'bottom-nav-cart' : `bottom-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-2xl transition-all duration-200 flex-1 max-w-[76px] cursor-pointer ${
                isActive 
                  ? 'text-amber-700 font-black' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.highlight ? (
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-amber-400 text-neutral-950 shadow-sm shadow-amber-400/40' 
                      : 'bg-amber-50 text-amber-700 border border-amber-300/70'
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-amber-600 stroke-[2.4]' : 'stroke-[1.75]'
                    }`} 
                  />
                )}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black flex items-center justify-center shadow-xs tabular-nums ring-2 ring-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-1 whitespace-nowrap ${
                isActive ? 'text-amber-800' : 'text-neutral-600'
              }`}>
                {tab.label}
              </span>
              {isActive && !tab.highlight && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
