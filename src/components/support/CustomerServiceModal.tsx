import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { createWhatsAppLink } from '../../utils/whatsappHelper';
import { DEFAULT_BRANCHES } from '../../data/mockData';
import { BranchItem } from '../../types';
import { 
  X, 
  Headphones, 
  MessageCircle, 
  Mail, 
  HelpCircle, 
  Truck, 
  CreditCard, 
  Package, 
  ChevronDown, 
  Clock, 
  Phone,
  Building2,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({ isOpen, onClose }) => {
  const { appSettings } = useMarketplace();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const whatsappNumber = appSettings?.contactWhatsapp || '777000000';
  const supportEmail = appSettings?.contactEmail || 'support@dajjahmall.com';
  const whatsappUrl = createWhatsAppLink(whatsappNumber, 'السلام عليكم، أحتاج مساعدة واستفسار من خدمة عملاء متجر ضَجّة مول');

  const branches: BranchItem[] = (appSettings?.branches && appSettings.branches.length > 0
    ? appSettings.branches
    : DEFAULT_BRANCHES).filter((b) => b.isActive !== false);

  const faqs = [
    {
      q: 'كيف يمكنني فحص ومعاينة المنتج قبل الدفع؟',
      a: 'في ضَجّة مول، نلتزم بمبدأ "المعاينة قبل الدفع". عندما يصل مندوب التوصيل إلى موقعك في صنعاء أو عدن أو أي محافظة، يحق لك فتح الشحنة ومطابقتها والتأكد من الجودة والمقاس قبل دفع أي ريال.',
    },
    {
      q: 'ما هي طرق الدفع المتاحة في ضَجّة مول؟',
      a: 'نوفر الدفع نقداً عند الاستلام، أو عبر التحويل المباشر من المحافظ والبنوك اليمنية المعتمدة (الكريمي مميز، محفظة جيب، جوالي، كاش، ون ون).',
    },
    {
      q: 'كم يستغرق التوصيل داخل صنعاء وعدن والمحافظات؟',
      a: 'التوصيل داخل صنعاء وعدن فوري خلال ساعات في نفس اليوم أو 24 ساعة كحد أقصى. وبالنسبة لبقية المحافظات يتم الشحن والتوصيل خلال 24-48 ساعة.',
    },
    {
      q: 'ما هي سياسة الاسترجاع والاستبدال؟',
      a: 'يمكنك طلب استرجاع أو استبدال المنتج مجاناً خلال 3 أيام من تاريخ الاستلام في حال وجود أي اختلاف في المقاس أو اللون أو أي عيب مصنعي.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#F6F7F9] border border-neutral-200 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-black text-neutral-950">خدمة العملاء والمساعدة</h2>
              <span className="text-[10px] text-neutral-500">فريق ضَجّة مول متواجد لخدمتكم 24 ساعة يومياً</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F6F7F9] hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-700">
          {/* Direct Communication Channels */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 px-1">تواصل مباشر وسريع</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 flex items-center gap-3 transition-colors cursor-pointer shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-950 text-xs">واتساب خدمة العملاء</div>
                  <div className="text-[10px] text-emerald-700 font-mono dir-ltr tabular-nums">{whatsappNumber}</div>
                </div>
              </a>

              <a
                href={`mailto:${supportEmail}`}
                className="p-3 rounded-2xl bg-sky-50 border border-sky-200 hover:border-sky-400 flex items-center gap-3 transition-colors cursor-pointer shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-950 text-xs">البريد الإلكتروني</div>
                  <div className="text-[10px] text-sky-700 font-mono">{supportEmail}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Branches Section */}
          {branches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 px-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="tabular-nums">فروعنا ونقاط الاستلام والمعاينة ({branches.length})</span>
              </div>
              <div className="space-y-2">
                {branches.map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-neutral-950 text-xs">{b.nameAr}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span>{b.addressAr}</span>
                        </div>
                      </div>
                      {b.googleMapsUrl && (
                        <a
                          href={b.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#F6F7F9] hover:bg-amber-50 border border-neutral-200 text-amber-700 text-[10px] font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>الخريطة</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{b.workingHoursAr}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span dir="ltr" className="font-mono text-neutral-700 tabular-nums">{b.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Help Hub */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 px-1">أقسام المساعدة المتخصصة</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <Package className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                <div className="font-bold text-neutral-950 text-[11px]">المساعدة في الطلبات</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">تتبع، تعديل، أو إلغاء</div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <CreditCard className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <div className="font-bold text-neutral-950 text-[11px]">المساعدة في الدفع</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">محافظ، حوالات، كاش</div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <Truck className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
                <div className="font-bold text-neutral-950 text-[11px]">المساعدة في الشحن</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">صنعاء، عدن، المحافظات</div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 px-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>الأسئلة الشائعة (FAQ)</span>
            </div>

            <div className="rounded-2xl bg-white border border-neutral-200 divide-y divide-neutral-200/70 overflow-hidden shadow-sm">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-right hover:bg-[#F6F7F9] transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-950 text-xs">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-3 pt-2 text-[11px] text-neutral-600 leading-relaxed bg-[#F6F7F9]/60 border-t border-neutral-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
