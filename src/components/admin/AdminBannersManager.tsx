import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { BannerItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_BANNERS } from '../../data/mockData';
import { uploadBrandImage } from '../../services/firebase';

export const AdminBannersManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();
  
  const banners: BannerItem[] = appSettings?.banners && appSettings.banners.length > 0
    ? appSettings.banners
    : DEFAULT_BANNERS;

  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [ctaText, setCtaText] = useState('تسوق الآن');
  const [linkType, setLinkType] = useState<BannerItem['linkType']>('category');
  const [linkTarget, setLinkTarget] = useState('women');
  const [discountPercentage, setDiscountPercentage] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop');
    setBadge('عرض خاص');
    setCtaText('تسوق الآن');
    setLinkType('category');
    setLinkTarget('women');
    setDiscountPercentage(30);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setDescription(b.description || '');
    setImageUrl(b.imageUrl);
    setBadge(b.badge || '');
    setCtaText(b.ctaText || 'تسوق الآن');
    setLinkType(b.linkType);
    setLinkTarget(b.linkTarget);
    setDiscountPercentage(b.discountPercentage);
    setIsActive(b.isActive !== false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadBrandImage(file);
      setImageUrl(url);
      showFeedback('success', 'تم رفع وتحسين صورة البانر بنجاح');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'تعذر رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      showFeedback('error', 'يرجى كتابة عنوان وتحديد صورة للبانر');
      return;
    }

    setIsSaving(true);
    try {
      let updatedBanners: BannerItem[];

      if (editingBanner) {
        // Edit existing
        updatedBanners = banners.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim(),
                badge: badge.trim(),
                ctaText: ctaText.trim(),
                linkType,
                linkTarget: linkTarget.trim(),
                discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
                isActive,
              }
            : b
        );
      } else {
        // Add new
        const newBanner: BannerItem = {
          id: `banner-${Date.now()}`,
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          badge: badge.trim(),
          ctaText: ctaText.trim(),
          linkType,
          linkTarget: linkTarget.trim(),
          discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
          isActive,
          order: banners.length + 1,
        };
        updatedBanners = [...banners, newBanner];
      }

      await updateAppSettings({ banners: updatedBanners });
      setIsModalOpen(false);
      showFeedback('success', editingBanner ? 'تم تحديث البانر بنجاح' : 'تمت إضافة البانر الجديد بنجاح');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'حدث خطأ أثناء حفظ البانر');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (banners.length <= 1) {
      showFeedback('error', 'يجب أن يحتوي التطبيق على بانر واحد على الأقل');
      return;
    }
    if (!window.confirm('هل أنت متأكد من حذف هذا البانر؟')) return;

    try {
      const updated = banners.filter((b) => b.id !== id);
      await updateAppSettings({ banners: updated });
      showFeedback('success', 'تم حذف البانر بنجاح');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'تعذر حذف البانر');
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const updated = banners.map((b) =>
        b.id === banner.id ? { ...b, isActive: !b.isActive } : b
      );
      await updateAppSettings({ banners: updated });
      showFeedback('success', banner.isActive ? 'تم إخفاء البانر من الواجهة' : 'تم تفعيل البانر في الواجهة');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'تعذر تغيير حالة البانر');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // re-assign order numbers
    const finalBanners = newBanners.map((b, idx) => ({ ...b, order: idx + 1 }));
    try {
      await updateAppSettings({ banners: finalBanners });
      showFeedback('success', 'تم تحديث ترتيب العرض بنجاح');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'تعذر حفظ الترتيب الجديد');
    }
  };

  return (
    <div className="space-y-6 text-right select-none" id="admin-banners-manager">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>إدارة البنرات الإعلانية وسلايدر الصفحة الرئيسية</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            تحكم كامل في صور ونصوص وخصومات وروابط البنرات التي تظهر في شريط الهيرو الرئيسي للتطبيق.
          </p>
        </div>

        <button
          type="button"
          id="btn-admin-add-banner"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بانر جديد</span>
        </button>
      </div>

      {/* Status Feedback */}
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

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, idx) => (
          <div
            key={banner.id || idx}
            className={`p-4 rounded-2xl bg-neutral-900 border transition-all ${
              banner.isActive !== false ? 'border-neutral-800' : 'border-neutral-850 opacity-60'
            }`}
          >
            {/* Banner Preview Thumbnail */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-white">
                <div className="text-right">
                  <span className="text-xs font-black drop-shadow-md line-clamp-1">{banner.title}</span>
                  {banner.subtitle && (
                    <span className="text-[10px] text-neutral-300 block line-clamp-1">{banner.subtitle}</span>
                  )}
                </div>
                {banner.discountPercentage && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black shrink-0">
                    خصم {banner.discountPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Banner Metadata & Action buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/80">
              <div className="flex items-center gap-1">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === banners.length - 1}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Active/Inactive Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    banner.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-500'
                  }`}
                  title={banner.isActive !== false ? 'إخفاء' : 'تفعيل'}
                >
                  {banner.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Edit & Delete Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(banner)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
              <h4 className="text-base font-black text-white">
                {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    العنوان الرئيسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: فساتين سهرة طويلة ترند"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">النص الترويجي (شارة / Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="مثال: ترندات الموسم أو خصم 40%"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-neutral-400 font-bold mb-1">النص الفرعي / التوضيحي</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="مثال: أحدث الموديلات التركية والعالمية بأسعار الجملة"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-1.5">
                <label className="block text-neutral-400 font-bold">
                  صورة البانر <span className="text-rose-500">*</span>
                </label>
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
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="أو ضع رابط مباشر للصورة..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Link Type & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">وجهة النقر</label>
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="category">قسم محدد (نساء، ولادي، شنط...)</option>
                    <option value="deals">صفحة العروض والتخفيضات</option>
                    <option value="external">رابط خارجي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">
                    {linkType === 'category' ? 'اختر القسم' : 'معرف الوجهة أو الرابط'}
                  </label>
                  {linkType === 'category' ? (
                    <select
                      value={linkTarget}
                      onChange={(e) => setLinkTarget(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      <option value="women">نساء</option>
                      <option value="boys">ولادي</option>
                      <option value="girls">بناتي</option>
                      <option value="baby">مواليد</option>
                      <option value="shoes">أحذية</option>
                      <option value="bags">شنط</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={linkTarget}
                      onChange={(e) => setLinkTarget(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    />
                  )}
                </div>
              </div>

              {/* Discount Percentage & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">نسبة الخصم المعروضة (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={discountPercentage || ''}
                    onChange={(e) => setDiscountPercentage(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="مثال: 30"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">نص زر الإجراء (CTA)</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="مثال: تسوق الآن"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Active Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-neutral-900 border-neutral-800"
                />
                <span className="text-neutral-300 font-bold">تفعيل البانر للظهور في الصفحة الرئيسية فوراً</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ البانر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
