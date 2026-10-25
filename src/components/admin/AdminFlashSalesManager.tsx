import React, { useState, useRef } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  Percent, 
  Upload, 
  Tag, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FlashSaleConfig } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { compressImage } from '../../services/firebase';

export const AdminFlashSalesManager: React.FC = () => {
  const { appSettings, updateAppSettings, products, formatPrice } = useMarketplace();

  const defaultFlashSales: FlashSaleConfig[] = [
    {
      id: 'flash_deal_1',
      title: 'عاصفة التخفيضات الكبرى — خصومات تصل إلى 50%',
      titleEn: 'Grand Flash Sale Up to 50%',
      subtitle: 'أقوى الصفقات الحصرية لفترة محدودة جداً مع شحن فوري',
      description: 'عروض ضجة مول الحصرية على أفضل التشكيلات الملكية والأحذية والشنط',
      bannerImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000',
      discountPercentage: 45,
      productIds: ['prod-w-1', 'prod-s-1', 'prod-bg-1'],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      isActive: true,
      order: 1,
    },
  ];

  const salesList: FlashSaleConfig[] = (appSettings.flashSales && appSettings.flashSales.length > 0)
    ? appSettings.flashSales
    : defaultFlashSales;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSaleConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(40);
  const [bannerImage, setBannerImage] = useState('');
  const [endDate, setEndDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 16));
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingSale(null);
    setTitle('');
    setSubtitle('');
    setDiscountPercentage(40);
    setBannerImage('');
    setEndDate(new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 16));
    setSelectedProductIds([]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (sale: FlashSaleConfig) => {
    setEditingSale(sale);
    setTitle(sale.title);
    setSubtitle(sale.subtitle || '');
    setDiscountPercentage(sale.discountPercentage);
    setBannerImage(sale.bannerImage || '');
    setEndDate(sale.endDate ? new Date(sale.endDate).toISOString().slice(0, 16) : '');
    setSelectedProductIds(sale.productIds || []);
    setIsActive(sale.isActive);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('يرجى كتابة عنوان العرض');
      return;
    }

    let updated: FlashSaleConfig[];

    if (editingSale) {
      updated = salesList.map((s) => {
        if (s.id === editingSale.id) {
          return {
            ...s,
            title: title.trim(),
            subtitle: subtitle.trim(),
            discountPercentage: Number(discountPercentage) || 0,
            bannerImage: bannerImage.trim() || undefined,
            endDate: new Date(endDate).toISOString(),
            productIds: selectedProductIds,
            isActive,
          };
        }
        return s;
      });
    } else {
      const newSale: FlashSaleConfig = {
        id: `flash_${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim(),
        discountPercentage: Number(discountPercentage) || 0,
        bannerImage: bannerImage.trim() || undefined,
        startDate: new Date().toISOString(),
        endDate: new Date(endDate).toISOString(),
        productIds: selectedProductIds,
        isActive,
        order: salesList.length + 1,
      };
      updated = [...salesList, newSale];
    }

    updateAppSettings({ flashSales: updated });
    setIsModalOpen(false);
    setSaveStatus('تم حفظ العرض الخاطف بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggle = (id: string) => {
    const updated = salesList.map((s) => {
      if (s.id === id) return { ...s, isActive: !s.isActive };
      return s;
    });
    updateAppSettings({ flashSales: updated });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      const updated = salesList.filter((s) => s.id !== id);
      updateAppSettings({ flashSales: updated });
    }
  };

  const toggleProductSelection = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 1000, 0.85);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error uploading:', err);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">إدارة العروض الخاطفة وتخفيضات الوقت المحدود</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                تحديد مواعيد البداية والنهاية، والمنتجات المشمولة في قسم العروض الخاطفة.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إنشاء عرض خاطف جديد
        </button>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {salesList.map((sale) => {
          const isExpired = sale.endDate ? new Date(sale.endDate).getTime() < Date.now() : false;

          return (
            <div
              key={sale.id}
              className={`p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                !sale.isActive || isExpired ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {sale.bannerImage ? (
                    <img src={sale.bannerImage} alt={sale.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-500 bg-red-50">
                      <Flame className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{sale.title}</h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 rounded-md">
                      خصم {sale.discountPercentage}%
                    </span>
                    {isExpired && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-slate-200 text-slate-600 rounded-md">
                        منتهي الصلاحية
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1">{sale.subtitle}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      ينتهي في: {sale.endDate ? new Date(sale.endDate).toLocaleDateString('ar-YE') : 'مستمر'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{sale.productIds?.length || 0} منتج مشمول بالعرض</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleToggle(sale.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    sale.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {sale.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {sale.isActive ? 'نشط بالواجهة' : 'معطل'}
                </button>

                <button
                  onClick={() => openEditModal(sale)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(sale.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSale ? 'تعديل العرض الخاطف' : 'إنشاء عرض خاطف جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان العرض الخاطف *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خصم الصيف الحارق — 50% على الفساتين الملكية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف تسويقي قصير</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="مثال: لفترة محدودة وحتى نفاد الكمية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ ووقت انتهاء العرض</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">صورة / بانر العرض</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="رابط الصورة أو اضغط للرفع..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
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
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'جاري الرفع...' : 'رفع'}
                  </button>
                </div>
              </div>

              {/* Products Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر المنتجات المشمولة في هذا العرض ({selectedProductIds.length} محددة):
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100 space-y-1">
                  {products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductSelection(p.id)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                          />
                          <span className="font-semibold text-slate-800">{p.name}</span>
                        </div>
                        <span className="font-bold text-slate-600">{formatPrice(p.priceYER)}</span>
                      </label>
                    );
                  })}
                </div>
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
                onClick={handleSave}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ العرض الخاطف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSalesManager;
