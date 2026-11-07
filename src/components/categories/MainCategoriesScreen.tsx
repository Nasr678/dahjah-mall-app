import React, { useState } from 'react';
import { Category } from '../../types';
import { Search, Camera, Grid, ArrowRight, ChevronLeft, LogIn } from 'lucide-react';
import { CachedImage } from '../common/CachedImage';

interface MainCategoriesScreenProps {
  categories: Category[];
  onSelectCategory: (categoryId: string, subcategory?: string) => void;
  onBackToHome: () => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
}

interface DajjahSidebarItem {
  id: string;
  name: string;
  englishName: string;
  categoryId: string;
  subcategories: {
    name: string;
    englishName?: string;
    image: string;
    subcategoryQuery?: string;
  }[];
}

export const MainCategoriesScreen: React.FC<MainCategoriesScreenProps> = ({
  onSelectCategory,
  onBackToHome,
  onOpenSearch,
  onOpenAuth,
}) => {
  // Official departments strictly approved:
  // الكل | نساء | ولادي | بناتي | مواليد | أحذية | شنط
  const topTabs = [
    { id: 'all', name: 'الكل' },
    { id: 'women', name: 'نساء' },
    { id: 'boys', name: 'ولادي' },
    { id: 'girls', name: 'بناتي' },
    { id: 'baby', name: 'مواليد' },
    { id: 'shoes', name: 'أحذية' },
    { id: 'bags', name: 'شنط' },
  ];
  const [activeTopTab, setActiveTopTab] = useState('all');

  // Complete Sidebar Categories strictly matching official 6 categories
  const sidebarItems: DajjahSidebarItem[] = [
    {
      id: 'women',
      name: 'نساء',
      englishName: 'Women',
      categoryId: 'women',
      subcategories: [
        {
          name: 'فساتين سهرة ومناسبات',
          englishName: 'Dresses',
          image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'فساتين',
        },
        {
          name: 'بلوزات وتوبات كاجوال',
          englishName: 'Tops',
          image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'بلوزات',
        },
        {
          name: 'عبايات وجلابيات خليجية',
          englishName: 'Abayas',
          image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'عبايات',
        },
        {
          name: 'بناطيل جينز وسكيني',
          englishName: 'Pants',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'بناطيل',
        },
        {
          name: 'أطقم نسائية فاخرة',
          englishName: 'Co-ords',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'أطقم',
        },
        {
          name: 'بجامات وروب نوم',
          englishName: 'Sleepwear',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'ملابس منزلية',
        },
      ],
    },
    {
      id: 'boys',
      name: 'ولادي',
      englishName: 'Boys',
      categoryId: 'boys',
      subcategories: [
        {
          name: 'تيشيرتات وبولو',
          englishName: 'T-Shirts',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'تيشيرتات',
        },
        {
          name: 'قمصان كاجوال ورسمية',
          englishName: 'Shirts',
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'قمصان',
        },
        {
          name: 'أطقم ولادي صيفية',
          englishName: 'Sets',
          image: 'https://images.unsplash.com/photo-1503944543280-75971723d5ce?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'أطقم',
        },
        {
          name: 'بناطيل جينز وكارجو',
          englishName: 'Jeans',
          image: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'بناطيل',
        },
        {
          name: 'سويت شيرت وهوديز',
          englishName: 'Hoodies',
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'هوديز',
        },
        {
          name: 'شورتات وملابس رياضية',
          englishName: 'Sportswear',
          image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'رياضة',
        },
      ],
    },
    {
      id: 'girls',
      name: 'بناتي',
      englishName: 'Girls',
      categoryId: 'girls',
      subcategories: [
        {
          name: 'فساتين أميرات بناتي',
          englishName: 'Party Dresses',
          image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'فساتين',
        },
        {
          name: 'أطقم صيفية بناتي',
          englishName: 'Casual Sets',
          image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'أطقم',
        },
        {
          name: 'بجامات نوم قطنية',
          englishName: 'Girls Pajamas',
          image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'بجامات',
        },
        {
          name: 'تنانير وشورتات بناتي',
          englishName: 'Skirts & Shorts',
          image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'تنانير',
        },
        {
          name: 'إكسسوارات شعر وأطواق',
          englishName: 'Hair Accessories',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'إكسسوارات',
        },
        {
          name: 'صنادل وأحذية حفلات',
          englishName: 'Girls Shoes',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'أحذية',
        },
      ],
    },
    {
      id: 'baby',
      name: 'مواليد',
      englishName: 'Baby',
      categoryId: 'baby',
      subcategories: [
        {
          name: 'أفارولات ومواليد قطنية',
          englishName: 'Baby Rompers',
          image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'مواليد',
        },
        {
          name: 'أطقم هدايا واستقبال',
          englishName: 'Baby Gift Sets',
          image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'أطقم',
        },
        {
          name: 'مهادات وبطانيات ناعمة',
          englishName: 'Blankets & Wraps',
          image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'مهادات',
        },
        {
          name: 'مستلزمات العناية بالطفل',
          englishName: 'Baby Care Essentials',
          image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'مستلزمات',
        },
      ],
    },
    {
      id: 'shoes',
      name: 'أحذية',
      englishName: 'Shoes',
      categoryId: 'shoes',
      subcategories: [
        {
          name: 'أحذية رياضية سنيكرز',
          englishName: 'Sneakers',
          image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'سنيكرز',
        },
        {
          name: 'أحذية كعب عالي ومناسبات',
          englishName: 'High Heels',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'كعب',
        },
        {
          name: 'صنادل وشباشب صيفية',
          englishName: 'Sandals & Slides',
          image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'صنادل',
        },
        {
          name: 'أحذية كلاسيكية وفلات',
          englishName: 'Flats & Loafers',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'فلات',
        },
      ],
    },
    {
      id: 'bags',
      name: 'شنط',
      englishName: 'Bags',
      categoryId: 'bags',
      subcategories: [
        {
          name: 'حقائب يد نسائية أنيقة',
          englishName: 'Luxury Handbags',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'شنط يد',
        },
        {
          name: 'حقائب كروس وبوتيك',
          englishName: 'Crossbody Bags',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'كروس',
        },
        {
          name: 'حقائب ظهر كاجوال ومدرسية',
          englishName: 'Backpacks',
          image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'شنط ظهر',
        },
        {
          name: 'محافظ وحقائب نقود',
          englishName: 'Wallets & Clutches',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop',
          subcategoryQuery: 'محافظ',
        },
      ],
    },
  ];

  const [selectedSidebarId, setSelectedSidebarId] = useState('women');
  const currentCategoryGroup = sidebarItems.find((d) => d.id === selectedSidebarId) || sidebarItems[0];

  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-950 text-neutral-100 pb-20">
      {/* 1. Top Search Header matching Reference Screen 2 */}
      <div className="sticky top-0 z-40 bg-neutral-950 border-b border-neutral-850 px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white shrink-0"
          title="الرئيسية"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Search Input Box */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs sm:text-sm shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-neutral-300 font-medium">بحث في أقسام ضَجّة مول...</span>
          </div>
          <Camera className="w-4 h-4 text-neutral-400 hover:text-amber-400" />
        </button>
      </div>

      {/* 2. Top Horizontal Department Strip in Arabic matching Official Categories */}
      <div className="sticky top-[53px] z-30 border-b border-neutral-850 bg-neutral-900 px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {topTabs.map((tab) => {
          const isSelected = activeTopTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTopTab(tab.id);
                if (tab.id === 'all') {
                  setSelectedSidebarId('women');
                } else {
                  setSelectedSidebarId(tab.id);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800 text-amber-400 border border-amber-400/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 3. Full Screen Mobile UI (Vertical Sidebar on Right + 3-Column Squircle Grid on Left) */}
      <div className="flex-1 flex overflow-hidden">
        {/* RIGHT SIDE in RTL: Vertical Category Sidebar */}
        <div className="w-[100px] xs:w-[115px] sm:w-[135px] border-l border-neutral-850 bg-neutral-900/60 overflow-y-auto no-scrollbar divide-y divide-neutral-850/50 shrink-0">
          {sidebarItems.map((item) => {
            const isSelected = selectedSidebarId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  setSelectedSidebarId(item.id);
                  setActiveTopTab(item.id);
                }}
                className={`w-full text-right px-2.5 sm:px-3 py-3.5 transition-all flex flex-col justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-amber-400 font-black border-r-4 border-amber-400 shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80 font-bold'
                }`}
              >
                <span className="text-xs sm:text-sm tracking-tight line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[9px] text-neutral-500 font-medium mt-0.5 line-clamp-1">
                  {item.englishName}
                </span>
              </button>
            );
          })}
        </div>

        {/* LEFT SIDE in RTL: Main Subcategory Content Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto no-scrollbar space-y-3.5 bg-neutral-950">
          {/* Header Title for Current Category Group */}
          <div className="flex items-center justify-between pb-1 border-b border-neutral-850/80">
            <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>{currentCategoryGroup.name}</span>
            </h2>
            <button
              type="button"
              onClick={() => onSelectCategory(currentCategoryGroup.categoryId)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              <span>عرض كل القسم</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          {/* 3-Column Squircle Subcategory Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {currentCategoryGroup.subcategories.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCategory(currentCategoryGroup.categoryId, sub.subcategoryQuery || sub.name)}
                className="flex flex-col items-center gap-1.5 group focus:outline-none transition-transform active:scale-95 text-center cursor-pointer"
              >
                {/* Rounded Circle / Squircle Thumbnail */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-amber-400 shadow-sm p-0.5 transition-all">
                  <CachedImage
                    src={sub.image}
                    alt={sub.name}
                    preset="thumb"
                    containerClassName="w-full h-full rounded-full overflow-hidden"
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Subcategory Label in Arabic */}
                <span className="text-[11px] sm:text-xs font-bold text-neutral-200 group-hover:text-amber-300 line-clamp-2 leading-tight px-0.5">
                  {sub.name}
                </span>
              </button>
            ))}

            {/* View All Grid Box */}
            <button
              type="button"
              onClick={() => onSelectCategory(currentCategoryGroup.categoryId)}
              className="flex flex-col items-center gap-1.5 group focus:outline-none transition-transform active:scale-95 text-center cursor-pointer"
            >
              <div className="w-full aspect-square rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 flex flex-col items-center justify-center text-neutral-400 group-hover:text-amber-400 transition-colors p-1">
                <Grid className="w-6 h-6 mb-1 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400">تصفح الكل</span>
              </div>
              <span className="text-[11px] font-bold text-neutral-300 group-hover:text-white">
                جميع المنتجات
              </span>
            </button>
          </div>

          {/* Dajjah Mall Watermark */}
          <div className="pt-4 pb-2 text-center">
            <span className="text-[11px] font-black tracking-widest text-amber-400/60 uppercase">
              ✨ ضَجّة مول — DAJJAH MALL
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Sticky Register / Login Strip */}
      <div className="sticky bottom-0 z-30 bg-neutral-900 border-t border-neutral-850 px-3 py-2 flex items-center justify-between shadow-2xl">
        <span className="text-xs font-bold text-neutral-200 truncate">
          سجل الدخول واستمتع بالكثير من المزايا والعروض
        </span>
        <button
          type="button"
          onClick={onOpenAuth || onBackToHome}
          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow transition-all whitespace-nowrap"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>تسجيل الدخول</span>
        </button>
      </div>
    </div>
  );
};
