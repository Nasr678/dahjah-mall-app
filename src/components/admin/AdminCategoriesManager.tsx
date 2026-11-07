import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Upload, 
  FolderTree
} from 'lucide-react';
import { Category, SubcategoryDetail } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { compressImage } from '../../services/firebase';

export const AdminCategoriesManager: React.FC = () => {
  const { categories, updateCategory, products } = useMarketplace();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || 'women');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Subcategory modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
  const [subName, setSubName] = useState('');
  const [subEnglishName, setSubEnglishName] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subFallbackImage, setSubFallbackImage] = useState('');
  const [subIsActive, setSubIsActive] = useState(true);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Category Edit State
  const [catName, setCatName] = useState('');
  const [catEnglishName, setCatEnglishName] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catFallbackImage, setCatFallbackImage] = useState('');
  const [catBannerImage, setCatBannerImage] = useState('');

  const openCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatEnglishName(cat.englishName);
    setCatSubtitle(cat.subtitle || '');
    setCatDescription(cat.description || '');
    setCatImage(cat.image);
    setCatFallbackImage(cat.fallbackImage || '');
    setCatBannerImage(cat.bannerImage || '');
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      name: catName.trim() || editingCategory.name,
      englishName: catEnglishName.trim() || editingCategory.englishName,
      subtitle: catSubtitle.trim() || undefined,
      description: catDescription.trim() || undefined,
      image: catImage.trim() || editingCategory.image,
      fallbackImage: catFallbackImage.trim() || undefined,
      bannerImage: catBannerImage.trim() || undefined,
    });
    setIsCatModalOpen(false);
    setSaveStatus('تم تحديث بيانات وصور القسم بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleUploadCatImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, target === 'banner' ? 1200 : 600, 0.85);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'image') setCatImage(reader.result as string);
        if (target === 'banner') setCatBannerImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error uploading:', err);
      setIsUploading(false);
    }
  };

  // Subcategory management
  const openAddSubcategory = () => {
    setEditingSubIndex(null);
    setSubName('');
    setSubEnglishName('');
    setSubImage('');
    setSubFallbackImage('');
    setSubIsActive(true);
    setIsSubModalOpen(true);
  };

  const openEditSubcategory = (index: number, subNameValue: string) => {
    setEditingSubIndex(index);
    const existingDetail = currentCategory.subcategoryDetails?.find((s) => s.name === subNameValue);
    setSubName(subNameValue);
    setSubEnglishName(existingDetail?.englishName || '');
    setSubImage(existingDetail?.image || '');
    setSubFallbackImage(existingDetail?.fallbackImage || '');
    setSubIsActive(existingDetail?.isActive !== false);
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = () => {
    if (!subName.trim()) {
      alert('يرجى كتابة اسم القسم الفرعي');
      return;
    }

    const currentSubNames = [...currentCategory.subcategories];
    let updatedDetails = [...(currentCategory.subcategoryDetails || [])];

    if (editingSubIndex !== null) {
      // Editing
      const oldName = currentSubNames[editingSubIndex];
      currentSubNames[editingSubIndex] = subName.trim();

      const detailIndex = updatedDetails.findIndex((s) => s.name === oldName || s.id === `sub_${editingSubIndex}`);
      const newDetail: SubcategoryDetail = {
        id: detailIndex >= 0 ? updatedDetails[detailIndex].id : `sub_${Date.now()}`,
        name: subName.trim(),
        englishName: subEnglishName.trim() || undefined,
        categoryId: currentCategory.id,
        image: subImage.trim() || undefined,
        fallbackImage: subFallbackImage.trim() || undefined,
        isActive: subIsActive,
      };

      if (detailIndex >= 0) {
        updatedDetails[detailIndex] = newDetail;
      } else {
        updatedDetails.push(newDetail);
      }
    } else {
      // Adding new
      if (currentSubNames.includes(subName.trim())) {
        alert('هذا القسم الفرعي موجود مسبقاً!');
        return;
      }
      currentSubNames.push(subName.trim());
      updatedDetails.push({
        id: `sub_${Date.now()}`,
        name: subName.trim(),
        englishName: subEnglishName.trim() || undefined,
        categoryId: currentCategory.id,
        image: subImage.trim() || undefined,
        fallbackImage: subFallbackImage.trim() || undefined,
        isActive: subIsActive,
      });
    }

    updateCategory(currentCategory.id, {
      subcategories: currentSubNames,
      subcategoryDetails: updatedDetails,
    });

    setIsSubModalOpen(false);
    setSaveStatus('تم تحديث الأقسام الفرعية بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDeleteSubcategory = (index: number) => {
    const subNameToDelete = currentCategory.subcategories[index];
    if (window.confirm(`هل أنت متأكد من حذف القسم الفرعي "${subNameToDelete}"؟`)) {
      const updatedNames = currentCategory.subcategories.filter((_, i) => i !== index);
      const updatedDetails = (currentCategory.subcategoryDetails || []).filter((s) => s.name !== subNameToDelete);
      updateCategory(currentCategory.id, {
        subcategories: updatedNames,
        subcategoryDetails: updatedDetails,
      });
    }
  };

  const handleUploadSubImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 400, 0.85);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error uploading sub image:', err);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">إدارة الأقسام والأقسام الفرعية والصور</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                التحكم بالصور الأساسية، البانرات، والصور المصغرة للأقسام الستة المعتمدة وأقسامها الفرعية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Main Categories Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const isSelected = cat.id === currentCategory.id;
          const catProductsCount = products.filter((p) => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-3 rounded-2xl border text-right transition flex flex-col items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'border-red-600 bg-red-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className={`text-xs font-bold ${isSelected ? 'text-red-700' : 'text-slate-800'}`}>
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {catProductsCount} منتج
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={currentCategory.image}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{currentCategory.name}</h3>
                <span className="text-xs text-slate-400 font-mono">({currentCategory.englishName})</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentCategory.subtitle || 'قسم معتمد في المتجر'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openCategoryEdit(currentCategory)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            تعديل صور وبيانات القسم
          </button>
        </div>

        {/* Subcategories Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-800">
                الأقسام الفرعية التابعة لقسم ({currentCategory.name})
              </h4>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">
                {currentCategory.subcategories.length} قسم فرعي
              </span>
            </div>

            <button
              onClick={openAddSubcategory}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة قسم فرعي جديد
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentCategory.subcategories.map((sub, idx) => {
              const detail = currentCategory.subcategoryDetails?.find((s) => s.name === sub);
              const subImageSrc = detail?.image || currentCategory.image;
              const subProductsCount = products.filter(
                (p) => p.category === currentCategory.id && p.subcategory === sub
              ).length;

              return (
                <div
                  key={`${sub}_${idx}`}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                      <img
                        src={subImageSrc}
                        alt={sub}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{sub}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{subProductsCount} منتج معروض</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSubcategory(idx, sub)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Edit Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">تعديل بيانات وصور قسم {editingCategory?.name}</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم بالعربية</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={catEnglishName}
                    onChange={(e) => setCatEnglishName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان فرعي تسويقي</label>
                <input
                  type="text"
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="مثال: أحدث صيحات الموضة والإطلالات الملكية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">صورة القسم الأساسية</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="رابط الصورة أو اضغط للرفع..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleUploadCatImage(e, 'image')}
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
                    {isUploading ? 'جاري الرفع...' : 'رفع صورة'}
                  </button>
                </div>
              </div>

              {/* Fallback Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">صورة بديلة احتياطية (Fallback Image)</label>
                <input
                  type="text"
                  value={catFallbackImage}
                  onChange={(e) => setCatFallbackImage(e.target.value)}
                  placeholder="رابط الصورة الاحتياطية عند بطء الإنترنت..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بانر عريض لصفحة القسم</label>
                <input
                  type="text"
                  value={catBannerImage}
                  onChange={(e) => setCatBannerImage(e.target.value)}
                  placeholder="رابط بانر صفحة القسم (1200x400)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Edit / Add Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSubIndex !== null ? 'تعديل القسم الفرعي' : 'إضافة قسم فرعي جديد'}
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم الفرعي بالعربية *</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="مثال: فساتين سهرة، أطقم، شنط ظهر..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={subEnglishName}
                  onChange={(e) => setSubEnglishName(e.target.value)}
                  placeholder="مثال: Evening Dresses"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">صورة مصغرة للقسم الفرعي</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={subImage}
                    onChange={(e) => setSubImage(e.target.value)}
                    placeholder="رابط الصورة أو اضغط للرفع..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="file"
                    ref={subFileInputRef}
                    onChange={handleUploadSubImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => subFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'رفع...' : 'رفع'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">صورة احتياطية (Fallback)</label>
                <input
                  type="text"
                  value={subFallbackImage}
                  onChange={(e) => setSubFallbackImage(e.target.value)}
                  placeholder="رابط صورة بديلة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveSubcategory}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ القسم الفرعي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesManager;
