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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-850 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={tab.id === 'cart' ? 'bottom-nav-cart' : `bottom-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center py-1 px-1 rounded-2xl transition-all duration-200 flex-1 max-w-[72px] cursor-pointer ${
                isActive 
                  ? 'text-amber-400 font-black' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.highlight ? (
                  <div className={`p-1 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/40' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                ) : (
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-amber-400 stroke-[2.5]' : 'stroke-[1.75]'
                    }`} 
                  />
                )}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-1 whitespace-nowrap ${
                isActive ? 'text-amber-400' : 'text-neutral-400'
              }`}>
                {tab.label}
              </span>
              {isActive && !tab.highlight && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-sm shadow-amber-400/80" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
