import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  MessageCircle,
  Send,
  Camera,
  PlaySquare,
  Ghost,
  AtSign,
  Video,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Globe
} from 'lucide-react';
import { SocialMediaItem } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_SOCIAL_MEDIA_LIST } from '../../data/mockData';
import { SocialBrandIcon } from '../common/SocialBrandIcon';

export const getSocialIconComponent = (iconKey: string) => {
  const key = (iconKey || '').toLowerCase();
  if (key.includes('whatsapp') || key.includes('واتساب')) return MessageCircle;
  if (key.includes('telegram') || key.includes('تيليجرام') || key.includes('تليجرام')) return Send;
  if (key.includes('facebook') || key.includes('فيسبوك')) return Share2;
  if (key.includes('tiktok') || key.includes('تيك')) return Video;
  if (key.includes('instagram') || key.includes('انستغرام') || key.includes('انستقرام')) return Camera;
  if (key.includes('youtube') || key.includes('يوتيوب')) return PlaySquare;
  if (key.includes('snapchat') || key.includes('سناب')) return Ghost;
  if (key.includes('twitter') || key.includes('تويتر') || key === 'x') return AtSign;
  return Globe;
};

export const getSocialBrandColor = (iconKey: string) => {
  const key = (iconKey || '').toLowerCase();
  if (key.includes('whatsapp')) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (key.includes('telegram')) return { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' };
  if (key.includes('facebook')) return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
  if (key.includes('tiktok')) return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
  if (key.includes('instagram')) return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' };
  if (key.includes('youtube')) return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  if (key.includes('snapchat')) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
};

export const AdminSocialMediaManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();

  const socialList: SocialMediaItem[] = 
    appSettings?.socialMediaList && appSettings.socialMediaList.length > 0
      ? appSettings.socialMediaList
      : DEFAULT_SOCIAL_MEDIA_LIST;

  const [items, setItems] = useState<SocialMediaItem[]>(socialList);
  const [editingItem, setEditingItem] = useState<SocialMediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: `sm-${Date.now()}`,
      name: '',
      icon: 'whatsapp',
      url: 'https://',
      enabled: true,
      order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SocialMediaItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleToggleEnable = async (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i));
    setItems(updated);
    try {
      await updateAppSettings({ socialMediaList: updated });
      showFeedback('success', 'تم تحديث حالة القناة بنجاح');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل حفظ التعديل في قاعدة البيانات');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate order numbers
    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updated);

    try {
      await updateAppSettings({ socialMediaList: updated });
      showFeedback('success', 'تم تغيير الترتيب وحفظه');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل حفظ الترتيب');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه القناة؟')) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    try {
      await updateAppSettings({ socialMediaList: updated });
      showFeedback('success', 'تم حذف القناة بنجاح');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل الحذف');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim() || !editingItem.url.trim()) {
      showFeedback('error', 'يرجى إدخال اسم القناة والرابط');
      return;
    }

    setIsSaving(true);
    try {
      let updated: SocialMediaItem[];
      const exists = items.some((i) => i.id === editingItem.id);
      if (exists) {
        updated = items.map((i) => (i.id === editingItem.id ? editingItem : i));
      } else {
        updated = [...items, editingItem];
      }

      setItems(updated);
      await updateAppSettings({ socialMediaList: updated });
      setIsModalOpen(false);
      setEditingItem(null);
      showFeedback('success', 'تم حفظ بيانات قنوات التواصل في قاعدة البيانات بنجاح');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'فشل حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right select-none" id="admin-social-media-manager">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <span>إدارة قنوات التواصل الاجتماعي (Social Media Channels)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            إضافة وتعديل وحذف منصات التواصل التي تظهر في تذييل التطبيق (واتساب، تيليجرام، فيسبوك، تيك توك، وغيرها).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قناة جديدة</span>
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

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, index) => {
          const IconComponent = getSocialIconComponent(item.icon);
          const brand = getSocialBrandColor(item.icon);

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-neutral-900 border ${
                item.enabled ? 'border-neutral-800' : 'border-neutral-800/40 opacity-60'
              } flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm p-1.5">
                  <SocialBrandIcon platform={item.icon || item.name} className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white truncate">{item.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      #{item.order || index + 1}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-amber-400 truncate flex items-center gap-1 mt-0.5"
                  >
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Move order */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveOrder(index, 'up')}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 cursor-pointer"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveOrder(index, 'down')}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 cursor-pointer"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Enable toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleEnable(item.id)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    item.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                  }`}
                  title={item.enabled ? 'مفعل — اضغط للتعطيل' : 'معطل — اضغط للتفعيل'}
                >
                  {item.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 cursor-pointer"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="text-base font-black text-white">
                {items.some((i) => i.id === editingItem.id) ? 'تعديل قناة تواصل' : 'إضافة قناة تواصل جديدة'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  اسم المنصة أو القناة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مجتمع واتساب الرسمي"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  نوع المنصة / الأيقونة <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'whatsapp', label: 'واتساب' },
                    { id: 'telegram', label: 'تيليجرام' },
                    { id: 'facebook', label: 'فيسبوك' },
                    { id: 'tiktok', label: 'تيك توك' },
                    { id: 'instagram', label: 'إنستغرام' },
                    { id: 'youtube', label: 'يوتيوب' },
                    { id: 'snapchat', label: 'سناب شات' },
                    { id: 'twitter', label: 'تويتر / X' },
                  ].map((plat) => {
                    const isSelected = editingItem.icon === plat.id;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, icon: plat.id })}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/20 border-amber-400 text-amber-400 font-black scale-105'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <SocialBrandIcon platform={plat.id} className="w-6 h-6" />
                        <span className="text-[10px]">{plat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  رابط القناة (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                  <input
                    type="checkbox"
                    checked={editingItem.enabled}
                    onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-400 bg-neutral-950 border-neutral-800"
                  />
                  <span>تفعيل وعرض القناة في الموقع</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
