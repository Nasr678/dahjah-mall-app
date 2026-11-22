import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Upload, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2
} from 'lucide-react';
import { BranchItem } from '../../types';
import { DEFAULT_BRANCHES } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';
import { uploadProductImage } from '../../services/firebase';

export const AdminBranchesManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();

  const currentBranches: BranchItem[] = appSettings?.branches && appSettings.branches.length > 0
    ? appSettings.branches
    : DEFAULT_BRANCHES;

  const [branches, setBranches] = useState<BranchItem[]>(currentBranches);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phone, setPhone] = useState('+967 777 123 456');
  const [workingHoursAr, setWorkingHoursAr] = useState('يومياً: 9:00 ص – 11:30 م');
  const [workingHoursEn, setWorkingHoursEn] = useState('Daily: 9:00 AM – 11:30 PM');
  const [image, setImage] = useState('');
  const [lat, setLat] = useState<number | undefined>(15.3483);
  const [lng, setLng] = useState<number | undefined>(44.1915);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setAddressAr('');
    setAddressEn('');
    setPhone('+967 777 123 456');
    setWorkingHoursAr('يومياً: 9:00 ص – 11:30 م');
    setWorkingHoursEn('Daily: 9:00 AM – 11:30 PM');
    setImage('');
    setLat(15.3483);
    setLng(44.1915);
    setGoogleMapsUrl('');
    setIsActive(true);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartEdit = (b: BranchItem) => {
    setEditingId(b.id);
    setNameAr(b.nameAr);
    setNameEn(b.nameEn || '');
    setAddressAr(b.addressAr);
    setAddressEn(b.addressEn || '');
    setPhone(b.phone);
    setWorkingHoursAr(b.workingHoursAr);
    setWorkingHoursEn(b.workingHoursEn || '');
    setImage(b.image || '');
    setLat(b.lat);
    setLng(b.lng);
    setGoogleMapsUrl(b.googleMapsUrl || '');
    setIsActive(b.isActive !== false);
    setIsAdding(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImage(url);
    } catch (err) {
      console.error('Error uploading branch image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !addressAr.trim()) {
      alert('يرجى كتابة اسم الفرع وعنوانه على الأقل.');
      return;
    }

    const branchData: BranchItem = {
      id: editingId || `branch-${Date.now()}`,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || undefined,
      addressAr: addressAr.trim(),
      addressEn: addressEn.trim() || undefined,
      phone: phone.trim(),
      workingHoursAr: workingHoursAr.trim(),
      workingHoursEn: workingHoursEn.trim() || undefined,
      image: image.trim() || undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      googleMapsUrl: googleMapsUrl.trim() || (lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : undefined),
      isActive,
      order: branches.length + 1,
    };

    let updatedList: BranchItem[];
    if (editingId) {
      updatedList = branches.map((b) => (b.id === editingId ? branchData : b));
    } else {
      updatedList = [...branches, branchData];
    }

    setBranches(updatedList);
    resetForm();

    // Auto sync to Firestore
    setIsSaving(true);
    try {
      await updateAppSettings({ branches: updatedList });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving branches to Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفرع نهائياً؟')) return;
    const updatedList = branches.filter((b) => b.id !== id);
    setBranches(updatedList);
    if (editingId === id) resetForm();

    setIsSaving(true);
    try {
      await updateAppSettings({ branches: updatedList });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error deleting branch from Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const updatedList = branches.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    setBranches(updatedList);
    setIsSaving(true);
    try {
      await updateAppSettings({ branches: updatedList });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating branch status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-neutral-950 tabular-nums">إدارة الفروع والمواقع الجغرافية ({branches.length})</h3>
            <p className="text-xs text-neutral-500">إضافة فروع المتجر في صنعاء وعدن وباقي المحافظات وتحديد إحداثيات Google Maps وساعات العمل</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding && !editingId && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          )}

          {saveSuccess && (
            <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم الحفظ في Firestore</span>
            </span>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal or Panel */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSaveItem} className="p-5 rounded-2xl bg-white border-2 border-amber-400 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h4 className="text-sm font-black text-neutral-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>{editingId ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}</span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">اسم الفرع (بالعربي) *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: فرع صنعاء — شارع حدة"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">اسم الفرع (بالإنجليزي - اختياري)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Sanaa Branch - Hadda St"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Arabic Address */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">العنوان التفصيلي (بالعربي) *</label>
              <input
                type="text"
                required
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                placeholder="مثال: شارع حدة، مقابل مركز الكميم التجاري"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* English Address */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">العنوان (بالإنجليزي)</label>
              <input
                type="text"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="Hadda Street, opposite Al-Kumaim"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">رقم الهاتف / الاتصال *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+967 777 123 456"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none tabular-nums"
              />
            </div>

            {/* Working Hours */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">ساعات العمل والدوام *</label>
              <input
                type="text"
                required
                value={workingHoursAr}
                onChange={(e) => setWorkingHoursAr(e.target.value)}
                placeholder="يومياً: 9:00 ص – 11:30 م"
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">خط العرض (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={lat || ''}
                  onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="15.3483"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs tabular-nums focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">خط الطول (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={lng || ''}
                  onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="44.1915"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs tabular-nums focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Google Maps URL */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">رابط خريطة Google Maps (اختياري)</label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Image URL & Upload */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-neutral-700 block mb-1">صورة واجهة الفرع</label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... أو قم برفع صورة من جهازك"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                />
                <label className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-neutral-200">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{isUploading ? 'جاري الرفع...' : 'رفع صورة'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {image && (
                <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-neutral-200">
                  <img src={image} alt="معاينة" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="branch-active-checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="branch-active-checkbox" className="text-xs font-bold text-neutral-900 cursor-pointer">
                تفعيل الفرع وإظهاره للعملاء في التطبيق
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'حفظ التعديلات' : 'إضافة ونشر الفرع'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl bg-white border transition-all shadow-xs ${
              b.isActive !== false ? 'border-neutral-200 hover:border-amber-300' : 'border-neutral-200 opacity-65'
            } flex flex-col justify-between space-y-4`}
          >
            {/* Image / Header */}
            <div className="space-y-3">
              <div className="relative h-36 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                {b.image ? (
                  <img src={b.image} alt={b.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      b.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {b.isActive !== false ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-neutral-950">{b.nameAr}</h4>
                {b.nameEn && <span className="text-[10px] text-neutral-500">{b.nameEn}</span>}
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{b.addressAr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span dir="ltr" className="font-mono text-neutral-800 tabular-nums">{b.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>{b.workingHoursAr}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {b.googleMapsUrl && (
                  <a
                    href={b.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-amber-600 text-xs transition-colors"
                    title="فتح في Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleActive(b.id)}
                  className={`p-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                    b.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:text-neutral-900'
                  }`}
                  title={b.isActive !== false ? 'تعطيل الفرع' : 'تفعيل الفرع'}
                >
                  {b.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEdit(b)}
                  className="px-3 py-1.5 rounded-xl bg-[#F6F7F9] hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
