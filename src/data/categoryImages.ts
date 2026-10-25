/**
 * Category & Subcategory visual assets & image mappings
 * Carefully curated to match the high-end editorial look in Dajjah Mall reference design
 */

export interface SubcategoryMeta {
  name: string;
  image: string;
  itemCount?: number;
}

export const MAIN_CATEGORY_METAS: Record<
  string,
  {
    name: string;
    englishName: string;
    image: string;
    bannerImage: string;
    sectionCountText: string;
    subcategories: SubcategoryMeta[];
  }
> = {
  women: {
    name: 'نسائي',
    englishName: 'Women',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '156 قسم',
    subcategories: [
      {
        name: 'فساتين',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop',
        itemCount: 48,
      },
      {
        name: 'بناطيل',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop',
        itemCount: 32,
      },
      {
        name: 'بلوزات',
        image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=400&auto=format&fit=crop',
        itemCount: 26,
      },
      {
        name: 'أرواب',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
        itemCount: 18,
      },
      {
        name: 'تنانير',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&auto=format&fit=crop',
        itemCount: 22,
      },
      {
        name: 'أطقم',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
        itemCount: 35,
      },
      {
        name: 'ملابس منزلية',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=400&auto=format&fit=crop',
        itemCount: 29,
      },
      {
        name: 'ملابس مناسبات',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
        itemCount: 24,
      },
    ],
  },
  boys: {
    name: 'رجالي',
    englishName: 'Men',
    image: 'https://images.unsplash.com/photo-1503944543280-75971723d5ce?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '276 قسم',
    subcategories: [
      {
        name: 'ملابس',
        image: 'https://images.unsplash.com/photo-1503944543280-75971723d5ce?q=80&w=400&auto=format&fit=crop',
        itemCount: 52,
      },
      {
        name: 'أطقم',
        image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca564?q=80&w=400&auto=format&fit=crop',
        itemCount: 38,
      },
      {
        name: 'تيشيرتات',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
        itemCount: 44,
      },
      {
        name: 'بناطيل',
        image: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=400&auto=format&fit=crop',
        itemCount: 30,
      },
      {
        name: 'قمصان',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
        itemCount: 22,
      },
      {
        name: 'ملابس منزلية',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop',
        itemCount: 19,
      },
      {
        name: 'ملابس مناسبات',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop',
        itemCount: 25,
      },
    ],
  },
  girls: {
    name: 'بناتي',
    englishName: 'Girls',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '198 قسم',
    subcategories: [
      {
        name: 'فساتين',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400&auto=format&fit=crop',
        itemCount: 46,
      },
      {
        name: 'أطقم',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=400&auto=format&fit=crop',
        itemCount: 34,
      },
      {
        name: 'بلوزات',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop',
        itemCount: 28,
      },
      {
        name: 'بناطيل',
        image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=400&auto=format&fit=crop',
        itemCount: 20,
      },
      {
        name: 'تنانير',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&auto=format&fit=crop',
        itemCount: 18,
      },
      {
        name: 'ملابس منزلية',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=400&auto=format&fit=crop',
        itemCount: 24,
      },
      {
        name: 'ملابس مناسبات',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
        itemCount: 22,
      },
    ],
  },
  baby: {
    name: 'أطفال',
    englishName: 'Kids',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '196 قسم',
    subcategories: [
      {
        name: 'ملابس أطفال',
        image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=400&auto=format&fit=crop',
        itemCount: 42,
      },
      {
        name: 'أطقم',
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=400&auto=format&fit=crop',
        itemCount: 36,
      },
      {
        name: 'مستلزمات',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=400&auto=format&fit=crop',
        itemCount: 28,
      },
      {
        name: 'إكسسوارات',
        image: 'https://images.unsplash.com/photo-1505377059067-e285a7bac49b?q=80&w=400&auto=format&fit=crop',
        itemCount: 20,
      },
      {
        name: 'بطانيات',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop',
        itemCount: 16,
      },
      {
        name: 'هدايا مواليد',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop',
        itemCount: 25,
      },
    ],
  },
  shoes: {
    name: 'أحذية',
    englishName: 'Shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '168 قسم',
    subcategories: [
      {
        name: 'نسائي',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop',
        itemCount: 54,
      },
      {
        name: 'رجالي',
        image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=400&auto=format&fit=crop',
        itemCount: 42,
      },
      {
        name: 'أطفال',
        image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop',
        itemCount: 30,
      },
      {
        name: 'رياضية',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop',
        itemCount: 40,
      },
      {
        name: 'صنادل',
        image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=400&auto=format&fit=crop',
        itemCount: 24,
      },
      {
        name: 'كاجوال',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=400&auto=format&fit=crop',
        itemCount: 36,
      },
    ],
  },
  bags: {
    name: 'شنط',
    englishName: 'Bags',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop',
    sectionCountText: '132 قسم',
    subcategories: [
      {
        name: 'نساء',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
        itemCount: 48,
      },
      {
        name: 'رجال',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop',
        itemCount: 26,
      },
      {
        name: 'أطفال',
        image: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?q=80&w=400&auto=format&fit=crop',
        itemCount: 20,
      },
      {
        name: 'سفر',
        image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=400&auto=format&fit=crop',
        itemCount: 22,
      },
      {
        name: 'حقائب يد',
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop',
        itemCount: 38,
      },
      {
        name: 'شنط ظهر',
        image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=400&auto=format&fit=crop',
        itemCount: 30,
      },
    ],
  },
};

/**
 * Helper to get a subcategory image fallback or specific image
 */
export const getSubcategoryImage = (categoryId: string, subcategoryName: string): string => {
  const category = MAIN_CATEGORY_METAS[categoryId];
  if (category) {
    const sub = category.subcategories.find(
      (s) => s.name.trim() === subcategoryName.trim() || subcategoryName.includes(s.name) || s.name.includes(subcategoryName)
    );
    if (sub?.image) return sub.image;
  }
  // Generic fallback if not matched
  return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop';
};
