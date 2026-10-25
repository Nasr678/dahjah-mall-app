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
    title: 'Flash Sale',
    titleEn: 'Flash Sale',
    subtitle: 'عرض المزيد / View more',
    linkType: 'deals' as const,
    linkTarget: 'women',
    icon: 'Zap' as const,
    buttonSize: 'small' as const,
    styleVariant: 'amber' as const,
    isActive: true,
  };

  const btn2 = buttonsConfig?.button2 || {
    id: 'free_shipping',
    title: 'Free Shipping',
    titleEn: 'Free Shipping',
    subtitle: 'اطلب بقيمة 99$ أو أكثر',
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
    <div className={`w-full max-w-2xl mx-auto grid ${isTwoButtons ? 'grid-cols-2' : 'grid-cols-1'} rounded-xl bg-neutral-900/70 border border-neutral-800/80 ${isTwoButtons ? 'divide-x divide-x-reverse divide-neutral-800/80' : ''} overflow-hidden shadow-xs`}>
      {/* Button 1 */}
      {btn1.isActive && (
        <button
          type="button"
          id="btn-home-promo-1"
          onClick={() => handleButtonClick(btn1, onOpenFlashSale)}
          className="flex flex-col items-center justify-center py-1.5 px-2 sm:py-2 sm:px-3 hover:bg-neutral-850/80 transition-colors text-center group cursor-pointer select-none"
        >
          <div className="flex items-center gap-1 font-black text-[11px] sm:text-xs text-white group-hover:text-amber-400 transition-colors">
            <span className="truncate max-w-[120px] sm:max-w-[170px]">{btn1.title}</span>
            {renderIcon(btn1.icon, `w-3 h-3 ${btn1.styleVariant === 'amber' || btn1.icon === 'Zap' ? 'fill-amber-400 text-amber-400 animate-pulse' : 'text-amber-400'}`)}
          </div>
          <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-neutral-400 font-medium mt-0.5 truncate max-w-[130px] sm:max-w-[190px]">
            <span className="truncate">{btn1.subtitle}</span>
            <ChevronLeft className="w-2.5 h-2.5 text-neutral-500 group-hover:text-amber-400 group-hover:-translate-x-0.5 transition-all flex-shrink-0" />
          </div>
        </button>
      )}

      {/* Button 2 */}
      {btn2.isActive && (
        <button
          type="button"
          id="btn-home-promo-2"
          onClick={() => handleButtonClick(btn2, onOpenFreeShipping)}
          className="flex flex-col items-center justify-center py-1.5 px-2 sm:py-2 sm:px-3 hover:bg-neutral-850/80 transition-colors text-center group cursor-pointer select-none"
        >
          <div className="flex items-center gap-1 font-black text-[11px] sm:text-xs text-white group-hover:text-amber-400 transition-colors">
            <span className="truncate max-w-[120px] sm:max-w-[170px]">{btn2.title}</span>
            {renderIcon(btn2.icon, 'w-3 h-3 text-amber-400 flex-shrink-0')}
          </div>
          <div className="text-[9px] sm:text-[10px] text-neutral-400 font-medium mt-0.5 truncate max-w-[130px] sm:max-w-[190px]">
            <span className="truncate">{btn2.subtitle}</span>
          </div>
        </button>
      )}
    </div>
  );
});

HomePromoBenefits.displayName = 'HomePromoBenefits';

