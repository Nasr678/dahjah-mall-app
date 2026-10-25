import L from 'leaflet';

/**
 * Leaflet & OpenStreetMap Service for Dajjah Mall
 * 100% Free, Open-Source, and zero API Key or billing needed.
 */

// Tile Layer Providers (OpenStreetMap & CARTO)
export const OSM_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

export const OSM_HOT_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
  maxZoom: 19,
};

export const CARTO_DARK_TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 20,
};

/**
 * Default Center Coordinates (Yemen / Sana'a & Aden)
 */
export const DEFAULT_YEMEN_CENTER: [number, number] = [15.3694, 44.1910]; // Sana'a
export const SOUTH_YEMEN_CENTER: [number, number] = [12.7855, 45.0187]; // Aden

/**
 * Store & Hub Branch Locations in Yemen for Dajjah Mall
 */
export interface DajjahBranchLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  workingHours: string;
  lat: number;
  lng: number;
  type: 'main_hub' | 'boutique' | 'pickup_point';
  rating: number;
}

export const DAJJAH_BRANCHES: DajjahBranchLocation[] = [
  {
    id: 'branch-sanaa-hadda',
    nameAr: 'مركز ضَجّة مول الرئيسي — حدة',
    nameEn: 'Dajjah Mall Flagship — Hadda',
    city: 'صنعاء',
    district: 'حدة',
    address: 'شارع حدة — تقاطع شارع بغداد — مقابل المركز التجاري',
    phone: '+967 777 123 456',
    workingHours: '9:00 ص - 11:30 م (يومياً)',
    lat: 15.3324,
    lng: 44.1852,
    type: 'main_hub',
    rating: 4.9,
  },
  {
    id: 'branch-sanaa-sixty',
    nameAr: 'فرع ضَجّة مول ومركز الشحن — الستين الجنوبي',
    nameEn: 'Dajjah Logistics Hub — 60th St',
    city: 'صنعاء',
    district: 'الستين',
    address: 'شارع الستين الجنوبي — بجوار جسر المصباحي',
    phone: '+967 777 888 999',
    workingHours: '8:30 ص - 11:00 م',
    lat: 15.3218,
    lng: 44.2045,
    type: 'pickup_point',
    rating: 4.8,
  },
  {
    id: 'branch-aden-mansoura',
    nameAr: 'مركز ضَجّة الإقليمي — عدن المنصورة',
    nameEn: 'Dajjah Mall Hub — Aden Mansoura',
    city: 'عدن',
    district: 'المنصورة',
    address: 'حي المنصورة — شارع التسعين — بجوار مجمع النخبة',
    phone: '+967 733 456 789',
    workingHours: '9:30 ص - 12:00 منتصف الليل',
    lat: 12.8628,
    lng: 44.9873,
    type: 'main_hub',
    rating: 4.9,
  },
  {
    id: 'branch-aden-crater',
    nameAr: 'بوتيك ضَجّة للأزياء — كريتر صيرة',
    nameEn: 'Dajjah Fashion Boutique — Crater',
    city: 'عدن',
    district: 'كريتر (صيرة)',
    address: 'سوق كريتر القديم — شارع أروى',
    phone: '+967 733 999 111',
    workingHours: '10:00 ص - 11:00 م',
    lat: 12.7794,
    lng: 45.0367,
    type: 'boutique',
    rating: 4.7,
  },
  {
    id: 'branch-taiz-gamal',
    nameAr: 'فرع ضَجّة مول — تعز شارع جمال',
    nameEn: 'Dajjah Branch — Taiz Gamal St',
    city: 'تعز',
    district: 'شارع جمال',
    address: 'شارع جمال عبد الناصر — وسط المدينة',
    phone: '+967 771 222 333',
    workingHours: '9:00 ص - 10:30 م',
    lat: 13.5794,
    lng: 44.0205,
    type: 'boutique',
    rating: 4.8,
  },
  {
    id: 'branch-mukalla-fowa',
    nameAr: 'مركز استلام وشحن حضرموت — المكلا فوه',
    nameEn: 'Dajjah Hub — Mukalla Fowa',
    city: 'حضرموت (المكلا)',
    district: 'فوه',
    address: 'شارع الستين البحري — منطقة فوه القديمة',
    phone: '+967 775 666 444',
    workingHours: '9:00 ص - 11:00 م',
    lat: 14.5312,
    lng: 49.0984,
    type: 'pickup_point',
    rating: 4.9,
  },
  {
    id: 'branch-ibb-khalid',
    nameAr: 'فرع ضَجّة مول — إب شارع تعز',
    nameEn: 'Dajjah Branch — Ibb Taiz St',
    city: 'إب',
    district: 'وسط إب',
    address: 'شارع تعز العام — بجوار برج السلام',
    phone: '+967 772 333 111',
    workingHours: '9:00 ص - 11:00 م',
    lat: 13.9667,
    lng: 44.1833,
    type: 'boutique',
    rating: 4.8,
  },
];

/**
 * Custom High-Quality Leaflet HTML Marker Icons (Dajjah Mall Luxury Theme)
 */
export function createCustomMarkerIcon(type: 'user_pin' | 'courier' | 'store' | 'hub' | 'pickup', title?: string): L.DivIcon {
  let iconHtml = '';
  let iconSize: [number, number] = [36, 44];
  let iconAnchor: [number, number] = [18, 42];

  switch (type) {
    case 'user_pin':
      iconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white shadow-2xl flex items-center justify-center text-neutral-950 transition-transform transform group-hover:scale-110">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div class="w-2.5 h-2.5 bg-neutral-900 rotate-45 -mt-1.5 border-r-2 border-b-2 border-white"></div>
        </div>
      `;
      iconSize = [40, 48];
      iconAnchor = [20, 44];
      break;

    case 'courier':
      iconHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-11 h-11 rounded-2xl bg-amber-500 text-neutral-950 border-2 border-white shadow-2xl flex items-center justify-center animate-bounce">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-18 0h18m-18 0l2.25-6.75h13.5l2.25 6.75" />
            </svg>
          </div>
          <span class="text-[10px] font-black bg-neutral-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 shadow mt-1 whitespace-nowrap">
            الكابتن في الطريق
          </span>
        </div>
      `;
      iconSize = [80, 56];
      iconAnchor = [40, 48];
      break;

    case 'store':
    case 'hub':
      iconHtml = `
        <div class="relative flex flex-col items-center group">
          <div class="w-10 h-10 rounded-2xl bg-neutral-900 text-amber-400 border-2 border-amber-500 shadow-xl flex items-center justify-center transition-transform transform group-hover:scale-110">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V10.5m18 10.5h3.75A2.25 2.25 0 0024 18.75V10.5M3 10.5l9-7.5 9 7.5" />
            </svg>
          </div>
          ${title ? `<span class="text-[10px] font-bold bg-neutral-950/95 text-amber-300 px-1.5 py-0.5 rounded border border-neutral-800 shadow mt-1 whitespace-nowrap">${title}</span>` : ''}
        </div>
      `;
      iconSize = [60, 50];
      iconAnchor = [30, 40];
      break;

    case 'pickup':
    default:
      iconHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-9 h-9 rounded-2xl bg-emerald-600 text-white border-2 border-white shadow-xl flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span class="text-[10px] font-bold bg-neutral-950 text-emerald-400 px-1.5 py-0.5 rounded border border-neutral-800 shadow mt-1 whitespace-nowrap">
            وجهة التسليم
          </span>
        </div>
      `;
      iconSize = [70, 50];
      iconAnchor = [35, 40];
      break;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize,
    iconAnchor,
  });
}
