import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X
} from 'lucide-react';
import { VolumeDiscountRule } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AdminVolumeDiscountsManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();

  const defaultRules: VolumeDiscountRule[] = [
    {
      id: 'vol_2',
      title: 'خصم قطعتين (وفر 5%)',
      minQuantity: 2,
      discountPercentage: 5,
      isActive: true,
      applicableCategory: 'all',
    },
    {
      id: 'vol_3',
      title: 'خصم 3 قطع أو أكثر (وفر 10%)',
      minQuantity: 3,
      discountPercentage: 10,
      isActive: true,
      applicableCategory: 'all',
    },
    {
      id: 'vol_5',
      title: 'خصم كميات الجملة 5 قطع فما فوق (وفر 15%)',
      minQuantity: 5,
      discountPercentage: 15,
      isActive: true,
      applicableCategory: 'all',
    },
  ];

  const rules: VolumeDiscountRule[] = (appSettings.volumeDiscounts && appSettings.volumeDiscounts.length > 0)
    ? appSettings.volumeDiscounts
    : defaultRules;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<VolumeDiscountRule | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [minQuantity, setMinQuantity] = useState<number>(2);
  const [discountPercentage, setDiscountPercentage] = useState<number>(5);
  const [isActive, setIsActive] = useState(true);
  const [applicableCategory, setApplicableCategory] = useState('all');

  const openAddModal = () => {
    setEditingRule(null);
    setTitle('');
    setMinQuantity(2);
    setDiscountPercentage(5);
    setIsActive(true);
    setApplicableCategory('all');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: VolumeDiscountRule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setMinQuantity(rule.minQuantity);
    setDiscountPercentage(rule.discountPercentage);
    setIsActive(rule.isActive);
    setApplicableCategory(rule.applicableCategory || 'all');
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!title.trim()) {
      alert('يرجى كتابة عنوان العرض');
      return;
    }

    let updated: VolumeDiscountRule[];

    if (editingRule) {
      updated = rules.map((r) => {
        if (r.id === editingRule.id) {
          return {
            ...r,
            title: title.trim(),
            minQuantity: Number(minQuantity) || 2,
            discountPercentage: Number(discountPercentage) || 5,
            isActive,
            applicableCategory,
          };
        }
        return r;
      });
    } else {
      const newRule: VolumeDiscountRule = {
        id: `vol_${Date.now()}`,
        title: title.trim(),
        minQuantity: Number(minQuantity) || 2,
        discountPercentage: Number(discountPercentage) || 5,
        isActive,
        applicableCategory,
      };
      updated = [...rules, newRule];
    }

    updateAppSettings({ volumeDiscounts: updated });
    setIsModalOpen(false);
    setSaveStatus('تم حفظ قواعد خصومات الكميات بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggle = (id: string) => {
    const updated = rules.map((r) => {
      if (r.id === id) return { ...r, isActive: !r.isActive };
      return r;
    });
    updateAppSettings({ volumeDiscounts: updated });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل تريد حذف هذه القاعدة؟')) {
      const updated = rules.filter((r) => r.id !== id);
      updateAppSettings({ volumeDiscounts: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">خصومات الكميات (اشترِ أكثر ووفر أكثر)</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                تطبيق خصومات تلقائية في السلة عند شراء قطعتين أو أكثر لتحفيز زيادة حجم الطلبات.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة شريحة خصم جديدة
        </button>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Rules List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
              !rule.isActive ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-base shrink-0">
                %{rule.discountPercentage}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{rule.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  الحد الأدنى للكمية: <strong>{rule.minQuantity} قطع</strong> • نسبة الخصم:{' '}
                  <strong className="text-emerald-600 font-bold">%{rule.discountPercentage}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(rule.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  rule.isActive
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {rule.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {rule.isActive ? 'مفعل بالسلة' : 'معطل'}
              </button>

              <button
                onClick={() => openEditModal(rule)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="تعديل"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(rule.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRule ? 'تعديل شريحة الخصم' : 'إضافة شريحة خصم كميات'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الشريحة *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: خصم 3 قطع أو أكثر (وفر 10%)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأدنى للقطع</label>
                  <input
                    type="number"
                    min="2"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-slate-800">تفعيل هذه القاعدة في سلة الشراء تلقائياً</span>
              </label>
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
                onClick={handleSaveRule}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ الشريحة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolumeDiscountsManager;
