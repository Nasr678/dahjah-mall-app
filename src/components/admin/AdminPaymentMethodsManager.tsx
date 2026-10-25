import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Smartphone, 
  Landmark, 
  Banknote, 
  ShieldCheck, 
  Upload, 
  AlertCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { PaymentOption, PaymentCategory } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { PAYMENT_METHODS as DEFAULT_PAYMENT_METHODS } from '../../data/mockData';
import { compressImage } from '../../services/firebase';
import { WalletLogo } from '../common/WalletLogo';

export const AdminPaymentMethodsManager: React.FC = () => {
  const { appSettings, updateAppSettings } = useMarketplace();

  const paymentMethods: PaymentOption[] = (appSettings.paymentOptions && appSettings.paymentOptions.length > 0)
    ? appSettings.paymentOptions
    : DEFAULT_PAYMENT_METHODS.map((m, idx) => ({ ...m, isEnabled: m.isAvailable !== false, order: idx + 1 }));

  const [editingMethod, setEditingMethod] = useState<PaymentOption | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PaymentCategory>('wallets');
  const [merchantCode, setMerchantCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [logo, setLogo] = useState('');
  const [logoColor, setLogoColor] = useState('#E51B24');
  const [badge, setBadge] = useState('');
  const [feePercentage, setFeePercentage] = useState<number>(0);
  const [instructions, setInstructions] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingMethod(null);
    setName('');
    setShortName('');
    setSubtitle('');
    setDescription('');
    setCategory('wallets');
    setMerchantCode('');
    setAccountNumber('');
    setAccountHolder('متجر ضَجّة مول');
    setLogo('');
    setLogoColor('#2563EB');
    setBadge('دفع فوري آمن');
    setFeePercentage(0);
    setInstructions('');
    setStepsText('');
    setIsEnabled(true);
    setIsPopular(false);
    setIsDefault(false);
    setIsNewModalOpen(true);
  };

  const openEditModal = (method: PaymentOption) => {
    setEditingMethod(method);
    setName(method.name);
    setShortName(method.shortName || method.name);
    setSubtitle(method.subtitle || '');
    setDescription(method.description || '');
    setCategory(method.category || 'wallets');
    setMerchantCode(method.merchantCode || '');
    setAccountNumber(method.accountNumber || '');
    setAccountHolder(method.accountHolder || 'متجر ضَجّة مول');
    setLogo(method.logo || '');
    setLogoColor(method.logoColor || '#2563EB');
    setBadge(method.badge || '');
    setFeePercentage(method.feePercentage || 0);
    setInstructions(method.instructions || '');
    setStepsText((method.transferSteps || []).join('\n'));
    setIsEnabled(method.isEnabled !== false && method.isAvailable !== false);
    setIsPopular(Boolean(method.isPopular));
    setIsDefault(Boolean(method.isDefault));
    setIsNewModalOpen(true);
  };

  const handleSaveMethod = () => {
    if (!name.trim()) {
      alert('يرجى كتابة اسم طريقة الدفع');
      return;
    }

    const stepsArray = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedList: PaymentOption[];

    if (editingMethod) {
      // Update existing
      updatedList = paymentMethods.map((m) => {
        if (m.id === editingMethod.id) {
          return {
            ...m,
            name: name.trim(),
            shortName: shortName.trim() || name.trim(),
            subtitle: subtitle.trim(),
            description: description.trim(),
            category,
            merchantCode: merchantCode.trim() || undefined,
            accountNumber: accountNumber.trim() || undefined,
            accountHolder: accountHolder.trim() || undefined,
            logo: logo.trim() || undefined,
            logoColor,
            badge: badge.trim() || undefined,
            feePercentage: Number(feePercentage) || 0,
            instructions: instructions.trim() || undefined,
            transferSteps: stepsArray.length > 0 ? stepsArray : undefined,
            isEnabled,
            isAvailable: isEnabled,
            isPopular,
            isDefault,
          };
        }
        // If this one is set to default, unset others
        if (isDefault) {
          return { ...m, isDefault: false };
        }
        return m;
      });
    } else {
      // Create new
      const newId = `pay_${Date.now()}`;
      const newMethod: PaymentOption = {
        id: newId,
        category,
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        merchantCode: merchantCode.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountHolder: accountHolder.trim() || undefined,
        logo: logo.trim() || undefined,
        logoColor,
        badge: badge.trim() || undefined,
        feePercentage: Number(feePercentage) || 0,
        instructions: instructions.trim() || undefined,
        transferSteps: stepsArray.length > 0 ? stepsArray : undefined,
        isEnabled,
        isAvailable: isEnabled,
        isPopular,
        isDefault,
        order: paymentMethods.length + 1,
      };

      updatedList = isDefault
        ? [...paymentMethods.map((m) => ({ ...m, isDefault: false })), newMethod]
        : [...paymentMethods, newMethod];
    }

    updateAppSettings({ paymentOptions: updatedList });
    setIsNewModalOpen(false);
    setSaveStatus('تم حفظ طريقة الدفع بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggleEnable = (methodId: string) => {
    const updated = paymentMethods.map((m) => {
      if (m.id === methodId) {
        const nextState = !(m.isEnabled !== false && m.isAvailable !== false);
        return { ...m, isEnabled: nextState, isAvailable: nextState };
      }
      return m;
    });
    updateAppSettings({ paymentOptions: updated });
  };

  const handleDelete = (methodId: string) => {
    if (window.confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟ لن تظهر للعملاء في صفحة الدفع.')) {
      const updated = paymentMethods.filter((m) => m.id !== methodId);
      updateAppSettings({ paymentOptions: updated });
    }
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paymentMethods.length) return;

    const list = [...paymentMethods];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign orders
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateAppSettings({ paymentOptions: reordered });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const compressed = await compressImage(file, 400, 0.85);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error compressing logo:', err);
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">طرق الدفع وبوابات السداد</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                التحكم الكامل في وسائل الدفع المتاحة في صفحة إتمام الطلب (Checkout) وترتيبها وبيانات الحسابات.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة طريقة دفع جديدة
        </button>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Payment Methods List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">طرق الدفع النشطة والمتاحة</span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
              {paymentMethods.length} طريقة
            </span>
          </div>
          <div className="text-xs text-slate-400">
            * يتم عكس التعديلات فوراً على تطبيق العملاء
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {paymentMethods.map((method, idx) => {
            const isMethodActive = method.isEnabled !== false && method.isAvailable !== false;
            return (
              <div 
                key={method.id}
                className={`p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  !isMethodActive ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 text-slate-400">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveOrder(idx, 'up')}
                      className="p-1 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={idx === paymentMethods.length - 1}
                      onClick={() => moveOrder(idx, 'down')}
                      className="p-1 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Logo or Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-2 shrink-0">
                    {method.logo ? (
                      <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                    ) : (
                      <WalletLogo type={method.id as any} size={28} />
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{method.name}</h3>
                      {method.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 rounded-md">
                          {method.badge}
                        </span>
                      )}
                      {method.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md">
                          الافتراضي ⭐
                        </span>
                      )}
                      {method.isPopular && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-md">
                          شائع ومفضل 🔥
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1">{method.subtitle || method.description}</p>

                    {(method.merchantCode || method.accountNumber) && (
                      <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
                        {method.merchantCode && <span>كود التاجر: <strong>{method.merchantCode}</strong></span>}
                        {method.accountNumber && <span>رقم الحساب: <strong>{method.accountNumber}</strong></span>}
                        {method.accountHolder && <span className="font-sans">({method.accountHolder})</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Controls */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleToggleEnable(String(method.id))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isMethodActive 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {isMethodActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {isMethodActive ? 'مفعلة في الدفع' : 'معطلة'}
                  </button>

                  <button
                    onClick={() => openEditModal(method)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="تعديل البيانات"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(String(method.id))}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف طريقة الدفع"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingMethod ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    حدد تفاصيل المحفظة أو الحساب البنكي والتعليمات التي ستظهر للمشتري
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم طريقة الدفع *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: محفظة جيب، الكريمي، ون كاش..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم المختصر (في الشاشات الصغيرة)</label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="مثال: جيب Jaib"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف الفرعي (يظهر للمشتري)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="مثال: سداد فوري وآمن بدون أي عمولة إضافية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المعاملة</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PaymentCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  >
                    <option value="wallets">محفظة إلكترونية (Wallets)</option>
                    <option value="cod">دفع عند الاستلام (COD)</option>
                    <option value="future">تحويل بنكي / بطاقة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم كود التاجر (Merchant Code)</label>
                  <input
                    type="text"
                    value={merchantCode}
                    onChange={(e) => setMerchantCode(e.target.value)}
                    placeholder="مثال: 554012"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الحساب / الهاتف</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="مثال: 3029182391"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم صاحب الحساب التجاري</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="مثال: متجر ضَجّة مول التجاري"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شارة مميزة (Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="مثال: دفع فوري آمن، بدون عمولة..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              {/* Logo / Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شعار المحفظة / صورة الأيقونة</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="رابط الصورة أو اضغط لرفع من جهازك..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
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
                    disabled={isUploadingLogo}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingLogo ? 'جاري الرفع...' : 'رفع صورة'}
                  </button>
                </div>
              </div>

              {/* Transfer Steps */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  خطوات التحويل (كل خطوة في سطر منفصل تظهر للمشتري)
                </label>
                <textarea
                  rows={3}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder="افتح تطبيق المحفظة&#10;اختر دفع للتاجر أو سداد مشتريات&#10;أدخل كود التاجر أو رقم الحساب&#10;أكد العملية وأدخل رقم الإشعار"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">تفعيل ظهور طريقة الدفع للعملاء</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">تعيين كخيار افتراضي أولي</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">تمييز كطريقة شائعة (Popular)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveMethod}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ طريقة الدفع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethodsManager;
