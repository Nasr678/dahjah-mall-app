import React from 'react';
import { Category } from '../../types';
import { CachedImage } from '../common/CachedImage';

interface EditorialCategoriesProps {
  categories: Category[];
  selectedCategory?: string | null;
  onSelectCategory: (categoryId: string, subcategory?: string) => void;
  onViewAll?: () => void;
}

export const EditorialCategories: React.FC<EditorialCategoriesProps> = React.memo(({
  selectedCategory,
  onSelectCategory,
}) => {
  // Strict 6 departments requested:
  // نساء | ولادي | بناتي | مواليد | أحذية | شنط
  const officialDepartments = [
    {
      id: 'women',
      name: 'نساء',
      englishName: 'Women',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop',
      categoryId: 'women',
    },
    {
      id: 'boys',
      name: 'ولادي',
      englishName: 'Boys',
      image: 'https://images.unsplash.com/photo-1503944543280-75971723d5ce?q=80&w=400&auto=format&fit=crop',
      categoryId: 'boys',
    },
    {
      id: 'girls',
      name: 'بناتي',
      englishName: 'Girls',
      image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400&auto=format&fit=crop',
      categoryId: 'girls',
    },
    {
      id: 'baby',
      name: 'مواليد',
      englishName: 'Baby',
      image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=400&auto=format&fit=crop',
      categoryId: 'baby',
    },
    {
      id: 'shoes',
      name: 'أحذية',
      englishName: 'Shoes',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop',
      categoryId: 'shoes',
    },
    {
      id: 'bags',
      name: 'شنط',
      englishName: 'Bags',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
      categoryId: 'bags',
    },
  ];

  return (
    <section className="w-full py-1">
      {/* 6 Squircle Category Grid (Matches SHEIN Department Circular Cards) */}
      <div className="grid grid-cols-6 gap-1.5 xs:gap-2 sm:gap-4">
        {officialDepartments.map((item) => {
          const isSelected = selectedCategory === item.categoryId;

          return (
            <button
              key={item.id}
              type="button"
              id={`home-category-${item.id}`}
              onClick={() => onSelectCategory(item.categoryId)}
              className="flex flex-col items-center gap-1.5 group focus:outline-none transition-transform active:scale-95 cursor-pointer"
            >
              {/* Soft Squircle / Rounded Container */}
              <div
                className={`relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden p-0.5 transition-all duration-200 shadow-xs ${
                  isSelected
                    ? 'ring-2 ring-amber-500 bg-amber-50 shadow-md shadow-amber-500/15 scale-105'
                    : 'bg-white border border-neutral-200/90 hover:border-amber-400/70 hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-xl overflow-hidden bg-[#F3F4F6]">
                  <CachedImage
                    src={item.image}
                    alt={item.name}
                    preset="thumb"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Arabic Name Label */}
              <span
                className={`text-[11px] sm:text-xs md:text-sm font-bold tracking-tight text-center leading-tight transition-colors line-clamp-1 ${
                  isSelected
                    ? 'text-amber-700 font-black'
                    : 'text-neutral-800 group-hover:text-amber-700'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
});

EditorialCategories.displayName = 'EditorialCategories';



