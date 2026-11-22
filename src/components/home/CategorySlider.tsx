import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import { 
  Sparkles, 
  User, 
  Baby, 
  Footprints, 
  ShoppingBag, 
  Watch, 
  Flame, 
  Heart, 
  Palette, 
  Smartphone, 
  Gift, 
  Home,
  ChevronLeft
} from 'lucide-react';
import { CachedImage } from '../common/CachedImage';

interface CategorySliderProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  User,
  Baby,
  Footprints,
  ShoppingBag,
  Watch,
  Flame,
  Heart,
  Palette,
  Smartphone,
  Gift,
  Home,
};

export const CategorySlider: React.FC<CategorySliderProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
          <h3 className="text-base sm:text-lg font-black text-neutral-900">تصفح الأقسام الرئيسية</h3>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.iconName] || Sparkles;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border transition-all duration-300 w-[84px] sm:w-28 text-center group cursor-pointer ${
                isSelected
                  ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-md shadow-amber-500/10'
                  : 'bg-white hover:bg-white border-neutral-200/85 hover:border-amber-400/60 text-neutral-800 shadow-2xs'
              }`}
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-2.5 bg-[#F3F4F6] p-0.5 sm:p-1 border border-neutral-200 group-hover:border-amber-400 transition-colors">
                <CachedImage
                  src={cat.image}
                  alt={cat.name}
                  preset="thumb"
                  fallbackText={cat.name}
                  containerClassName="w-full h-full rounded-lg sm:rounded-xl overflow-hidden"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-white/95 text-amber-600 shadow-2xs">
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-bold truncate w-full group-hover:text-amber-700 transition-colors">
                {cat.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5 tabular-nums">
                {cat.itemCount}+ منتج
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
