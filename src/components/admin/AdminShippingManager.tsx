import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Percent, 
  Sliders,
  AlertCircle
} from 'lucide-react';
import { ShippingZoneConfig, RegionType } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { YEMENI_DELIVERY_ZONES } from '../../services/deliveryService';

export const AdminShippingManager: React.FC = () => {
  const { appSettings, updateAppSettings, formatPrice } = useMarketplace();

  // Load from AppSettings or fallback to default YEMENI_DELIVERY_ZONES
  const defaultZones: ShippingZoneConfig[] = Object.values(YEMENI_DELIVERY_ZONES).map((z, idx) => ({
    id: z.id || `zone_${idx}`,
    city: z.city,
    governorate: z.city,
    region: z.region,
    baseDeliveryFeeYER: z.baseDeliveryFeeYER,
    estimatedDuration: z.estimatedDuration,
    minHours: z.minHours || 1,
    maxHours: z.maxHours || 24,
    freeShippingThresholdYER: z.freeShippingThresholdYER || 25000,
    isFreeShippingEnabled: true,
    isActive: true,
    order: idx + 1,
  }));

  const shippingZones: ShippingZoneConfig[] = (appSettings.shippingZones && appSettings.shippingZones.length > 0)
    ? appSettings.shippingZones
    : defaultZones;

  const [editingZone, setEditingZone] = useState<ShippingZoneConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form State
  const [city, setCity] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [region, setRegion] = useState<RegionType>('north');
  const [baseDeliveryFeeYER, setBaseDeliveryFeeYER] = useState<number>(1500);
  const [estimatedDuration, setEstimatedDuration] = useState('خلال 2-4 ساعات (توصيل فوري)');
  const [minHours, setMinHours] = useState<number>(2);
  const [maxHours, setMaxHours] = useState<number>(4);
  const [freeShippingThresholdYER, setFreeShippingThresholdYER] = useState<number>(25000);
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingZone(null);
    setCity('');
    setGovernorate('');
    setRegion('north');
    setBaseDeliveryFeeYER(1500);
    setEstimatedDuration('خلال 1-3 ساعات (توصيل فوري)');
    setMinHours(1);
    setMaxHours(3);
    setFreeShippingThresholdYER(25000);
    setIsFreeShippingEnabled(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (zone: ShippingZoneConfig) => {
    setEditingZone(zone);
    setCity(zone.city);
    setGovernorate(zone.governorate || zone.city);
    setRegion(zone.region);
    setBaseDeliveryFeeYER(zone.baseDeliveryFeeYER);
    setEstimatedDuration(zone.estimatedDuration);
    setMinHours(zone.minHours || 1);
    setMaxHours(zone.maxHours || 24);
    setFreeShippingThresholdYER(zone.freeShippingThresholdYER);
    setIsFreeShippingEnabled(zone.isFreeShippingEnabled !== false);
    setIsActive(zone.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveZone = () => {
    if (!city.trim()) {
      alert('يرجى تحديد اسم المدينة / المحافظة');
      return;
    }

    let updated: ShippingZoneConfig[];

    if (editingZone) {
      updated = shippingZones.map((z) => {
        if (z.id === editingZone.id) {
          return {
            ...z,
            city: city.trim(),
            governorate: governorate.trim() || city.trim(),
            region,
            baseDeliveryFeeYER: Number(baseDeliveryFeeYER) || 0,
            estimatedDuration: estimatedDuration.trim(),
            minHours: Number(minHours) || 1,
            maxHours: Number(maxHours) || 24,
            freeShippingThresholdYER: Number(freeShippingThresholdYER) || 0,
            isFreeShippingEnabled,
            isActive,
          };
        }
        return z;
      });
    } else {
      const newZone: ShippingZoneConfig = {
        id: `zone_${Date.now()}`,
        city: city.trim(),
        governorate: governorate.trim() || city.trim(),
        region,
        baseDeliveryFeeYER: Number(baseDeliveryFeeYER) || 0,
        estimatedDuration: estimatedDuration.trim(),
        minHours: Number(minHours) || 1,
        maxHours: Number(maxHours) || 24,
        freeShippingThresholdYER: Number(freeShippingThresholdYER) || 0,
        isFreeShippingEnabled,
        isActive,
        order: shippingZones.length + 1,
      };
      updated = [...shippingZones, newZone];
    }

    updateAppSettings({ shippingZones: updated });
    setIsModalOpen(false);
    setSaveStatus('تم تحديث إعدادات الشحن بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggleZone = (zoneId: string) => {
    const updated = shippingZones.map((z) => {
      if (z.id === zoneId) {
        return { ...z, isActive: !z.isActive };
      }
      return z;
    });
    updateAppSettings({ shippingZones: updated });
  };

  const handleDeleteZone = (zoneId: string) => {
    if (window.confirm('هل أنت متأكد من حذف نطاق التوصيل هذا؟')) {
      const updated = shippingZones.filter((z) => z.id !== zoneId);
      updateAppSettings({ shippingZones: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">إدارة الشحن والمدن والمحافظات</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                تحديد رسوم التوصيل، حد الشحن المجاني، والمدة المتوقعة لكل مدينة ومحافظة يمنية.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة مدينة / نطاق توصيل جديد
        </button>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Zones Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800">قائمة المدن ورسوم التوصيل الحالية</span>
          <span className="text-xs text-slate-500">إجمالي {shippingZones.length} منطقة</span>
        </div>

        <div className="divide-y divide-slate-100">
          {shippingZones.map((zone) => {
            return (
              <div
                key={zone.id}
                className={`p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  !zone.isActive ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{zone.city}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                        zone.region === 'north' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {zone.region === 'north' ? 'المحافظات الشمالية' : 'المحافظات الجنوبية'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        رسوم التوصيل: {formatPrice(zone.baseDeliveryFeeYER)}
                      </span>

                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {zone.estimatedDuration}
                      </span>

                      {zone.isFreeShippingEnabled && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          شحن مجاني للطلبات فوق {formatPrice(zone.freeShippingThresholdYER)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleToggleZone(zone.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      zone.isActive 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {zone.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {zone.isActive ? 'متاح للتوصيل' : 'معطل مؤقتاً'}
                  </button>

                  <button
                    onClick={() => openEditModal(zone)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingZone ? 'تعديل نطاق التوصيل' : 'إضافة مدينة / نطاق توصيل جديد'}
                  </h3>
                  <p className="text-xs text-slate-500">حدد رسوم الشحن وشروط التوصيل المجاني</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدينة / المنطقة *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: صنعاء، عدن، تعز، المكلا..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النطاق الجغرافي للعملة</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as RegionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  >
                    <option value="north">المحافظات الشمالية (سعر الصرف الشمالي)</option>
                    <option value="south">المحافظات الجنوبية (سعر الصرف الجنوبي)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رسوم التوصيل الأساسية (ريال يمني)</label>
                  <input
                    type="number"
                    value={baseDeliveryFeeYER}
                    onChange={(e) => setBaseDeliveryFeeYER(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حد الشحن المجاني (ريال يمني)</label>
                  <input
                    type="number"
                    value={freeShippingThresholdYER}
                    onChange={(e) => setFreeShippingThresholdYER(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدة التقديرية للتوصيل (تظهر للعميل)</label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="مثال: خلال 1-3 ساعات (توصيل فوري)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreeShippingEnabled}
                    onChange={(e) => setIsFreeShippingEnabled(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">تفعيل ميزة الشحن المجاني عند بلوغ الحد</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">متاح لاستقبال الطلبات والتوصيل</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveZone}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ بيانات الشحن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingManager;
