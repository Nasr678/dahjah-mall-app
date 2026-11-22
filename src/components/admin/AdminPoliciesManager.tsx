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
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </span>
            <span>إدارة السياسات والشروط والضمانات القانونية (Policies & Terms)</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            تحكم كامل في نصوص وبنود سياسة الخصوصية، الاسترجاع، الشحن، الشروط والأحكام، وحقوق العملاء باللغتين العربية والإنجليزية.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewPolicy}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all whitespace-nowrap"
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
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
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
                  ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectPolicy(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{p.titleAr}</span>
                {p.isActive === false && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">مخفية</span>
                )}
              </button>

              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMoveOrder(index, 'up')}
                className="p-1 text-neutral-400 hover:text-neutral-950 disabled:opacity-25 cursor-pointer"
                title="تحريك لأعلى"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={index === policies.length - 1}
                onClick={() => handleMoveOrder(index, 'down')}
                className="p-1 text-neutral-400 hover:text-neutral-950 disabled:opacity-25 cursor-pointer"
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
        <form onSubmit={handleSaveCurrentPolicy} className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-neutral-200">
            <div>
              <span className="text-sm font-black text-neutral-950 block">
                تعديل: {activeEditingPolicy.titleAr}
              </span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 tabular-nums">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>آخر تحديث: {activeEditingPolicy.lastUpdated || 'محدث اليوم'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => handleToggleActive(activeEditingPolicy.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEditingPolicy.isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }`}
              >
                {activeEditingPolicy.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{activeEditingPolicy.isActive !== false ? 'مفعلة بالموقع' : 'معطلة'}</span>
              </button>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-[#F6F7F9] p-1 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setLangTab('ar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    langTab === 'ar' ? 'bg-amber-400 text-neutral-950 font-black shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  عربي (AR)
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    langTab === 'en' ? 'bg-amber-400 text-neutral-950 font-black shadow-xs' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  English (EN)
                </button>
              </div>

              {/* Delete Document */}
              <button
                type="button"
                onClick={() => handleDeletePolicy(activeEditingPolicy.key)}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
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
                <label className="block text-neutral-700 font-bold mb-1">
                  عنوان الوثيقة (بالعربية) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activeEditingPolicy.titleAr || ''}
                  onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-950 font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  محتوى وبنود السياسة (بالعربية) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={12}
                  required
                  value={activeEditingPolicy.contentAr || ''}
                  onChange={(e) => handleFieldChange('contentAr', e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl p-3.5 text-neutral-950 leading-loose font-mono text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          ) : (
            /* English Fields */
            <div className="space-y-3 text-left" dir="ltr">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  Document Title (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activeEditingPolicy.titleEn || ''}
                  onChange={(e) => handleFieldChange('titleEn', e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-950 font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  Policy Content & Articles (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={12}
                  required
                  value={activeEditingPolicy.contentEn || ''}
                  onChange={(e) => handleFieldChange('contentEn', e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl p-3.5 text-neutral-950 leading-loose font-mono text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* Save Action */}
          <div className="pt-3 border-t border-neutral-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
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
