import React from 'react';
import { 
  Zap, 
  Truck, 
  Sparkles, 
  Gift, 
  Percent, 
  Flame, 
  ShoppingBag, 
  ChevronLeft 
} from 'lucide-react';
import { HomePromoButton } from '../../types';

interface HomePromoBenefitsProps {
  buttonsConfig?: {
    button1: HomePromoButton;
    button2: HomePromoButton;
  };
  onNavigate?: (linkType: 'category' | 'page' | 'external' | 'deals', target: string) => void;
  onOpenFlashSale?: () => void;
  onOpenFreeShipping?: () => void;
}

export const HomePromoBenefits: React.FC<HomePromoBenefitsProps> = React.memo(({
  buttonsConfig,
  onNavigate,
  onOpenFlashSale,
  onOpenFreeShipping,
}) => {
  // Default values if no config provided yet
  const btn1 = buttonsConfig?.button1 || {
    id: 'flash_sale',
    title: 'عروض اليوم المخفضة',
    titleEn: 'Daily Deals',
    subtitle: 'خصومات مختارة لفترة محدودة',
    linkType: 'deals' as const,
    linkTarget: 'all',
    icon: 'Zap' as const,
    buttonSize: 'small' as const,
    styleVariant: 'amber' as const,
    isActive: true,
  };

  const btn2 = buttonsConfig?.button2 || {
    id: 'free_shipping',
    title: 'شحن مجاني للمحافظات',
    titleEn: 'Free Shipping',
    subtitle: 'للطلبات فوق 30,000 ر.ي',
    linkType: 'page' as const,
    linkTarget: 'cart',
    icon: 'Truck' as const,
    buttonSize: 'small' as const,
    styleVariant: 'default' as const,
    isActive: true,
  };

  // If both buttons disabled, hide the bar completely
  if (!btn1.isActive && !btn2.isActive) {
    return null;
  }

  const handleButtonClick = (btn: HomePromoButton, defaultFallback?: () => void) => {
    if (onNavigate) {
      onNavigate(btn.linkType, btn.linkTarget);
    } else if (defaultFallback) {
      defaultFallback();
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Gift':
        return <Gift className={className} />;
      case 'Percent':
        return <Percent className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  const isTwoButtons = btn1.isActive && btn2.isActive;

  return (
    <div className={`w-full max-w-2xl mx-auto grid ${isTwoButtons ? 'grid-cols-2' : 'grid-cols-1'} rounded-2xl bg-white border border-neutral-200/90 ${isTwoButtons ? 'divide-x divide-x-reverse divide-neutral-200/80' : ''} overflow-hidden shadow-xs`}>
      {/* Button 1 */}
      {btn1.isActive && (
        <button
          type="button"
          id="btn-home-promo-1"
          onClick={() => handleButtonClick(btn1, onOpenFlashSale)}
          className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-4 hover:bg-amber-50/60 transition-colors text-center group cursor-pointer select-none"
        >
          <div className="flex items-center gap-1 font-black text-[11px] sm:text-xs text-neutral-900 group-hover:text-amber-700 transition-colors">
            <span className="truncate max-w-[125px] sm:max-w-[180px]">{btn1.title}</span>
            {renderIcon(btn1.icon, `w-3.5 h-3.5 ${btn1.styleVariant === 'amber' || btn1.icon === 'Zap' ? 'fill-amber-500 text-amber-600' : 'text-amber-600'}`)}
          </div>
          <div className="flex items-center gap-0.5 text-[10px] text-neutral-500 font-medium mt-0.5 truncate max-w-[135px] sm:max-w-[195px]">
            <span className="truncate">{btn1.subtitle}</span>
            <ChevronLeft className="w-3 h-3 text-neutral-400 group-hover:text-amber-600 group-hover:-translate-x-0.5 transition-all flex-shrink-0" />
          </div>
        </button>
      )}

      {/* Button 2 */}
      {btn2.isActive && (
        <button
          type="button"
          id="btn-home-promo-2"
          onClick={() => handleButtonClick(btn2, onOpenFreeShipping)}
          className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-4 hover:bg-amber-50/60 transition-colors text-center group cursor-pointer select-none"
        >
          <div className="flex items-center gap-1 font-black text-[11px] sm:text-xs text-neutral-900 group-hover:text-amber-700 transition-colors">
            <span className="truncate max-w-[125px] sm:max-w-[180px]">{btn2.title}</span>
            {renderIcon(btn2.icon, 'w-3.5 h-3.5 text-amber-600 flex-shrink-0')}
          </div>
          <div className="text-[10px] text-neutral-500 font-medium mt-0.5 truncate max-w-[135px] sm:max-w-[195px]">
            <span className="truncate">{btn2.subtitle}</span>
          </div>
        </button>
      )}
    </div>
  );
});

HomePromoBenefits.displayName = 'HomePromoBenefits';

