import { DeliveryZone, Address } from '../types';

export const YEMENI_DELIVERY_ZONES: Record<string, DeliveryZone> = {
  'صنعاء': {
    id: 'zone-sanaa',
    city: 'صنعاء',
    region: 'north',
    baseDeliveryFeeYER: 1500, // 1500 base YER
    estimatedDuration: 'خلال 1-3 ساعات (توصيل فوري)',
    minHours: 1,
    maxHours: 3,
    freeShippingThresholdYER: 25000,
  },
  'عدن': {
    id: 'zone-aden',
    city: 'عدن',
    region: 'south',
    baseDeliveryFeeYER: 1500,
    estimatedDuration: 'خلال 1-4 ساعات (توصيل سريع)',
    minHours: 1,
    maxHours: 4,
    freeShippingThresholdYER: 25000,
  },
  'تعز': {
    id: 'zone-taiz',
    city: 'تعز',
    region: 'south',
    baseDeliveryFeeYER: 2500,
    estimatedDuration: 'خلال 24 ساعة',
    minHours: 12,
    maxHours: 24,
    freeShippingThresholdYER: 35000,
  },
  'حضرموت (المكلا)': {
    id: 'zone-mukalla',
    city: 'حضرموت (المكلا)',
    region: 'south',
    baseDeliveryFeeYER: 3000,
    estimatedDuration: 'خلال 24-48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 40000,
  },
  'حضرموت (سيئون)': {
    id: 'zone-seiyun',
    city: 'حضرموت (سيئون)',
    region: 'south',
    baseDeliveryFeeYER: 3500,
    estimatedDuration: 'خلال 24-48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 40000,
  },
  'إب': {
    id: 'zone-ibb',
    city: 'إب',
    region: 'north',
    baseDeliveryFeeYER: 2000,
    estimatedDuration: 'خلال 24 ساعة',
    minHours: 12,
    maxHours: 24,
    freeShippingThresholdYER: 30000,
  },
  'الحديدة': {
    id: 'zone-hodeidah',
    city: 'الحديدة',
    region: 'north',
    baseDeliveryFeeYER: 2000,
    estimatedDuration: 'خلال 24 ساعة',
    minHours: 12,
    maxHours: 24,
    freeShippingThresholdYER: 30000,
  },
  'ذمار': {
    id: 'zone-dhamar',
    city: 'ذمار',
    region: 'north',
    baseDeliveryFeeYER: 2000,
    estimatedDuration: 'خلال 24 ساعة',
    minHours: 12,
    maxHours: 24,
    freeShippingThresholdYER: 30000,
  },
  'مأرب': {
    id: 'zone-marib',
    city: 'مأرب',
    region: 'south',
    baseDeliveryFeeYER: 3000,
    estimatedDuration: 'خلال 24-48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 40000,
  },
  'صعدة': {
    id: 'zone-saada',
    city: 'صعدة',
    region: 'north',
    baseDeliveryFeeYER: 2500,
    estimatedDuration: 'خلال 24-48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 35000,
  },
  'لحج': {
    id: 'zone-lahj',
    city: 'لحج',
    region: 'south',
    baseDeliveryFeeYER: 2500,
    estimatedDuration: 'خلال 24 ساعة',
    minHours: 12,
    maxHours: 24,
    freeShippingThresholdYER: 35000,
  },
  'أبين': {
    id: 'zone-abyan',
    city: 'أبين',
    region: 'south',
    baseDeliveryFeeYER: 3000,
    estimatedDuration: 'خلال 24-48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 40000,
  },
  'شبوة': {
    id: 'zone-shabwah',
    city: 'شبوة',
    region: 'south',
    baseDeliveryFeeYER: 3500,
    estimatedDuration: 'خلال 48 ساعة',
    minHours: 24,
    maxHours: 48,
    freeShippingThresholdYER: 40000,
  },
  'المهرة': {
    id: 'zone-almahrah',
    city: 'المهرة',
    region: 'south',
    baseDeliveryFeeYER: 4500,
    estimatedDuration: 'خلال 48-72 ساعة',
    minHours: 48,
    maxHours: 72,
    freeShippingThresholdYER: 50000,
  },
};

const DEFAULT_ZONE: DeliveryZone = {
  id: 'zone-default',
  city: 'اليمن',
  region: 'north',
  baseDeliveryFeeYER: 2500,
  estimatedDuration: 'خلال 24-48 ساعة',
  minHours: 24,
  maxHours: 48,
  freeShippingThresholdYER: 35000,
};

export function getDeliveryZoneForCity(city: string, customZones?: any[]): DeliveryZone {
  if (customZones && customZones.length > 0) {
    for (const z of customZones) {
      if (z.isActive !== false && (city.includes(z.city) || z.city.includes(city) || (z.governorate && city.includes(z.governorate)))) {
        return {
          id: z.id,
          city: z.city,
          region: z.region || 'north',
          baseDeliveryFeeYER: z.baseDeliveryFeeYER,
          estimatedDuration: z.estimatedDuration,
          minHours: z.minHours || 1,
          maxHours: z.maxHours || 24,
          freeShippingThresholdYER: z.freeShippingThresholdYER || 25000,
        };
      }
    }
  }

  for (const [key, zone] of Object.entries(YEMENI_DELIVERY_ZONES)) {
    if (city.includes(key) || key.includes(city)) {
      return zone;
    }
  }
  return DEFAULT_ZONE;
}

export function calculateDeliveryFee(
  subtotalBaseYER: number,
  address?: Address | null,
  hasFreeDeliveryCoupon: boolean = false,
  customZones?: any[]
): { feeBaseYER: number; isFree: boolean; estimatedDuration: string; zone: DeliveryZone } {
  if (hasFreeDeliveryCoupon) {
    return {
      feeBaseYER: 0,
      isFree: true,
      estimatedDuration: address?.city ? getDeliveryZoneForCity(address.city, customZones).estimatedDuration : 'خلال 1-3 ساعات',
      zone: address?.city ? getDeliveryZoneForCity(address.city, customZones) : DEFAULT_ZONE,
    };
  }

  const zone = address?.city ? getDeliveryZoneForCity(address.city, customZones) : DEFAULT_ZONE;
  const isFree = subtotalBaseYER >= zone.freeShippingThresholdYER;

  return {
    feeBaseYER: isFree ? 0 : zone.baseDeliveryFeeYER,
    isFree,
    estimatedDuration: zone.estimatedDuration,
    zone,
  };
}

/**
 * Calculates distance in KM using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
