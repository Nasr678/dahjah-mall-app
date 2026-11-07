import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Users, 
  Send, 
  Sliders
} from 'lucide-react';
import { AbandonedCartConfig, AbandonedCartRecord, Product } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AdminAbandonedCartManager: React.FC = () => {
  const { appSettings, updateAppSettings, formatPrice } = useMarketplace();

  const currentConfig: AbandonedCartConfig = appSettings.abandonedCartConfig || {
    isEnabled: true,
    reminderDelayMinutes: 120, // 2 hours
    messageTemplate: 'مرحباً {name}، لاحظنا أنك تركت مشترياتك الرائعة في سلة ضَجّة مول! أكمل طلبك الآن واستمتع بعروض حصرية قبل نفاد الكمية 🛍️🔥',
    maxReminders: 2,
  };

  const [isEnabled, setIsEnabled] = useState(currentConfig.isEnabled);
  const [delayMinutes, setDelayMinutes] = useState(currentConfig.reminderDelayMinutes);
  const [messageTemplate, setMessageTemplate] = useState(currentConfig.messageTemplate);
  const [maxReminders, setMaxReminders] = useState(currentConfig.maxReminders);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Mock / Sample records of abandoned carts for visual management
  const [abandonedRecords] = useState<AbandonedCartRecord[]>([
    {
      id: 'cart-ab-1',
      userId: 'user_sanaa_99',
      userName: 'أحمد الحاشدي',
      userPhone: '771234567',
      items: [
        {
          id: 'item-ab-1',
          product: {
            id: 'prod-w-1',
            name: 'فستان سهرة أسود ملكي مرصع بالكريستال اللامع',
            category: 'women',
            subcategory: 'فساتين',
            priceYER: 18500,
            originalPriceYER: 32000,
            images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=300'],
            stock: 7,
            rating: 4.9,
            reviewCount: 128,
            tags: [],
            features: [],
            specifications: {},
            reviews: [],
            colors: [],
            sizes: [],
          } as Product,
          quantity: 1,
          selectedColor: 'أسود ملكي',
          selectedSize: 'M',
        },
      ],
      totalBaseYER: 18500,
      lastActiveAt: 'منذ 3 ساعات',
      remindersSentCount: 1,
      lastReminderSentAt: 'منذ ساعة',
      status: 'reminded',
    },
    {
      id: 'cart-ab-2',
      userId: 'user_aden_44',
      userName: 'سارة العدني',
      userPhone: '733987654',
      items: [
        {
          id: 'item-ab-2',
          product: {
            id: 'prod-s-1',
            name: 'حذاء سنيكرز رياضي إيطالي فائق الخفة',
            category: 'shoes',
            subcategory: 'سنيكرز',
            priceYER: 14200,
            originalPriceYER: 24000,
            images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300'],
            stock: 14,
            rating: 4.8,
            reviewCount: 95,
            tags: [],
            features: [],
            specifications: {},
            reviews: [],
            colors: [],
            sizes: [],
          } as Product,
          quantity: 2,
          selectedSize: '41',
        },
      ],
      totalBaseYER: 28400,
      lastActiveAt: 'منذ 5 ساعات',
      remindersSentCount: 0,
      status: 'pending',
    },
  ]);

  const handleSaveConfig = () => {
    const updated: AbandonedCartConfig = {
      isEnabled,
      reminderDelayMinutes: Number(delayMinutes) || 120,
      messageTemplate: messageTemplate.trim(),
      maxReminders: Number(maxReminders) || 2,
    };

    updateAppSettings({ abandonedCartConfig: updated });
    setSaveStatus('تم حفظ إعدادات تنبيهات السلات المتروكة بنجاح!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">نظام استرجاع السلات المتروكة (Abandoned Cart)</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                تذكير تلقائي وذكي للعملاء الذين وضعوا منتجات في السلة ولم يكملوا الدفع لزيادة المبيعات.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <Check className="w-4 h-4" />
          حفظ الإعدادات
        </button>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* Configuration Settings Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-600" />
          إعدادات وجدولة الإشعارات التلقائية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">حالة النظام التلقائي</div>
              <div className="text-[11px] text-slate-500">إرسال تنبيهات تلقائية للسلات غير المكتملة</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المدة قبل إرسال أول تذكير (بالدقائق)
            </label>
            <input
              type="number"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              placeholder="120"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
            />
            <span className="text-[10px] text-slate-400">120 دقيقة = ساعتان بعد مغادرة السلة</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              أقصى عدد للتذكيرات لكل عميل
            </label>
            <input
              type="number"
              value={maxReminders}
              onChange={(e) => setMaxReminders(Number(e.target.value))}
              placeholder="2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
            />
            <span className="text-[10px] text-slate-400">لمنع إزعاج العميل</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            نص رسالة التذكير (يدعم التخصيص عبر {'{name}'})
          </label>
          <textarea
            rows={3}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Abandoned Carts Real-Time Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-800">السلات المتروكة حالياً في المتجر</span>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full">
            {abandonedRecords.length} سلات نشطة
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {abandonedRecords.map((record) => (
            <div key={record.id} className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {record.items[0]?.product?.images?.[0] && (
                    <img
                      src={record.items[0].product.images[0]}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{record.userName}</h4>
                    <span className="text-xs text-slate-500 font-mono">({record.userPhone})</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      record.status === 'reminded' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {record.status === 'reminded' ? `تم التذكير (${record.remindersSentCount})` : 'قيد الانتظار'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {record.items.length} منتج: {record.items.map((i) => i.product.name).join('، ')}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">
                      القيمة: {formatPrice(record.totalBaseYER)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>النشاط الأخير: {record.lastActiveAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => alert(`تم إرسال إشعار تذكيري مباشر إلى ${record.userName}`)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  إرسال تذكير فوري الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAbandonedCartManager;
