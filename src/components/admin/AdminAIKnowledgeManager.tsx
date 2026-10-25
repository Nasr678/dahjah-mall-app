import React, { useState } from 'react';
import { 
  Bot, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Store, 
  MessageSquare,
  FileText,
  RotateCcw
} from 'lucide-react';
import { AIKnowledgeBaseItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';

export const DEFAULT_AI_KNOWLEDGE: AIKnowledgeBaseItem[] = [
  {
    id: 'kb-about',
    category: 'store',
    title: 'عن ضَجّة مول والشعار',
    content: 'ضَجّة مول (Dajjah Mall) — شعارنا: «ضَجّة في وجه الغلاء». أكبر منصة تسوق متخصصة في اليمن للأزياء النسائية الفاخرة، ملابس الأولاد والبنات والمواليد، الأحذية الكلاسيكية والرياضية، والحقائب الفاخرة بأقوى العروض وبأسعار لا تقبل المنافسة.',
    isActive: true,
    order: 1,
  },
  {
    id: 'kb-guarantee',
    category: 'guarantees',
    title: 'حق المعاينة والفحص قبل الدفع',
    content: 'يحق لجميع عملائنا في كافة المحافظات اليمنية فتح الطرد وفحص المنتجات ومعاينتها والتأكد من جودة القماش والمقاس قبل دفع أي مبلغ للمندوب.',
    isActive: true,
    order: 2,
  },
  {
    id: 'kb-returns',
    category: 'returns',
    title: 'سياسة الاسترجاع والاستبدال',
    content: 'استبدال واسترجاع مجاني وفوري خلال 3 أيام من تاريخ الاستلام في حال وجود أي عيب مصنعي أو اختلاف بالمقاس أو عدم مطابقة المواصفات.',
    isActive: true,
    order: 3,
  },
  {
    id: 'kb-payment',
    category: 'payment',
    title: 'طرق الدفع المعتمدة',
    content: '1. الدفع عند الاستلام نقداً (كاش) بعد المعاينة.\n2. التحويل عبر المحافظ والبنوك الإلكترونية (الكريمي مميز، ون كاش، جيب، جوالي، فلوسك، شامل موني).\n3. البطاقات المصرفية الإلكترونية.',
    isActive: true,
    order: 4,
  },
  {
    id: 'kb-shipping',
    category: 'shipping',
    title: 'مناطق الشحن والتوصيل',
    content: 'توصيل فوري وباب للباب لجميع المحافظات اليمنية: صنعاء، عدن، تعز، إب، المكلا، سيئون، مأرب، الحديدة، ذمار، صعدة، لحج، أبين، شبوة، والمهرة.',
    isActive: true,
    order: 5,
  },
  {
    id: 'kb-customer-service',
    category: 'faq',
    title: 'خدمة العملاء والدعم الفني',
    content: 'فريق خدمة العملاء متواجد على مدار الساعة 24/7 عبر الواتساب والمحادثة المباشرة للرد على استفساراتكم ومتابعة طلباتكم بكل اهتمام.',
    isActive: true,
    order: 6,
  },
];

export const AdminAIKnowledgeManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();

  const currentKnowledge: AIKnowledgeBaseItem[] = 
    appSettings?.aiKnowledgeBase && appSettings.aiKnowledgeBase.length > 0
      ? appSettings.aiKnowledgeBase
      : DEFAULT_AI_KNOWLEDGE;

  const [knowledgeList, setKnowledgeList] = useState<AIKnowledgeBaseItem[]>(currentKnowledge);
  const [customInstructions, setCustomInstructions] = useState<string>(
    appSettings?.aiCustomInstructions || ''
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Form State for Adding / Editing
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<AIKnowledgeBaseItem['category']>('store');
  const [formContent, setFormContent] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormTitle('');
    setFormCategory('store');
    setFormContent('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AIKnowledgeBaseItem) => {
    setEditingItemId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showStatus('error', 'يرجى إدخال العنوان والمحتوى كاملاً');
      return;
    }

    let updated: AIKnowledgeBaseItem[];
    if (editingItemId) {
      updated = knowledgeList.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              title: formTitle.trim(),
              category: formCategory,
              content: formContent.trim(),
              isActive: formIsActive,
            }
          : item
      );
    } else {
      const newItem: AIKnowledgeBaseItem = {
        id: `kb-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        isActive: formIsActive,
        order: knowledgeList.length + 1,
      };
      updated = [newItem, ...knowledgeList];
    }

    setKnowledgeList(updated);
    setIsModalOpen(false);

    try {
      await updateAppSettings({ aiKnowledgeBase: updated });
      showStatus('success', 'تم حفظ وتحديث قاعدة معرفة AI بنجاح!');
    } catch (err) {
      console.error(err);
      showStatus('error', 'تعذر حفظ البيانات في السيرفر');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البند من قاعدة معرفة الذكاء الاصطناعي؟')) return;
    const updated = knowledgeList.filter((item) => item.id !== id);
    setKnowledgeList(updated);
    try {
      await updateAppSettings({ aiKnowledgeBase: updated });
      showStatus('success', 'تم حذف البند بنجاح');
    } catch (err) {
      console.error(err);
      showStatus('error', 'فشل الحذف');
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = knowledgeList.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setKnowledgeList(updated);
    try {
      await updateAppSettings({ aiKnowledgeBase: updated });
      showStatus('success', 'تم تحديث حالة التفعيل');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomInstructions = async () => {
    setIsSaving(true);
    try {
      await updateAppSettings({ aiCustomInstructions: customInstructions.trim() });
      showStatus('success', 'تم حفظ التعليمات الإضافية للذكاء الاصطناعي بنجاح!');
    } catch (err) {
      console.error(err);
      showStatus('error', 'فشل حفظ التعليمات');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredKnowledge = activeCategoryFilter === 'all'
    ? knowledgeList
    : knowledgeList.filter((item) => item.category === activeCategoryFilter);

  const getCategoryBadge = (cat: AIKnowledgeBaseItem['category']) => {
    switch (cat) {
      case 'store':
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold">المتجر</span>;
      case 'guarantees':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">الضمانات</span>;
      case 'returns':
        return <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold">الاسترجاع</span>;
      case 'payment':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">الدفع</span>;
      case 'shipping':
        return <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">الشحن</span>;
      case 'faq':
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold">الأسئلة الشائعة</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-bold">عام</span>;
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-black text-white">قاعدة معرفة وإعدادات ذكاء ضَجّة (AI Knowledge Base)</h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            تحكم بالمعلومات والسياسات التي يعتمد عليها الذكاء الاصطناعي (Gemini) عند الإجابة على استفسارات العملاء بدون الحاجة لتعديل الكود.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلومة جديدة للـ AI</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
          statusMessage.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'store', label: 'عن المتجر' },
          { id: 'guarantees', label: 'الضمانات' },
          { id: 'returns', label: 'الاسترجاع' },
          { id: 'payment', label: 'طرق الدفع' },
          { id: 'shipping', label: 'الشحن والتوصيل' },
          { id: 'faq', label: 'الأسئلة الشائعة' },
          { id: 'custom', label: 'مخصص' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === tab.id
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredKnowledge.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all ${
              item.isActive
                ? 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/30'
                : 'bg-neutral-950/60 border-neutral-850 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {getCategoryBadge(item.category)}
                <h3 className="text-sm font-black text-white">{item.title}</h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id)}
                  className={`p-1 rounded-lg text-xs font-bold ${
                    item.isActive ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-neutral-500 hover:bg-neutral-800'
                  }`}
                  title={item.isActive ? 'مفعل' : 'معطل'}
                >
                  {item.isActive ? 'مفعل' : 'معطل'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  title="تعديل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Custom AI Instructions Box */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">تعليمات إضافية وتوجيهات خاصة للمساعد الذكي (System Prompt Customization)</h3>
          </div>
          <button
            type="button"
            onClick={handleSaveCustomInstructions}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ التعليمات'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          يمكنك هنا كتابة أي تعليمات خاصة بطريقة رد المساعد، نبرة الصوت، أو عروض ترويجية ترغب في أن يركز عليها الذكاء الاصطناعي.
        </p>

        <textarea
          rows={4}
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="مثال: ركز دائماً على إبراز عرض التوصيل المجاني للطلبات فوق 99$، وتحدث بأسلوب ودود ومرحب ولهجة يمنية لطيفة عند الحاجة..."
          className="w-full p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingItemId ? 'تعديل بند في قاعدة معرفة AI' : 'إضافة معلومة جديدة للمساعد الذكي'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">العنوان أو الموضوع</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: مواعيد عمل فروع صنعاء وعدن"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">القسم / التصنيف</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="store">عن المتجر والفروع</option>
                  <option value="guarantees">الضمانات والمعاينة</option>
                  <option value="returns">الاسترجاع والاستبدال</option>
                  <option value="payment">طرق وسداد الدفع</option>
                  <option value="shipping">الشحن والمحافظات</option>
                  <option value="faq">الأسئلة الشائعة</option>
                  <option value="custom">مخصص / عام</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">المحتوى والتفاصيل التي يعتمد عليها الـ AI</label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="اكتب المعلومات والشروحات بدقة ووضوح..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="form-kb-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="form-kb-active" className="text-xs font-bold text-neutral-300 cursor-pointer">
                  تفعيل هذا البند وجعله متاحاً للمساعد الذكي فوراً
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all cursor-pointer"
                >
                  {editingItemId ? 'حفظ التعديلات' : 'إضافة البند'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
