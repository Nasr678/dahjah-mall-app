import React, { useRef, useEffect, memo } from 'react';
import { Category } from '../../types';

interface HomeTopCategoryBarProps {
  categories?: Category[];
  selectedCategory?: string | null;
  selectedCategoryId?: string | null;
  onSelectCategory: (categoryId: string) => void;
  onViewAllCategories?: () => void;
}

export const HomeTopCategoryBar: React.FC<HomeTopCategoryBarProps> = memo(({
  selectedCategory,
  selectedCategoryId,
  onSelectCategory,
}) => {
  // Official independent departments requested by user:
  // الكل | نساء | ولادي | بناتي | مواليد | أحذية | شنط
  const topTabs = [
    { id: 'all', name: 'الكل', categoryId: 'all' },
    { id: 'women', name: 'نساء', categoryId: 'women' },
    { id: 'boys', name: 'ولادي', categoryId: 'boys' },
    { id: 'girls', name: 'بناتي', categoryId: 'girls' },
    { id: 'baby', name: 'مواليد', categoryId: 'baby' },
    { id: 'shoes', name: 'أحذية', categoryId: 'shoes' },
    { id: 'bags', name: 'شنط', categoryId: 'bags' },
  ];

  const activeTabId = selectedCategoryId || selectedCategory || 'all';
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab into view when changed (e.g. via swipe gesture)
  useEffect(() => {
    const activeEl = document.getElementById(`top-cat-tab-${activeTabId}`);
    if (activeEl && navRef.current) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTabId]);

  return (
    <div className="w-full bg-neutral-950/98 border-b border-neutral-850 sticky top-[50px] sm:top-[54px] z-40 backdrop-blur-xl shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <nav 
          ref={navRef}
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 scroll-smooth text-right whitespace-nowrap"
          aria-label="أقسام المتجر الرئيسية"
        >
          {topTabs.map((item) => {
            const isSelected = activeTabId === item.categoryId;

            return (
              <button
                key={item.id}
                id={`top-cat-tab-${item.id}`}
                type="button"
                onClick={() => onSelectCategory(item.categoryId)}
                className={`relative flex-shrink-0 px-3.5 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'text-amber-400 font-black bg-neutral-850 border border-amber-400/50 shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <span>{item.name}</span>
                {isSelected && (
                  <span className="absolute bottom-0 inset-x-3 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
});

HomeTopCategoryBar.displayName = 'HomeTopCategoryBar';


