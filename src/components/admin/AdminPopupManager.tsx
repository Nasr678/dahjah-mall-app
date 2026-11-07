import React, { useState, useRef } from 'react';
import { 
  Save, 
  Upload, 
  RefreshCw, 
  Gift, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { PopupOffer } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_POPUP_OFFER } from '../../data/mockData';
import { uploadBrandImage } from '../../services/firebase';

export const AdminPopupManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();
  
  const currentOffer: PopupOffer = appSettings?.popupOffer || DEFAULT_POPUP_OFFER;

  const [offerState, setOfferState] = useState<PopupOffer>(currentOffer);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadBrandImage(file);
      setOfferState((prev) => ({ ...prev, imageUrl: url }));
      showFeedback('success', 'تم رفع وتحسين صورة الإعلان المنبثق');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'تعذر رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAppSettings({ popupOffer: offerState });
      showFeedback('success', 'تم حفظ وتحديث إعدادات النافذة المنبثقة بنجاح');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right select-none" id="admin-popup-manager">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>إدارة نافذة العروض والخصومات المنبثقة (Popup Modal)</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          تحكم في العرض الترويجي المنبثق، الكوبون المرفق، نسبة الخصم، وتكرار الظهور لزوار التطبيق.
        </p>
      </div>

      {/* Feedback Message */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold ${
            msg.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="md:col-span-2 space-y-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 text-xs">
          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div>
              <span className="text-sm font-black text-white block">حالة النافذة المنبثقة</span>
              <span className="text-neutral-400 text-[11px]">
                {offerState.isActive ? 'مفعلة وتظهر تلقائياً للزوار' : 'معطلة ولن تظهر لأي زائر'}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={offerState.isActive}
                onChange={(e) => setOfferState((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-bold mb-1">العنوان الرئيسي للإعلان</label>
              <input
                type="text"
                required
                value={offerState.title}
                onChange={(e) => setOfferState((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-bold mb-1">العنوان الفرعي</label>
              <input
                type="text"
                value={offerState.subtitle || ''}
                onChange={(e) => setOfferState((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-400 font-bold mb-1">النص الترويجي والوصف</label>
            <textarea
              rows={2}
              value={offerState.description}
              onChange={(e) => setOfferState((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          {/* Image URL & Upload */}
          <div className="space-y-1.5">
            <label className="block text-neutral-400 font-bold">صورة العرض المنبثق</label>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Upload className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isUploading ? 'جاري الرفع...' : 'رفع صورة'}</span>
              </button>
              <input
                type="url"
                required
                value={offerState.imageUrl}
                onChange={(e) => setOfferState((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="رابط الصورة..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Coupon Code & Discount Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-bold mb-1">كود الكوبون المرفق</label>
              <input
                type="text"
                value={offerState.couponCode || ''}
                onChange={(e) => setOfferState((prev) => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                placeholder="مثال: DAJJAH30"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-black uppercase"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-bold mb-1">نسبة الخصم المعروضة (%)</label>
              <input
                type="number"
                min="0"
                max="99"
                value={offerState.discountPercentage || ''}
                onChange={(e) => setOfferState((prev) => ({ ...prev, discountPercentage: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="مثال: 30"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          {/* Timing & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-bold mb-1">تكرار الظهور</label>
              <select
                value={offerState.showFrequency || 'once_per_session'}
                onChange={(e) => setOfferState((prev) => ({ ...prev, showFrequency: e.target.value as any }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white cursor-pointer"
              >
                <option value="once_per_session">مرة واحدة لكل جلسة تصفح (موصى به)</option>
                <option value="once_per_day">مرة واحدة يومياً</option>
                <option value="always">في كل مرة يفتح التطبيق</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-400 font-bold mb-1">زمن التأخير قبل الظهور (ثواني)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={offerState.delaySeconds || 2}
                onChange={(e) => setOfferState((prev) => ({ ...prev, delaySeconds: Number(e.target.value) }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* CTA & Link Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-bold mb-1">نص زر الإجراء (CTA)</label>
              <input
                type="text"
                value={offerState.ctaText || 'تسوّق واستفد من العرض الآن'}
                onChange={(e) => setOfferState((prev) => ({ ...prev, ctaText: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-bold mb-1">قسم الوجهة عند النقر</label>
              <select
                value={offerState.linkTarget || 'women'}
                onChange={(e) => setOfferState((prev) => ({ ...prev, linkTarget: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white cursor-pointer"
              >
                <option value="women">نساء</option>
                <option value="boys">ولادي</option>
                <option value="girls">بناتي</option>
                <option value="baby">مواليد</option>
                <option value="shoes">أحذية</option>
                <option value="bags">شنط</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-neutral-850 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ إعدادات النافذة المنبثقة'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Visual Preview */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-neutral-400 block">معاينة حية لشكل النافذة المنبثقة:</span>
          
          <div className="p-4 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden text-right">
            {/* Mock Close Button */}
            <div className="absolute top-2 left-2 p-1 rounded-full bg-neutral-800 text-neutral-400">
              <EyeOff className="w-3 h-3" />
            </div>

            {/* Thumbnail */}
            <div className="relative w-full h-28 rounded-2xl overflow-hidden mb-3 bg-neutral-900 border border-neutral-800">
              <img
                src={offerState.imageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop'}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {offerState.discountPercentage && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px]">
                  خصم {offerState.discountPercentage}%
                </span>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">{offerState.title}</h4>
              {offerState.subtitle && (
                <p className="text-[11px] font-bold text-amber-400">{offerState.subtitle}</p>
              )}
              <p className="text-[10px] text-neutral-400 line-clamp-2">{offerState.description}</p>

              {/* Coupon Preview */}
              {offerState.couponCode && (
                <div className="p-2 rounded-xl bg-neutral-900 border border-dashed border-amber-500/40 flex items-center justify-between text-[11px]">
                  <span className="text-[9px] text-neutral-400">كوبون مفعّل:</span>
                  <span className="font-mono font-black text-amber-400">{offerState.couponCode}</span>
                </div>
              )}

              {/* CTA Preview */}
              <div className="w-full py-2 rounded-xl bg-amber-400 text-neutral-950 text-center font-black text-xs mt-2">
                {offerState.ctaText || 'تسوّق الآن'}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
