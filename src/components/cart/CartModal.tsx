import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PaymentMethodType, Order } from '../../types';
import { PAYMENT_METHODS } from '../../data/mockData';
import { WalletLogo } from '../common/WalletLogo';
import { LocationPickerModal } from '../location/LocationPickerModal';
import { CachedImage } from '../common/CachedImage';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Banknote, 
  Copy, 
  Check, 
  Info, 
  ChevronLeft,
  Gift,
  AlertCircle
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (order: Order) => void;
  onTrackOrder?: (order: Order) => void;
  onNavigateHome?: () => void;
  initialStep?: 'cart' | 'checkout';
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onTrackOrder,
  onNavigateHome,
  initialStep = 'cart',
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    calculateCheckoutTotals,
    selectedAddress,
    setSelectedAddress,
    addOrUpdateAddress,
    applyCoupon,
    removeCoupon,
    activeCoupon,
    createOrder,
    appSettings,
    currentUser,
  } = useMarketplace();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(initialStep || 'cart');

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep || 'cart');
    }
  }, [isOpen, initialStep]);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Dynamic Payment Methods list derived from Admin AppSettings with static fallback
  const paymentMethodsList = React.useMemo(() => {
    if (appSettings?.paymentOptions && appSettings.paymentOptions.length > 0) {
      return appSettings.paymentOptions
        .filter((opt: any) => opt.isEnabled !== false && opt.isAvailable !== false)
        .map((opt: any) => ({
          id: opt.id as PaymentMethodType,
          name: opt.nameAr || opt.name,
          subtitle: opt.subtitleAr || opt.instructionsAr || opt.subtitle || opt.description,
          description: opt.instructionsAr || opt.description || opt.instructions,
          merchantCode: opt.accountNumber || opt.merchantCode,
          accountNumber: opt.accountNumber,
          instructions: opt.instructionsAr || opt.instructions,
          isAvailable: opt.isAvailable !== false,
          isDefault: opt.isDefault,
          badgeText: opt.badgeText,
        }));
    }
    return PAYMENT_METHODS.filter((m) => m.isAvailable !== false);
  }, [appSettings?.paymentOptions]);

  // Checkout State
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('cash_on_delivery');

  useEffect(() => {
    if (paymentMethodsList.length > 0) {
      const exists = paymentMethodsList.some((m) => m.id === selectedPayment);
      if (!exists) {
        setSelectedPayment(paymentMethodsList[0].id as PaymentMethodType);
      }
    }
  }, [paymentMethodsList, selectedPayment]);

  const [transactionRef, setTransactionRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Gift Order State
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftRecipientPhone, setGiftRecipientPhone] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [hidePriceInInvoice, setHidePriceInInvoice] = useState(true);
  
  // Location modal trigger
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Reset modal step to cart whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('cart');
      setCouponFeedback(null);
      setTransactionRef('');
      setOrderError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totals = calculateCheckoutTotals();

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponFeedback(result);
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    if (!currentUser) {
      setOrderError('يرجى تسجيل الدخول أو إنشاء حساب سريع لتأكيد طلبك وتتبع شحنتك وضمان حق المعاينة والإرجاع.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      setIsLocationPickerOpen(true);
      return;
    }

    setOrderError(null);
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        paymentMethod: selectedPayment,
        shippingAddress: selectedAddress,
        notes: orderNotes,
        transferReference: transactionRef,
        giftOrder: isGiftOrder ? {
          isGift: true,
          recipientName: giftRecipientName.trim(),
          recipientPhone: giftRecipientPhone.trim(),
          giftMessage: giftMessage.trim(),
          hidePrice: hidePriceInInvoice
        } : undefined
      });

      setPlacedOrder(order);
      setStep('success');

      if (onOrderPlaced) {
        onOrderPlaced(order);
      }

      // Trigger Celebration Confetti lazily on order success
      import('canvas-confetti')
        .then((mod) => {
          mod.default({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#8A2BE2', '#FFFFFF', '#10B981'],
          });
        })
        .catch(() => {});
    } catch (err: any) {
      console.error('Error confirming order:', err);
      setOrderError(err?.message || 'تعذر تأكيد الطلب وحفظه في السيرفر. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrderClick = () => {
    if (placedOrder && onTrackOrder) {
      onTrackOrder(placedOrder);
    }
    onClose();
  };

  const handleBackToHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    }
    onClose();
  };

  const selectedPaymentMethodObj = PAYMENT_METHODS.find((m) => m.id === selectedPayment) || PAYMENT_METHODS[0];

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-2 sm:p-4 bg-neutral-950/50 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-950 tabular-nums">
                  {step === 'cart' && `سلة التسوق (${cart.length})`}
                  {step === 'checkout' && 'إتمام الطلب وبيانات التوصيل في اليمن'}
                  {step === 'success' && 'تم تأكيد طلبك بنجاح!'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {step === 'cart' && 'ضَجّة في وجه الغلاء — تسوق بالعملة المعتمدة'}
                  {step === 'checkout' && 'اختر عنوان التوصيل وطريقة السداد المفضلة'}
                  {step === 'success' && 'طلبك الآن قيد المتابعة والتجهيز الفوري'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Step 1: Cart Items List */}
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#F6F7F9] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
                      <ShoppingCart className="w-8 h-8 opacity-60" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-neutral-900">سلة التسوق فارغة حالياً</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                        تصفح أقسام ضَجّة مول الفاخرة واختر ما يناسبك بأسعار منافسة في وجه الغلاء
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all"
                    >
                      تصفح المنتجات الآن
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 hover:border-neutral-300 transition-colors"
                        >
                          <CachedImage
                            src={item.product.images[0]}
                            alt={item.product.name}
                            preset="thumb"
                            containerClassName="w-16 h-16 rounded-xl overflow-hidden bg-white border border-neutral-200 flex-shrink-0"
                            className="w-full h-full object-cover"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-950 truncate">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                              {item.selectedColor && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 bg-neutral-200" />
                                  <span>{item.selectedColor}</span>
                                </span>
                              )}
                              {item.selectedSize && <span>• المقاس: {item.selectedSize}</span>}
                            </div>
                            <div className="text-xs font-black text-amber-800 mt-1 font-mono tabular-nums">
                              {formatPrice(item.product.priceYER)}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl p-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-800 flex items-center justify-center text-xs font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-mono font-bold text-neutral-950 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-800 flex items-center justify-center text-xs font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Input */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="أدخل كود الخصم (مثال: DAJJAH15 أو FREE)"
                          className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl py-2.5 px-3 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-amber-500"
                        />
                        {activeCoupon && (
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-rose-600 font-bold hover:underline"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-colors"
                      >
                        تطبيق
                      </button>
                    </form>

                    {couponFeedback && (
                      <div
                        className={`text-[11px] p-2.5 rounded-xl font-semibold ${
                          couponFeedback.success
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {couponFeedback.message}
                      </div>
                    )}

                    {/* Totals Summary */}
                    <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-2 text-xs tabular-nums">
                      <div className="flex justify-between text-neutral-600">
                        <span>المجموع الفرعي:</span>
                        <span className="font-mono font-semibold text-neutral-800">{formatPrice(totals.subtotalBaseYER)}</span>
                      </div>
                      {totals.discountBaseYER > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>الخصم المطبق:</span>
                          <span className="font-mono">-{formatPrice(totals.discountBaseYER)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600">
                        <span>رسوم التوصيل:</span>
                        <span className="font-mono font-semibold text-neutral-800">
                          {totals.deliveryFeeBaseYER === 0 ? 'مجاناً' : formatPrice(totals.deliveryFeeBaseYER)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-black text-neutral-950">
                        <span>الإجمالي النهائي:</span>
                        <span className="text-amber-700 font-mono text-base">
                          {formatPrice(totals.totalBaseYER, { detailedLabel: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Checkout Details */}
            {step === 'checkout' && (
              <div className="space-y-4">
                {/* Order Error Alert Banner */}
                {orderError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span className="flex-1 font-semibold">{orderError}</span>
                  </div>
                )}

                {/* Visitor Login Reminder */}
                {!currentUser && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-900">تسجيل الدخول مطلوب لإتمام الطلب وتتبع الشحنة</div>
                      <div className="text-[11px] text-neutral-600">سلتك الحالية محفوظة ومؤمنة بالكامل ولن تفقد أي منتج عند الدخول</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs whitespace-nowrap transition-all shadow-sm self-start sm:self-auto"
                    >
                      تسجيل الدخول / حساب جديد
                    </button>
                  </div>
                )}

                {/* Delivery Address Section */}
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-neutral-950">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>عنوان وموقع التوصيل</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                    >
                      <span>تغيير / تحديد على الخريطة</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>

                  {selectedAddress ? (
                    <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between font-bold text-neutral-950">
                        <span>{selectedAddress.recipientName} (<span className="tabular-nums">{selectedAddress.phone}</span>)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                          {selectedAddress.city}
                        </span>
                      </div>
                      <p className="text-neutral-600">
                        {selectedAddress.district} — {selectedAddress.street} {selectedAddress.building ? `(${selectedAddress.building})` : ''}
                      </p>
                      {selectedAddress.additionalNotes && (
                        <p className="text-amber-700 font-semibold text-[11px]">ملاحظات: {selectedAddress.additionalNotes}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="w-full p-4 rounded-xl bg-white border border-dashed border-neutral-300 hover:border-amber-500 text-neutral-600 hover:text-amber-800 text-xs text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                    >
                      <MapPin className="w-6 h-6 text-amber-600 animate-bounce" />
                      <span className="font-bold">انقر هنا لتحديد موقع التوصيل على الخريطة</span>
                    </button>
                  )}
                </div>

                {/* Payment Methods Section — Cash on Delivery as Default */}
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-neutral-950">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>طريقة السداد المعتمدة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id as PaymentMethodType)}
                          className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-3 relative ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 text-neutral-950 shadow-sm'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <WalletLogo methodId={method.id as PaymentMethodType} size={36} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-neutral-950">{method.name}</span>
                              {method.isDefault && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                  الافتراضي
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{method.subtitle || method.description}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Details for Electronic Wallets */}
                  {selectedPayment !== 'cash_on_delivery' && (
                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2.5 text-xs">
                      <div className="text-amber-800 font-bold flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>بيانات التحويل لمحفظة {selectedPaymentMethodObj.name}:</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-[#F6F7F9] p-2.5 rounded-xl font-mono border border-neutral-200">
                        <div>
                          <span className="text-[11px] text-neutral-500 block font-sans">كود التاجر / الحساب:</span>
                          <strong className="text-neutral-950 text-sm tracking-wider tabular-nums">
                            {selectedPaymentMethodObj.merchantCode || selectedPaymentMethodObj.accountNumber || '770000000'}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedPaymentMethodObj.merchantCode || '770000000', 'merchant')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-amber-500 text-amber-800 hover:text-neutral-950 text-[11px] font-bold font-sans flex items-center gap-1 transition-colors"
                        >
                          {copiedField === 'merchant' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-amber-600" />
                              <span>نسخ الرقم</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-600 font-semibold mb-1">
                          رقم مرجع الحوالة / الإشعار (بعد إتمام التحويل):
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="أدخل رقم العملية أو الإشعار للتأكيد الفوري"
                          className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 placeholder-neutral-400 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'cash_on_delivery' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>
                        المعاينة قبل الدفع: يمكنك فتح الطرد وفحص المنتجات مع المندوب قبل السداد، مع إرجاع فوري مجاني إن لم يعجبك.
                      </span>
                    </div>
                  )}
                </div>

                {/* Send as Gift Section */}
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-neutral-950">إرسال كهدية لشخص آخر 🎁</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGiftOrder}
                        onChange={(e) => setIsGiftOrder(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {isGiftOrder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2 border-t border-neutral-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-neutral-600 font-semibold mb-1">اسم مستلم الهدية *</label>
                          <input
                            type="text"
                            value={giftRecipientName}
                            onChange={(e) => setGiftRecipientName(e.target.value)}
                            placeholder="اسم الشخص المستلم"
                            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-600 font-semibold mb-1">رقم هاتف المستلم *</label>
                          <input
                            type="tel"
                            value={giftRecipientPhone}
                            onChange={(e) => setGiftRecipientPhone(e.target.value)}
                            placeholder="77XXXXXXX"
                            className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 placeholder-neutral-400 font-mono focus:outline-none focus:border-amber-500 text-left tabular-nums"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-600 font-semibold mb-1">بطاقة الإهداء والرسالة الخاصة 💌</label>
                        <textarea
                          rows={2}
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="اكتب تهنئتك أو رسالتك لطباعتها في كرت إهداء أنيق داخل الطرد..."
                          className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={hidePriceInInvoice}
                          onChange={(e) => setHidePriceInInvoice(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-amber-500 border-neutral-300 bg-white"
                        />
                        <span className="text-[11px] text-neutral-700 font-semibold">إخفاء الأسعار من الفاتورة المرفقة بالطرد</span>
                      </label>
                    </motion.div>
                  )}
                </div>

                {/* Additional Notes for Courier */}
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-2">
                  <label className="block text-xs font-black text-neutral-950">ملاحظات التوصيل الإضافية (اختياري):</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="مثال: المعاينة قبل الاستلام، موعد التوصيل بعد العصر..."
                    className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Final Order Review Summary */}
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 space-y-2 text-xs tabular-nums">
                  <div className="flex justify-between text-neutral-600">
                    <span>قيمة المشتريات:</span>
                    <span className="font-mono font-semibold text-neutral-800">{formatPrice(totals.subtotalBaseYER)}</span>
                  </div>
                  {totals.discountBaseYER > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>الخصم:</span>
                      <span className="font-mono">-{formatPrice(totals.discountBaseYER)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>التوصيل إلى ({selectedAddress?.city || 'اليمن'}):</span>
                    <span className="font-mono font-semibold text-neutral-800">
                      {totals.deliveryFeeBaseYER === 0 ? 'مجاناً' : formatPrice(totals.deliveryFeeBaseYER)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-black text-neutral-950">
                    <span>الإجمالي النهائي المستحق:</span>
                    <span className="text-amber-700 font-mono text-base">
                      {formatPrice(totals.totalBaseYER, { detailedLabel: true })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success Screen (Bulletproof with Zero Blank Screen Risk) */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                    تم تأكيد واستلام طلبك بنجاح!
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    رقم الطلب الخاص بك: <strong className="text-amber-800 font-mono text-sm tabular-nums">{placedOrder?.id || 'DJ-2026-CONFIRMED'}</strong>
                  </p>
                </div>

                {/* Order Confirmation Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 max-w-md mx-auto text-xs text-right space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-200">
                    <span className="text-neutral-500">حالة الطلب:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>تم استلام الطلب وتأكيده وبدء التجهيز</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-200">
                    <span className="text-neutral-500">طريقة السداد:</span>
                    <div className="flex items-center gap-2">
                      <WalletLogo methodId={placedOrder?.paymentMethod || selectedPayment} size={22} />
                      <span className="text-neutral-950 font-bold">
                        {placedOrder?.paymentMethod === 'cash_on_delivery' 
                          ? 'الدفع عند الاستلام (معاينة أولاً)' 
                          : selectedPaymentMethodObj.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-200">
                    <span className="text-neutral-500">عنوان وموقع التوصيل:</span>
                    <span className="text-neutral-950 font-bold text-left max-w-[200px] truncate">
                      {placedOrder?.shippingAddress?.city || selectedAddress?.city || 'صنعاء'} — {placedOrder?.shippingAddress?.district || selectedAddress?.district || 'وسط المدينة'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-500">المبلغ الإجمالي المستحق:</span>
                    <span className="text-amber-700 font-mono font-black text-sm tabular-nums">
                      {formatPrice(placedOrder?.totalYER || totals.totalBaseYER, { detailedLabel: true })}
                    </span>
                  </div>
                </div>

                {/* Next Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={handleTrackOrderClick}
                    className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>تتبع الطلب</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToHomeClick}
                    className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-[#F6F7F9] hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold border border-neutral-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>العودة للرئيسية والتسوق</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          {step !== 'success' && (
            <div className="p-4 border-t border-neutral-200 bg-white/95 flex items-center justify-between">
              {step === 'checkout' ? (
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-neutral-200"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة للسلة</span>
                </button>
              ) : (
                <div className="text-xs text-neutral-500 font-mono font-semibold tabular-nums">
                  {cart.length} أصناف في السلة
                </div>
              )}

              {step === 'cart' && cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>متابعة إتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {step === 'checkout' && (
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري تسجيل الطلب...' : 'تأكيد وإرسال الطلب الآن'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location Picker Sub-Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSaveAddress={(newAddr) => {
          addOrUpdateAddress(newAddr);
          setSelectedAddress(newAddr);
        }}
        initialAddress={selectedAddress}
      />

      {/* Auth Modal for Quick Login / Account Creation */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setOrderError(null);
        }}
      />
    </>
  );
};
