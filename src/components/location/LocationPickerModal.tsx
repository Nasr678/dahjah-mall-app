import React, { useState } from 'react';
import { 
  MapPin, 
  Check, 
  X, 
  Home, 
  Briefcase, 
  Bookmark, 
  Compass, 
  Building2,
  Phone,
  User
} from 'lucide-react';
import { Address, RegionType } from '../../types';
import { YEMEN_CITY_COORDINATES } from '../../services/locationService';
import { getRegionFromCity } from '../../services/currencyService';
import { LeafletLocationPicker } from '../maps/LeafletLocationPicker';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: Address) => void;
  initialAddress?: Address | null;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
  initialAddress,
}) => {
  const [addressTitle, setAddressTitle] = useState<'المنزل' | 'العمل' | 'عنوان آخر' | string>(initialAddress?.title || 'المنزل');
  const [recipientName, setRecipientName] = useState(initialAddress?.recipientName || '');
  const [phone, setPhone] = useState(initialAddress?.phone || '');
  const [city, setCity] = useState(initialAddress?.city || 'صنعاء');
  const [district, setDistrict] = useState(initialAddress?.district || '');
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [building, setBuilding] = useState(initialAddress?.building || '');
  const [notes, setNotes] = useState(initialAddress?.additionalNotes || '');
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? true);
  
  // Coordinates & Map State
  const defaultCoords = YEMEN_CITY_COORDINATES['صنعاء'] || { lat: 15.3694, lng: 44.1910 };
  const [lat, setLat] = useState<number>(initialAddress?.lat || defaultCoords.lat);
  const [lng, setLng] = useState<number>(initialAddress?.lng || defaultCoords.lng);
  const [isManualMode, setIsManualMode] = useState(false);

  if (!isOpen) return null;

  const handleCoordinatesChange = (newLat: number, newLng: number, geocodedInfo?: any) => {
    setLat(newLat);
    setLng(newLng);
    if (geocodedInfo) {
      if (geocodedInfo.city) setCity(geocodedInfo.city);
      if (geocodedInfo.district) setDistrict(geocodedInfo.district);
      if (geocodedInfo.street) setStreet(geocodedInfo.street);
    }
  };

  const handleSave = () => {
    const region: RegionType = getRegionFromCity(city);
    const newAddress: Address = {
      id: initialAddress?.id || `addr-${Date.now()}`,
      title: addressTitle,
      recipientName: recipientName.trim() || 'عميل ضَجّة',
      phone: phone.trim() || '777000000',
      city: city.trim() || 'صنعاء',
      district: district.trim() || 'وسط المدينة',
      street: street.trim() || 'الشارع الرئيسي',
      streetDetails: street.trim(),
      building: building.trim(),
      additionalNotes: notes.trim(),
      lat,
      lng,
      region,
      isDefault,
      createdAt: new Date().toISOString(),
    };

    onSaveAddress(newAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-2 sm:p-4 bg-neutral-950/50 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-neutral-950">تحديد عنوان التوصيل بدقة</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  OpenStreetMap
                </span>
              </div>
              <p className="text-xs text-neutral-500">حدد موقعك على الخريطة التفاعلية أو أدخل بيانات العنوان</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-[#F6F7F9] p-1.5 rounded-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                !isManualMode ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>الخريطة التفاعلية (OpenStreetMap)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                isManualMode ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>إدخال يدوي</span>
            </button>
          </div>

          {/* Interactive Leaflet Map (When not manual mode) */}
          {!isManualMode && (
            <div className="space-y-2 rounded-2xl overflow-hidden border border-neutral-200">
              <LeafletLocationPicker
                lat={lat}
                lng={lng}
                selectedCity={city}
                onCoordinatesChange={handleCoordinatesChange}
                className="h-[300px] sm:h-[340px]"
              />
            </div>
          )}

          {/* Address Title Selection (المنزل، العمل، عنوان آخر) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">نوع العنوان وتسميته:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'المنزل', icon: Home, label: 'المنزل' },
                { id: 'العمل', icon: Briefcase, label: 'العمل' },
                { id: 'عنوان آخر', icon: Bookmark, label: 'عنوان آخر' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = addressTitle === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAddressTitle(item.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                        : 'bg-[#F6F7F9] border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">اسم المستلم الثلاثي:</label>
              <div className="relative">
                <User className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="مثال: ناصر العناتي"
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">رقم الهاتف اليمني للتواصل:</label>
              <div className="relative">
                <Phone className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="777123456"
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs font-mono outline-none transition-colors tabular-nums"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* City & District Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">المحافظة / المدينة:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="صنعاء / عدن / تعز..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">المديرية / الحي:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="حدة / المنصورة / السبعين..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Street & Building Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">اسم الشارع والمعلم القريب:</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="شارع صخر — بجوار مركز الكمبيوتر"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">العمارة / رقم الشقة / المنزل:</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="عمارة النور - الطابق الثاني - شقة 4"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">ملاحظات إضافية لمندوب التوصيل (اختياري):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الاتصال قبل الوصول بـ 15 دقيقة، الباب البني بجوار البقالة"
              className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 focus:bg-white focus:border-amber-500 text-neutral-900 placeholder-neutral-400 text-xs outline-none transition-colors"
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="defaultAddressCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 bg-white border-neutral-300"
            />
            <label htmlFor="defaultAddressCheck" className="text-xs font-bold text-neutral-700 cursor-pointer">
              تعيين كعنوان توصيل افتراضي لحسابي
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-white/95 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-bold transition-all"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs sm:text-sm font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>حفظ وتثبيت العنوان</span>
          </button>
        </div>
      </div>
    </div>
  );
};
