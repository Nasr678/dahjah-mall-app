import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { PolicyItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_POLICIES } from '../../data/mockData';

export const AdminPoliciesManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();
  
  const initialPolicies: PolicyItem[] = appSettings?.policies && appSettings.policies.length > 0
    ? appSettings.policies
    : DEFAULT_POLICIES;

  const [policies, setPolicies] = useState<PolicyItem[]>(initialPolicies);
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>(initialPolicies[0]?.key || 'privacy');
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeEditingPolicy = policies.find((p) => p.key === selectedPolicyKey) || policies[0];

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSelectPolicy = (key: string) => {
    setSelectedPolicyKey(key);
  };

  const handleFieldChange = (field: keyof PolicyItem, value: any) => {
    setPolicies((prev) =>
      prev.map((p) => (p.key === selectedPolicyKey ? { ...p, [field]: value } : p))
    );
  };

  const handleAddNewPolicy = () => {
    const newKey = `custom-policy-${Date.now()}`;
    const newPolicy: PolicyItem = {
      id: `pol-${Date.now()}`,
      key: newKey,
      titleAr: 'وثيقة سياسة جديدة',
      titleEn: 'New Policy Document',
      contentAr: 'اكتب بنود ومحتوى السياسة الجديدة هنا...',
      contentEn: 'Write the new policy articles here...',
      lastUpdated: new Date().toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      order: policies.length + 1,
      isActive: true,
    };

    const updated = [...policies, newPolicy];
    setPolicies(updated);
    setSelectedPolicyKey(newKey);
    showFeedback('success', 'تم إنشاء وثيقة جديدة — لا تنسَ حفظ التغييرات');
  };

  const handleDeletePolicy = async (key: string) => {
    if (policies.length <= 1) {
      showFeedback('error', 'يجب الاحتفاظ بوثيقة واحدة على الأقل');
      return;
    }
    if (!window.confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) return;

    const updated = policies.filter((p) => p.key !== key);
    setPolicies(updated);
    setSelectedPolicyKey(updated[0].key);

    try {
      await updateAppSettings({ policies: updated });
      showFeedback('success', 'تم حذف الوثيقة وحفظ التعديلات');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل حذف الوثيقة');
    }
  };

  const handleToggleActive = async (key: string) => {
    const updated = policies.map((p) =>
      p.key === key ? { ...p, isActive: p.isActive === false ? true : false } : p
    );
    setPolicies(updated);
    try {
      await updateAppSettings({ policies: updated });
      showFeedback('success', 'تم تحديث حالة الظهور بنجاح');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل تحديث الحالة');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...policies];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setPolicies(updated);

    try {
      await updateAppSettings({ policies: updated });
      showFeedback('success', 'تم تحديث الترتيب وحفظه');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل حفظ الترتيب');
    }
  };

  const handleSaveCurrentPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const today = new Date().toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const updatedList = policies.map((p) =>
        p.key === selectedPolicyKey
          ? {
              ...p,
              lastUpdated: today,
            }
          : p
      );

      setPolicies(updatedList);
      await updateAppSettings({ policies: updatedList });
      showFeedback('success', `تم حفظ وثيقة (${activeEditingPolicy.titleAr}) في قاعدة البيانات بنجاح`);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'حدث خطأ أثناء حفظ السياسة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right select-none" id="admin-policies-manager">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>إدارة السياسات والشروط والضمانات القانونية (Policies & Terms)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            تحكم كامل في نصوص وبنود سياسة الخصوصية، الاسترجاع، الشحن، الشروط والأحكام، وحقوق العملاء باللغتين العربية والإنجليزية.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewPolicy}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وثيقة سياسة</span>
        </button>
      </div>

      {/* Feedback Alert */}
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

      {/* Policy Selector Pills with quick controls */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {policies.map((p, index) => {
          const isSelected = p.key === selectedPolicyKey;
          return (
            <div
              key={p.key || p.id}
              className={`flex items-center gap-1 p-1 rounded-xl transition-all border ${
                isSelected
                  ? 'bg-neutral-800 border-amber-400/50'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectPolicy(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{p.titleAr}</span>
                {p.isActive === false && (
                  <span className="text-[9px] px-1 rounded bg-rose-900/60 text-rose-300">مخفية</span>
                )}
              </button>

              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMoveOrder(index, 'up')}
                className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                title="تحريك لأعلى"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={index === policies.length - 1}
                onClick={() => handleMoveOrder(index, 'down')}
                className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                title="تحريك لأسفل"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Form */}
      {activeEditingPolicy && (
        <form onSubmit={handleSaveCurrentPolicy} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div>
              <span className="text-sm font-black text-white block">
                تعديل: {activeEditingPolicy.titleAr}
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>آخر تحديث: {activeEditingPolicy.lastUpdated || 'محدث اليوم'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => handleToggleActive(activeEditingPolicy.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEditingPolicy.isActive !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {activeEditingPolicy.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{activeEditingPolicy.isActive !== false ? 'مفعلة بالموقع' : 'معطلة'}</span>
              </button>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setLangTab('ar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    langTab === 'ar' ? 'bg-amber-400 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  عربي (AR)
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    langTab === 'en' ? 'bg-amber-400 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  English (EN)
                </button>
              </div>

              {/* Delete Document */}
              <button
                type="button"
                onClick={() => handleDeletePolicy(activeEditingPolicy.key)}
                className="p-2 rounded-xl bg-neutral-950 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 cursor-pointer"
                title="حذف هذه الوثيقة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Arabic Fields */}
          {langTab === 'ar' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  عنوان الوثيقة (بالعربية) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activeEditingPolicy.titleAr || ''}
                  onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  محتوى وبنود السياسة (بالعربية) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={12}
                  required
                  value={activeEditingPolicy.contentAr || ''}
                  onChange={(e) => handleFieldChange('contentAr', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white leading-loose font-mono text-xs"
                />
              </div>
            </div>
          ) : (
            /* English Fields */
            <div className="space-y-3 text-left" dir="ltr">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  Document Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activeEditingPolicy.titleEn || ''}
                  onChange={(e) => handleFieldChange('titleEn', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  Policy Content & Articles (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={12}
                  required
                  value={activeEditingPolicy.contentEn || ''}
                  onChange={(e) => handleFieldChange('contentEn', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white leading-loose font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Save Action */}
          <div className="pt-3 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات في قاعدة البيانات'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
