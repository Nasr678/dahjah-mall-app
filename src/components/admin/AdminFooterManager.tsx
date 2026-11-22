import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Link as LinkIcon, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  Image as ImageIcon, 
  Upload,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { FooterConfig, FooterLinkItem, FooterTrustBadge, FooterActionType } from '../../types';
import { DEFAULT_FOOTER_CONFIG } from '../../data/mockData';
import { DynamicLucideIcon } from '../common/DynamicLucideIcon';
import { DajjahLogo } from '../common/DajjahLogo';
import { firestoreFooterService } from '../../services/firebase';

const AVAILABLE_ICONS = [
  'MapPin',
  'Play',
  'HelpCircle',
  'Coins',
  'ShieldCheck',
  'RotateCcw',
  'Truck',
  'CreditCard',
  'Headphones',
  'MessageCircle',
  'Mail',
  'Phone',
  'ExternalLink',
  'Globe',
  'Building2',
  'Sparkles',
  'Zap',
  'Lock',
  'Heart',
  'ShoppingBag',
  'Award',
  'Clock',
  'Compass',
  'Flame',
  'Star',
  'CheckCircle2',
  'Share2',
  'FileText',
  'Tag',
  'Store'
];

interface AdminFooterManagerProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminFooterManager: React.FC<AdminFooterManagerProps> = ({ onNavigateTab }) => {
  const { footerConfig: liveFooterConfig, updateFooterConfig, appSettings } = useMarketplace();

  // Local editable state initialized with liveFooterConfig or appSettings or default
  const [config, setConfig] = useState<FooterConfig>(() => {
    return liveFooterConfig || (appSettings?.footerConfig ? { ...DEFAULT_FOOTER_CONFIG, ...appSettings.footerConfig } : DEFAULT_FOOTER_CONFIG);
  });

  // Keep local state in sync when liveFooterConfig updates from Firestore
  useEffect(() => {
    if (liveFooterConfig) {
      setConfig((prev) => ({ ...prev, ...liveFooterConfig }));
    }
  }, [liveFooterConfig]);

  const [activeSubSection, setActiveSubSection] = useState<'brand' | 'bottomLinks' | 'badges' | 'columns' | 'copyright' | 'preview'>('bottomLinks');
  const [editingLink, setEditingLink] = useState<FooterLinkItem | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingBadge, setEditingBadge] = useState<FooterTrustBadge | null>(null);
  const [isAddingBadge, setIsAddingBadge] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to save changes directly to Firestore collection 'footer_config'
  const handleSave = async (updatedConfig: FooterConfig) => {
    setIsSaving(true);
    try {
      await updateFooterConfig(updatedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save footer settings to Firestore footer_config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload Logo file to Firebase Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const downloadUrl = await firestoreFooterService.uploadFooterLogo(file);
      const updated = { ...config, customLogoUrl: downloadUrl };
      setConfig(updated);
      await updateFooterConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload footer logo:', err);
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  // Helper for quick field updates
  const updateConfigField = <K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
  };

  // Reset to default configuration
  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية للتذييل وشريط الإجراءات؟')) {
      setConfig(DEFAULT_FOOTER_CONFIG);
      handleSave(DEFAULT_FOOTER_CONFIG);
    }
  };

  // ==========================================
  // Bottom Links Handlers
  // ==========================================
  const handleToggleLinkActive = (id: string) => {
    const updatedLinks = config.bottomLinks.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    const updatedConfig = { ...config, bottomLinks: updatedLinks };
    setConfig(updatedConfig);
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const updatedLinks = config.bottomLinks.filter((item) => item.id !== id);
      const updatedConfig = { ...config, bottomLinks: updatedLinks };
      setConfig(updatedConfig);
    }
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.bottomLinks.length) return;

    const list = [...config.bottomLinks];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // reassign order
    const ordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    const updatedConfig = { ...config, bottomLinks: ordered };
    setConfig(updatedConfig);
  };

  const handleSaveLink = (linkToSave: FooterLinkItem) => {
    let updatedList: FooterLinkItem[];
    if (isAddingLink) {
      const newOrder = config.bottomLinks.length + 1;
      updatedList = [...config.bottomLinks, { ...linkToSave, id: linkToSave.id || `link-${Date.now()}`, order: newOrder }];
    } else {
      updatedList = config.bottomLinks.map((item) => (item.id === linkToSave.id ? linkToSave : item));
    }
    const updatedConfig = { ...config, bottomLinks: updatedList };
    setConfig(updatedConfig);
    setEditingLink(null);
    setIsAddingLink(false);
  };

  // ==========================================
  // Trust Badges Handlers
  // ==========================================
  const handleToggleBadgeActive = (id: string) => {
    const updatedBadges = config.trustBadges.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    const updatedConfig = { ...config, trustBadges: updatedBadges };
    setConfig(updatedConfig);
  };

  const handleDeleteBadge = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشارة؟')) {
      const updatedBadges = config.trustBadges.filter((b) => b.id !== id);
      const updatedConfig = { ...config, trustBadges: updatedBadges };
      setConfig(updatedConfig);
    }
  };

  const handleMoveBadge = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.trustBadges.length) return;

    const list = [...config.trustBadges];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    const ordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    const updatedConfig = { ...config, trustBadges: ordered };
    setConfig(updatedConfig);
  };

  const handleSaveBadge = (badgeToSave: FooterTrustBadge) => {
    let updatedList: FooterTrustBadge[];
    if (isAddingBadge) {
      const newOrder = config.trustBadges.length + 1;
      updatedList = [...config.trustBadges, { ...badgeToSave, id: badgeToSave.id || `badge-${Date.now()}`, order: newOrder }];
    } else {
      updatedList = config.trustBadges.map((b) => (b.id === badgeToSave.id ? badgeToSave : b));
    }
    const updatedConfig = { ...config, trustBadges: updatedList };
    setConfig(updatedConfig);
    setEditingBadge(null);
    setIsAddingBadge(false);
  };

  return (
    <div className="space-y-6 text-right select-none pb-12" dir="rtl">
      {/* Header & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-950 flex items-center gap-2 flex-wrap">
              <span>إدارة التذييل والمحتوى السفلي</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold tabular-nums">
                تحكم كامل 100%
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              تحكم كامل في جميع الروابط، الشعار، شريط الإجراءات السفلي، شارات الثقة، ونصوص الحقوق من Firestore
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(config)}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-neutral-950'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ في Cloud...' : 'حفظ التعديلات في السحابة'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Enable / Disable Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${config.isEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-neutral-950">تفعيل التذييل (Footer) بالكامل</div>
              <div className="text-xs text-neutral-500">إظهار أو إخفاء قسم التذييل في جميع الصفحات</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateConfigField('isEnabled', !config.isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              config.isEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${config.showBottomLinksBar ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'}`}>
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-neutral-950">شريط الإجراءات والروابط السفلي</div>
              <div className="text-xs text-neutral-500">شريط الخريطة، الشعار، الدليل، وأسعار الصرف</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateConfigField('showBottomLinksBar', !config.showBottomLinksBar)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              config.showBottomLinksBar ? 'bg-amber-400' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                config.showBottomLinksBar ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveSubSection('bottomLinks')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer tabular-nums ${
            activeSubSection === 'bottomLinks'
              ? 'bg-amber-400 text-neutral-950 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>الروابط والأزرار التفاعلية ({config.bottomLinks?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('brand')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubSection === 'brand'
              ? 'bg-amber-400 text-neutral-950 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الشعار والهوية والنبذة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('badges')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer tabular-nums ${
            activeSubSection === 'badges'
              ? 'bg-amber-400 text-neutral-950 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>شارات الثقة والضمانات ({config.trustBadges?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('columns')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubSection === 'columns'
              ? 'bg-amber-400 text-neutral-950 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>الأعمدة والتواصل السريع</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('copyright')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeSubSection === 'copyright'
              ? 'bg-amber-400 text-neutral-950 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>حقوق الملكية وتوقيع المطور</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: BOTTOM LINKS BAR (Interactive action buttons) */}
      {/* ========================================================================= */}
      {activeSubSection === 'bottomLinks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-neutral-950 flex items-center gap-2 tabular-nums">
                <span>عناصر شريط الإجراءات السفلي</span>
                <span className="text-xs text-amber-700">({config.bottomLinks?.length || 0} عنصر)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                يمكنك إعادة الترتيب، تغيير الأيقونة، نوع الإجراء (خريطة، فيديو سينمائي، دليل، أسعار الصرف، واتساب، رابط خارجي)، أو إضافة روابط جديدة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingLink({
                  id: `link-${Date.now()}`,
                  titleAr: '',
                  titleEn: '',
                  badge: '',
                  icon: 'MapPin',
                  linkType: 'action_store_locator',
                  target: '',
                  isActive: true,
                  order: (config.bottomLinks?.length || 0) + 1,
                });
                setIsAddingLink(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنصر جديد</span>
            </button>
          </div>

          {/* Links List */}
          <div className="space-y-2.5">
            {config.bottomLinks?.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isActive
                    ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                    : 'bg-[#F6F7F9] border-neutral-200/70 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-[#F6F7F9] hover:bg-neutral-200 border border-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="تحريك للأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLink(index, 'down')}
                      disabled={index === config.bottomLinks.length - 1}
                      className="p-1 rounded bg-[#F6F7F9] hover:bg-neutral-200 border border-neutral-200 text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="تحريك للأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon preview */}
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <DynamicLucideIcon name={item.icon} className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-neutral-950">{item.titleAr || 'بدون عنوان'}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F6F7F9] text-neutral-600 border border-neutral-200 font-mono">
                        {item.linkType}
                      </span>
                    </div>
                    {item.target && (
                      <div className="text-xs text-neutral-500 mt-0.5 font-mono dir-ltr text-right truncate max-w-sm">
                        {item.target}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleLinkActive(item.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                    }`}
                  >
                    {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.isActive ? 'مُفعّل' : 'مُعطّل'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingLink({ ...item });
                      setIsAddingLink(false);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer"
                    title="تعديل العنصر"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLink(item.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                    title="حذف العنصر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: BRAND & IDENTITY */}
      {/* ========================================================================= */}
      {activeSubSection === 'brand' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-6">
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-sm sm:text-base font-black text-neutral-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>إعدادات الشعار، الاسم، والسلوجان</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              خصص نصوص الهوية التي تظهر في التذييل وشريط السفلي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Show Logo Toggle */}
            <div className="p-4 rounded-xl bg-[#F6F7F9] border border-neutral-200 flex items-center justify-between md:col-span-2">
              <div>
                <div className="text-sm font-bold text-neutral-950">إظهار شعار ضَجّة في التذييل</div>
                <div className="text-xs text-neutral-500">إظهار الأيقونة التفاعلية أو الشعار المخصص</div>
              </div>
              <button
                type="button"
                onClick={() => updateConfigField('showLogo', !config.showLogo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.showLogo ? 'bg-amber-400' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                    config.showLogo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Custom Logo Upload & URL */}
            <div className="md:col-span-2 space-y-2 p-4 rounded-xl bg-[#F6F7F9] border border-neutral-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>شعار التذييل المخصص (Custom Footer Logo)</span>
                </label>
                {config.customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => updateConfigField('customLogoUrl', '')}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>العودة لشعار Dajjah SVG الافتراضي</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <input
                  type="text"
                  value={config.customLogoUrl || ''}
                  onChange={(e) => updateConfigField('customLogoUrl', e.target.value)}
                  placeholder="رابط مباشر للشعار: https://... أو اضغط رفع صورة"
                  className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingLogo ? 'جاري الرفع...' : 'رفع صورة شعار'}</span>
                </button>
              </div>

              {/* Logo Preview box */}
              <div className="mt-2 p-3 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">معاينة الشعار المعتمد في التذييل:</span>
                <div className="h-8 flex items-center justify-center px-3 py-1 bg-[#F6F7F9] rounded border border-neutral-200">
                  {config.customLogoUrl ? (
                    <img
                      src={config.customLogoUrl}
                      alt="معاينة الشعار"
                      className="h-6 w-auto max-w-[120px] object-contain"
                    />
                  ) : (
                    <DajjahLogo size="xs" withGlow interactive />
                  )}
                </div>
              </div>
            </div>

            {/* Brand Name Arabic */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">اسم المتجر / المنصة (بالعربي)</label>
              <input
                type="text"
                value={config.brandNameAr}
                onChange={(e) => updateConfigField('brandNameAr', e.target.value)}
                placeholder="ضَجّة مول"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Brand Name English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">اسم المتجر (بالإنجليزي)</label>
              <input
                type="text"
                value={config.brandNameEn || ''}
                onChange={(e) => updateConfigField('brandNameEn', e.target.value)}
                placeholder="Dajjah Mall"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Slogan Arabic */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">الشعار اللفظي / السلوجان (بالعربي)</label>
              <input
                type="text"
                value={config.sloganAr}
                onChange={(e) => updateConfigField('sloganAr', e.target.value)}
                placeholder="ضَجّة في وجه الغلاء"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Slogan English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">الشعار اللفظي (بالإنجليزي)</label>
              <input
                type="text"
                value={config.sloganEn || ''}
                onChange={(e) => updateConfigField('sloganEn', e.target.value)}
                placeholder="Dajjah Against High Prices"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* About Text Arabic */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">النص التعريفي / نبذة عن ضَجّة مول</label>
              <textarea
                rows={3}
                value={config.aboutTextAr}
                onChange={(e) => updateConfigField('aboutTextAr', e.target.value)}
                placeholder="المنصة اليمنية الأولى لتجارة الأزياء..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: TRUST BADGES */}
      {/* ========================================================================= */}
      {activeSubSection === 'badges' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-neutral-950 flex items-center gap-2 tabular-nums">
                <span>شارات الثقة والضمانات (3-Item Trust Grid)</span>
                <span className="text-xs text-amber-700">({config.trustBadges?.length || 0})</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                تظهر في أعلى التذييل لتثبيت الثقة (معاينة قبل الدفع، استرجاع سهل، توصيل لكافة المدن...)
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBadge({
                  id: `badge-${Date.now()}`,
                  titleAr: '',
                  titleEn: '',
                  subtitleAr: '',
                  subtitleEn: '',
                  icon: 'ShieldCheck',
                  isActive: true,
                  order: (config.trustBadges?.length || 0) + 1,
                });
                setIsAddingBadge(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شارة ضمان جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {config.trustBadges?.map((badge, idx) => (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  badge.isActive
                    ? 'bg-white border-neutral-200 hover:border-amber-300 shadow-xs'
                    : 'bg-[#F6F7F9] border-neutral-200/70 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <DynamicLucideIcon name={badge.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveBadge(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-[#F6F7F9] hover:bg-neutral-200 border border-neutral-200 text-neutral-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBadge(idx, 'down')}
                      disabled={idx === config.trustBadges.length - 1}
                      className="p-1 rounded bg-[#F6F7F9] hover:bg-neutral-200 border border-neutral-200 text-neutral-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-black text-neutral-950">{badge.titleAr}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{badge.subtitleAr}</div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleToggleBadgeActive(badge.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border ${
                      badge.isActive
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-neutral-500 bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    {badge.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{badge.isActive ? 'مفعلة' : 'معطلة'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBadge({ ...badge });
                        setIsAddingBadge(false);
                      }}
                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: COLUMNS & QUICK CONTACTS */}
      {/* ========================================================================= */}
      {activeSubSection === 'columns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp button */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-black text-neutral-950">زر واتساب المبيعات السريع</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField('showWhatsappButton', !config.showWhatsappButton)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    config.showWhatsappButton ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${config.showWhatsappButton ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <input
                type="text"
                value={config.whatsappButtonTextAr || ''}
                onChange={(e) => updateConfigField('whatsappButtonTextAr', e.target.value)}
                placeholder="واتساب المبيعات"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Support button */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-black text-neutral-950">زر خدمة العملاء 24/7</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField('showSupportButton', !config.showSupportButton)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    config.showSupportButton ? 'bg-amber-400' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${config.showSupportButton ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <input
                type="text"
                value={config.supportButtonTextAr || ''}
                onChange={(e) => updateConfigField('supportButtonTextAr', e.target.value)}
                placeholder="خدمة العملاء 24/7"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Policies Column */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-black text-neutral-950">عمود السياسات والشروط</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField('showPoliciesColumn', !config.showPoliciesColumn)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    config.showPoliciesColumn ? 'bg-amber-400' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${config.showPoliciesColumn ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <input
                type="text"
                value={config.policiesColumnTitleAr || ''}
                onChange={(e) => updateConfigField('policiesColumnTitleAr', e.target.value)}
                placeholder="السياسات والشروط"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('policies')}
                  className="text-xs text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>الانتقال لتبويب إدارة نصوص السياسات بالتفصيل</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Social Column */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-black text-neutral-950">عمود قنوات التواصل الاجتماعي</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField('showSocialColumn', !config.showSocialColumn)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    config.showSocialColumn ? 'bg-amber-400' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${config.showSocialColumn ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <input
                type="text"
                value={config.socialColumnTitleAr || ''}
                onChange={(e) => updateConfigField('socialColumnTitleAr', e.target.value)}
                placeholder="قنواتنا ومتابعتنا"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('social')}
                  className="text-xs text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>الانتقال لتبويب إدارة قنوات التواصل</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: COPYRIGHT, SECURITY & DEVELOPER SIGNATURE */}
      {/* ========================================================================= */}
      {activeSubSection === 'copyright' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-6">
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-sm sm:text-base font-black text-neutral-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <span>حقوق الملكية، بوابات الدفع، وتوقيع المطور</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              إدارة نصوص حقوق النشر السفلية والشارات الأمنية وتوقيع التحقق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Show Copyright */}
            <div className="p-4 rounded-xl bg-[#F6F7F9] border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-950">إظهار نص حقوق الملكية</div>
                <div className="text-xs text-neutral-500">سطر الحقوق المحفوظة في أسفل التذييل</div>
              </div>
              <button
                type="button"
                onClick={() => updateConfigField('showCopyright', !config.showCopyright)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.showCopyright ? 'bg-amber-400' : 'bg-neutral-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${config.showCopyright ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Auto update year */}
            <div className="p-4 rounded-xl bg-[#F6F7F9] border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-950 tabular-nums">تحديث السنة تلقائياً ({new Date().getFullYear()})</div>
                <div className="text-xs text-neutral-500">تحديث سنة الحقوق تلقائياً مع مرور الأعوام</div>
              </div>
              <button
                type="button"
                onClick={() => updateConfigField('autoUpdateYear', !config.autoUpdateYear)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.autoUpdateYear ? 'bg-emerald-500' : 'bg-neutral-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${config.autoUpdateYear ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Copyright Text */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">نص حقوق الملكية</label>
              <input
                type="text"
                value={config.copyrightTextAr}
                onChange={(e) => updateConfigField('copyrightTextAr', e.target.value)}
                placeholder="جميع الحقوق محفوظة لمنصة ضَجّة مول — صنعاء • عدن • اليمن"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Show Developer Signature */}
            <div className="p-4 rounded-xl bg-[#F6F7F9] border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-950">إظهار توقيع المطور والمنصة</div>
                <div className="text-xs text-neutral-500">شارة Nasr مع علامة التحقق الزرقاء المعتمدة</div>
              </div>
              <button
                type="button"
                onClick={() => updateConfigField('showDeveloperSignature', !config.showDeveloperSignature)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.showDeveloperSignature ? 'bg-amber-400' : 'bg-neutral-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${config.showDeveloperSignature ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Signature Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">اسم المطور / التوقيع</label>
              <input
                type="text"
                value={config.developerSignatureName || ''}
                onChange={(e) => updateConfigField('developerSignatureName', e.target.value)}
                placeholder="Nasr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Payment Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">نص العملة المعتمدة</label>
              <input
                type="text"
                value={config.paymentTextNorthSouthAr || ''}
                onChange={(e) => updateConfigField('paymentTextNorthSouthAr', e.target.value)}
                placeholder="الريال اليمني المعتمد (شمال وجنوب)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>

            {/* Payment Gateways Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">نص بوابات الدفع</label>
              <input
                type="text"
                value={config.paymentGatewaysTextAr || ''}
                onChange={(e) => updateConfigField('paymentGatewaysTextAr', e.target.value)}
                placeholder="بوابات دفع محلية مشفرة"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / ADD LINK */}
      {/* ========================================================================= */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-600" />
                <span>{isAddingLink ? 'إضافة عنصر جديد لشريط الإجراءات' : 'تعديل عنصر شريط الإجراءات'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="p-1.5 rounded-lg bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Title Ar */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">العنوان (بالعربي) *</label>
                <input
                  type="text"
                  value={editingLink.titleAr}
                  onChange={(e) => setEditingLink({ ...editingLink, titleAr: e.target.value })}
                  placeholder="خريطة الفروع والمستودعات"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Title En */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">العنوان (بالإنجليزي - اختياري)</label>
                <input
                  type="text"
                  value={editingLink.titleEn || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, titleEn: e.target.value })}
                  placeholder="Branches & Map"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Badge */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">شارة جانبية تمييزية (مثل: (OpenStreetMap) أو (جديد))</label>
                <input
                  type="text"
                  value={editingLink.badge || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, badge: e.target.value })}
                  placeholder="(OpenStreetMap)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Link Action Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">نوع الإجراء أو الرابط *</label>
                <select
                  value={editingLink.linkType}
                  onChange={(e) => setEditingLink({ ...editingLink, linkType: e.target.value as FooterActionType })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                >
                  <option value="action_store_locator">🗺️ خريطة الفروع والمستودعات (OpenStreetMap)</option>
                  <option value="action_splash">🎬 إعادة عرض شعار ضَجّة السينمائي</option>
                  <option value="action_onboarding">📖 دليل الاستخدام والترحيب</option>
                  <option value="action_currency_admin">💱 نافذة إدارة أسعار الصرف</option>
                  <option value="action_support_modal">🎧 نافذة خدمة العملاء والدعم 24/7</option>
                  <option value="action_ai_assistant">🤖 مساعد ضَجّة الذكي AI</option>
                  <option value="page">📄 صفحة داخلية في التطبيق (Home, Categories, Brands, Cart...)</option>
                  <option value="category">🏷️ تصنيف محدد</option>
                  <option value="product">📦 منتج محدد</option>
                  <option value="policy">📜 سياسة أو شرط</option>
                  <option value="whatsapp">💬 فتح محادثة واتساب</option>
                  <option value="phone">📞 اتصال هاتفي</option>
                  <option value="email">✉️ إرسال بريد إلكتروني</option>
                  <option value="external">🌐 رابط خارجي / موقع آخر</option>
                </select>
              </div>

              {/* Target / Destination */}
              {['page', 'category', 'product', 'policy', 'whatsapp', 'phone', 'email', 'external', 'map'].includes(editingLink.linkType) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">الهدف / المعرف / الرابط (Target)</label>
                  <input
                    type="text"
                    value={editingLink.target || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, target: e.target.value })}
                    placeholder={
                      editingLink.linkType === 'whatsapp'
                        ? '+967777123456'
                        : editingLink.linkType === 'external'
                        ? 'https://example.com'
                        : editingLink.linkType === 'page'
                        ? 'categories / brands / wishlist / cart'
                        : 'معرف الهدف'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none font-mono"
                  />
                </div>
              )}

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">اختيار الأيقونة</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 max-h-36 overflow-y-auto">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setEditingLink({ ...editingLink, icon: iconName })}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        editingLink.icon === iconName
                          ? 'bg-amber-400 text-neutral-950 font-bold scale-105 shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
                      }`}
                      title={iconName}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Open in new tab toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F9] border border-neutral-200">
                <span className="text-xs text-neutral-700 font-bold">فتح الرابط في علامة تبويب جديدة</span>
                <button
                  type="button"
                  onClick={() => setEditingLink({ ...editingLink, openInNewTab: !editingLink.openInNewTab })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    editingLink.openInNewTab ? 'bg-amber-400' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${editingLink.openInNewTab ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveLink(editingLink)}
                disabled={!editingLink.titleAr}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-neutral-950 font-black text-xs cursor-pointer shadow-xs"
              >
                حفظ العنصر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / ADD BADGE */}
      {/* ========================================================================= */}
      {editingBadge && (
        <div className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>{isAddingBadge ? 'إضافة شارة ثقة جديدة' : 'تعديل شارة الثقة والضمان'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="p-1.5 rounded-lg bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">العنوان الرئيسي (بالعربي) *</label>
                <input
                  type="text"
                  value={editingBadge.titleAr}
                  onChange={(e) => setEditingBadge({ ...editingBadge, titleAr: e.target.value })}
                  placeholder="معاينة قبل الدفع"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">الوصف الفرعي (بالعربي) *</label>
                <input
                  type="text"
                  value={editingBadge.subtitleAr}
                  onChange={(e) => setEditingBadge({ ...editingBadge, subtitleAr: e.target.value })}
                  placeholder="افحص طلبك بنفسك"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-950 text-xs focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">اختيار الأيقونة</label>
                <div className="grid grid-cols-6 gap-2 p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 max-h-32 overflow-y-auto">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setEditingBadge({ ...editingBadge, icon: iconName })}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        editingBadge.icon === iconName
                          ? 'bg-amber-400 text-neutral-950 font-bold scale-105 shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
                      }`}
                      title={iconName}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveBadge(editingBadge)}
                disabled={!editingBadge.titleAr || !editingBadge.subtitleAr}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-neutral-950 font-black text-xs cursor-pointer shadow-xs"
              >
                حفظ الشارة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
