import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Navigation, 
  AlertCircle,
  Copy,
  RotateCw,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatPriceWithCurrency } from '../../services/currencyService';
import { LeafletOrderTracker } from '../maps/LeafletOrderTracker';
import { createWhatsAppLink } from '../../utils/whatsappHelper';
import { CachedImage } from '../common/CachedImage';
import { useMarketplace } from '../../context/MarketplaceContext';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateOrderStatus,
}) => {
  const { cancelCustomerOrder } = useMarketplace();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !order) return null;

  const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'received',
      label: 'تم استلام الطلب',
      desc: 'تم تسجيل طلبك في نظام ضَجّة مول وتأكيد الدفع',
      icon: Package,
    },
    {
      status: 'processing',
      label: 'جاري التجهيز والتغليف',
      desc: 'يقوم المتجر بفحص وتغليف المنتجات بعناية',
      icon: Clock,
    },
    {
      status: 'out_for_delivery',
      label: 'خرج للتوصيل مع المندوب',
      desc: 'الشحنة في طريقها إليك مع مندوب التوصيل السريع',
      icon: Truck,
    },
    {
      status: 'delivered',
      label: 'تم التسليم بنجاح',
      desc: 'تم استلام الطلب والتوقيع على الإيصال',
      icon: CheckCircle2,
    },
  ];

  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber || order.orderNumber || order.id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleAdvanceStatus = () => {
    if (!onUpdateOrderStatus) return;
    const sequence: OrderStatus[] = ['received', 'processing', 'out_for_delivery', 'delivered'];
    const currIdx = sequence.indexOf(order.status);
    if (currIdx >= 0 && currIdx < sequence.length - 1) {
      onUpdateOrderStatus(order.id, sequence[currIdx + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-neutral-950">تتبع الشحنة والطلب</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#F6F7F9] text-amber-800 border border-neutral-200 font-bold tabular-nums">
                  {order.orderNumber || order.id}
                </span>
              </div>
              <p className="text-xs text-neutral-500">تحديث مباشر لحالة التوصيل والموقع الجغرافي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tracking Number & Actions Bar */}
          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-neutral-500">رقم البوليصة / التتبع الدولي والمحلي:</div>
              <div className="text-sm font-black font-mono text-amber-800 mt-0.5 tabular-nums">
                {order.trackingNumber || `TRK-DJ-${order.id.slice(-6)}`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTracking}
                className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-amber-500 text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>{copiedTracking ? 'تم النسخ!' : 'نسخ الرقم'}</span>
              </button>

              {onUpdateOrderStatus && order.status !== 'delivered' && !isCancelled && (
                <button
                  type="button"
                  onClick={handleAdvanceStatus}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-black transition-all flex items-center gap-1.5"
                  title="محاكاة انتقال الطلب للمرحلة التالية"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>تقديم الحالة (تجربة)</span>
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-600" />
              <div>
                <div className="font-black text-sm">تم إلغاء هذا الطلب</div>
                <div className="text-xs text-rose-700/90 mt-0.5">
                  تم إلغاء الطلب بناءً على رغبة العميل أو لعدم توفر المخزون. تم إرجاع الرصيد لمحفظتك.
                </div>
              </div>
            </div>
          ) : (
            /* Dynamic Timeline Steps */
            <div className="relative p-5 rounded-3xl bg-[#F6F7F9] border border-neutral-200/80 space-y-6">
              <div className="font-black text-sm text-neutral-950 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-600" />
                <span>مراحل الشحن والتوصيل</span>
              </div>

              <div className="space-y-6 relative before:absolute before:top-3 before:bottom-3 before:right-5 before:w-0.5 before:bg-neutral-200">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4 pr-1">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 border transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/25 scale-110'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-neutral-400 border-neutral-200'
                        }`}
                      >
                        {isDone && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-black ${
                              isCurrent ? 'text-amber-800' : isDone ? 'text-neutral-950' : 'text-neutral-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 animate-pulse">
                              المرحلة الحالية
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live OpenStreetMap Delivery & Route Tracker */}
          {!isCancelled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-700 px-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span>خريطة التتبع المباشر (OpenStreetMap):</span>
                </span>
                <span className="text-[11px] text-neutral-500">
                  {order.shippingAddress.city} — {order.shippingAddress.district}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                <LeafletOrderTracker order={order} />
              </div>
            </div>
          )}

          {/* Courier & Delivery Agent Information (if out for delivery) */}
          {order.status === 'out_for_delivery' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-[#F6F7F9] border border-amber-200 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-base shadow-sm">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-800 font-bold">مندوب ضَجّة اكسبرس المعين:</div>
                    <div className="text-sm font-black text-neutral-950">{order.courier?.name || 'عمار الحميدي (مندوب معتمد)'}</div>
                    <div className="text-xs text-neutral-600 font-mono tabular-nums">
                      {order.courier?.phone || '775 889 900'} • دراجة نارية مجهزة بحافظة حرارية
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={createWhatsAppLink(order.courier?.phone || '775889900', `السلام عليكم يا كابتن، بخصوص طلبي من ضَجّة مول رقم (${order.orderNumber || order.id})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer"
                    title="مراسلة المندوب عبر واتساب"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">واتساب</span>
                  </a>

                  <a
                    href={`tel:${order.courier?.phone || '775889900'}`}
                    className="p-2.5 sm:p-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 shadow-sm transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">اتصال بالمندوب</span>
                  </a>
                </div>
              </div>

              {/* Handover OTP Verification Code */}
              <div className="pt-2.5 border-t border-amber-200/70 flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">رمز تأكيد الاستلام (OTP):</div>
                    <div className="text-[10px] text-neutral-500">أعطِ هذا الرمز للمندوب عند استلام الشحنة فقط</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-base font-black font-mono tracking-widest text-amber-800 tabular-nums">
                  {order.deliveryOtp || `${order.id.charCodeAt(order.id.length - 1) % 9}${order.id.slice(-3)}` || '8492'}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address & Destination */}
          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>عنوان التوصيل المسجل للطلب:</span>
            </div>

            <div className="text-xs text-neutral-700 space-y-1 pr-6">
              <div className="font-bold text-neutral-950">
                {order.shippingAddress.title} — {order.shippingAddress.recipientName} (<span className="tabular-nums">{order.shippingAddress.phone}</span>)
              </div>
              <div className="text-neutral-600">
                {order.shippingAddress.city} — {order.shippingAddress.district} — {order.shippingAddress.street}
              </div>
              {order.shippingAddress.building && (
                <div className="text-neutral-500">تفاصيل المبنى: {order.shippingAddress.building}</div>
              )}
              {order.shippingAddress.additionalNotes && (
                <div className="text-amber-700 font-semibold text-[11px]">ملاحظات: {order.shippingAddress.additionalNotes}</div>
              )}
            </div>
          </div>

          {/* Order Summary & Financials */}
          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-3">
            <div className="text-xs font-bold text-neutral-800">ملخص الأصناف والحساب:</div>
            <div className="divide-y divide-neutral-200/80 bg-white rounded-xl px-3 border border-neutral-200/70">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CachedImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      preset="thumb"
                      containerClassName="w-10 h-10 rounded-lg overflow-hidden bg-[#F3F4F6] border border-neutral-200 flex-shrink-0"
                      className="w-full h-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-neutral-950 truncate max-w-[200px]">{item.product.name}</div>
                      <div className="text-neutral-500 tabular-nums">الكمية: {item.quantity} {item.selectedSize ? `• المقاس: ${item.selectedSize}` : ''}</div>
                    </div>
                  </div>
                  <div className="font-black text-neutral-950 tabular-nums">
                    {formatPriceWithCurrency((item.product.priceYER || 0) * item.quantity, order.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600 tabular-nums">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-semibold text-neutral-800">{formatPriceWithCurrency(order.subtotalYER, order.currency)}</span>
              </div>
              {order.discountYER > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono">-{formatPriceWithCurrency(order.discountYER, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-mono font-semibold text-neutral-800">
                  {order.shippingFeeYER === 0 ? 'مجاناً' : formatPriceWithCurrency(order.shippingFeeYER, order.currency)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-black text-neutral-950">
                <span>الإجمالي النهائي المسدد:</span>
                <span className="text-amber-700 font-mono">
                  {formatPriceWithCurrency(order.totalYER, order.currency, undefined, { detailedLabel: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Order Actions */}
        <div className="p-4 border-t border-neutral-200 bg-white/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Order Cancellation Controls (Only allowed when status is 'received') */}
          {order.status === 'received' ? (
            <div className="w-full sm:w-auto">
              {!showCancelConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                >
                  إلغاء الطلب
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  <span className="text-[11px] text-rose-800 font-bold">تأكيد الإلغاء واسترجاع المخزون؟</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsCancelling(true);
                        setCancelError(null);
                        await cancelCustomerOrder(order.id);
                        setShowCancelConfirm(false);
                      } catch (err: any) {
                        setCancelError(err?.message || 'تعذر إلغاء الطلب');
                      } finally {
                        setIsCancelling(false);
                      }
                    }}
                    disabled={isCancelling}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black transition-all disabled:opacity-50"
                  >
                    {isCancelling ? 'جاري الإلغاء...' : 'نعم، إلغاء'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-semibold"
                  >
                    تراجع
                  </button>
                </div>
              )}
            </div>
          ) : !isCancelled && order.status !== 'delivered' ? (
            <div className="text-[11px] text-neutral-500">
              لا يمكن إلغاء الطلب بعد بدء مرحلة التجهيز أو الشحن
            </div>
          ) : null}

          {cancelError && (
            <div className="text-xs text-rose-700 font-bold px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-200">
              {cancelError}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all text-center"
          >
            إغلاق نافذة التتبع
          </button>
        </div>
      </div>
    </div>
  );
};
