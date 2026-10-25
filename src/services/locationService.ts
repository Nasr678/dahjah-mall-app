import { RegionType } from '../types';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GeocodedAddress {
  city: string;
  district: string;
  street: string;
  region: RegionType;
  fullAddress: string;
  lat: number;
  lng: number;
}

export const YEMEN_CITY_COORDINATES: Record<string, { lat: number; lng: number; region: RegionType; districts: string[] }> = {
  'صنعاء': {
    lat: 15.3694,
    lng: 44.1910,
    region: 'north',
    districts: ['حدة', 'السبعين', 'الصافية', 'شعوب', 'التحرير', 'معين', 'بني الحارث', 'الأصبحي', 'الستين', 'شارع بغداد'],
  },
  'عدن': {
    lat: 12.7855,
    lng: 45.0187,
    region: 'south',
    districts: ['المنصورة', 'كريتر (صيرة)', 'المعلا', 'خور مكسر', 'الشيخ عثمان', 'التواهي', 'دار سعد', 'البريقة', 'إنماء'],
  },
  'تعز': {
    lat: 13.5789,
    lng: 44.0197,
    region: 'south',
    districts: ['صالة', 'المظفر', 'القاهرة', 'شارع جمال', 'بير باشا', 'عصيفرة', 'حي المسبح'],
  },
  'حضرموت (المكلا)': {
    lat: 14.5425,
    lng: 49.1242,
    region: 'south',
    districts: ['الشرج', 'المكلا القديمة', 'فوه', 'ديس المكلا', 'روكب', 'خلف'],
  },
  'حضرموت (سيئون)': {
    lat: 15.9388,
    lng: 48.7871,
    region: 'south',
    districts: ['وسط المدينة', 'حي السحيل', 'حي الوحدة', 'مريمة', 'تريم'],
  },
  'إب': {
    lat: 13.9667,
    lng: 44.1833,
    region: 'north',
    districts: ['الظهار', 'المشنة', 'العدين', 'شارع المحافظة', 'الدائري'],
  },
  'الحديدة': {
    lat: 14.7978,
    lng: 42.9545,
    region: 'north',
    districts: ['الميناء', 'الحوك', 'الحالي', 'الكورنيش', 'شارع صنعاء'],
  },
  'ذمار': {
    lat: 14.5500,
    lng: 44.4000,
    region: 'north',
    districts: ['وسط ذمار', 'حي السكنية', 'شارع المعارض', 'الجامعة'],
  },
  'مأرب': {
    lat: 15.4608,
    lng: 45.3267,
    region: 'south',
    districts: ['مدينة مأرب', 'حي الروضة', 'حي الفاو', 'شارع الأربعين'],
  },
  'صعدة': {
    lat: 16.9402,
    lng: 43.7639,
    region: 'north',
    districts: ['صعدة القديمة', 'شارع الجمهورية', 'حي السلام'],
  },
};

/**
 * Requests device GPS location using HTML5 Geolocation
 */
export async function getCurrentDeviceLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = 'تعذر تحديد الموقع الجغرافي';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'تم رفض الإذن بالوصول للموقع، يمكنك تحديد العنوان يدوياً';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'الموقع غير متاح حالياً';
        } else if (error.code === error.TIMEOUT) {
          msg = 'انتهت مهلة تحديد الموقع';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocodes coordinates to a Yemeni city & district
 */
export function reverseGeocodeYemen(lat: number, lng: number): GeocodedAddress {
  let closestCity = 'صنعاء';
  let minDistance = Infinity;

  for (const [cityName, data] of Object.entries(YEMEN_CITY_COORDINATES)) {
    const dLat = lat - data.lat;
    const dLng = lng - data.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cityName;
    }
  }

  const cityData = YEMEN_CITY_COORDINATES[closestCity] || YEMEN_CITY_COORDINATES['صنعاء'];
  const district = cityData.districts[0] || 'وسط المدينة';

  return {
    city: closestCity,
    district: district,
    street: `بالقرب من شارع ${district} الرئيسي`,
    region: cityData.region,
    fullAddress: `${closestCity} — حي ${district}`,
    lat,
    lng,
  };
}
