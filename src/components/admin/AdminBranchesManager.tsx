import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Upload, 
  Eye, 
  EyeOff, 
  Save, 
  Image as ImageIcon,
  Compass,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">إدارة الفروع والمواقع الجغرافية ({branches.length})</h3>
            <p className="text-xs text-neutral-400">إضافة فروع المتجر في صنعاء وعدن وباقي المحافظات وتحديد إحداثيات Google Maps وساعات العمل</p>
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
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          )}

          {saveSuccess && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم الحفظ في Firestore</span>
            </span>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal or Panel */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSaveItem} className="p-5 rounded-3xl bg-neutral-900 border-2 border-amber-400/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{editingId ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}</span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">اسم الفرع (بالعربي) *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: فرع صنعاء — شارع حدة"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">اسم الفرع (بالإنجليزي - اختياري)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Sanaa Branch - Hadda St"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Arabic Address */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">العنوان التفصيلي (بالعربي) *</label>
              <input
                type="text"
                required
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                placeholder="مثال: شارع حدة، مقابل مركز الكميم التجاري"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* English Address */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">العنوان (بالإنجليزي)</label>
              <input
                type="text"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="Hadda Street, opposite Al-Kumaim"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">رقم الهاتف / الاتصال *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+967 777 123 456"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Working Hours */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">ساعات العمل والدوام *</label>
              <input
                type="text"
                required
                value={workingHoursAr}
                onChange={(e) => setWorkingHoursAr(e.target.value)}
                placeholder="يومياً: 9:00 ص – 11:30 م"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">خط العرض (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={lat || ''}
                  onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="15.3483"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">خط الطول (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={lng || ''}
                  onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="44.1915"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Google Maps URL */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">رابط خريطة Google Maps (اختياري)</label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Image URL & Upload */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-neutral-300 block mb-1">صورة واجهة الفرع</label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... أو قم برفع صورة من جهازك"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
                <label className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-neutral-700">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{isUploading ? 'جاري الرفع...' : 'رفع صورة'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {image && (
                <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-neutral-750">
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
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
              <label htmlFor="branch-active-checkbox" className="text-xs font-bold text-white cursor-pointer">
                تفعيل الفرع وإظهاره للعملاء في التطبيق
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
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
            className={`p-4 rounded-3xl bg-neutral-900/90 border transition-all ${
              b.isActive !== false ? 'border-neutral-800 hover:border-amber-400/50' : 'border-neutral-850 opacity-60'
            } flex flex-col justify-between space-y-4`}
          >
            {/* Image / Header */}
            <div className="space-y-3">
              <div className="relative h-36 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800">
                {b.image ? (
                  <img src={b.image} alt={b.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      b.isActive !== false ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {b.isActive !== false ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{b.nameAr}</h4>
                {b.nameEn && <span className="text-[10px] text-neutral-400">{b.nameEn}</span>}
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{b.addressAr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span dir="ltr" className="font-mono text-neutral-200">{b.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{b.workingHoursAr}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {b.googleMapsUrl && (
                  <a
                    href={b.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-amber-400 text-xs transition-colors"
                    title="فتح في Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleActive(b.id)}
                  className={`p-2 rounded-xl text-xs transition-colors ${
                    b.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-neutral-800 text-neutral-400 hover:text-white'
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
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
