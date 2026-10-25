import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Truck, 
  CreditCard, 
  Lock, 
  Users, 
  Globe, 
  Clock, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { PolicyItem } from '../../types';
import { DEFAULT_POLICIES } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicyKey?: string;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  initialPolicyKey = 'privacy',
}) => {
  const { appSettings } = useMarketplace();
  const [selectedKey, setSelectedKey] = useState<string>(initialPolicyKey);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const policies: PolicyItem[] = appSettings?.policies && appSettings.policies.length > 0 
    ? appSettings.policies 
    : DEFAULT_POLICIES;

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.key === selectedKey) || policies[0];

  const getPolicyIcon = (key: string) => {
    switch (key) {
      case 'privacy':
        return Lock;
      case 'terms':
        return FileText;
      case 'return':
        return RotateCcw;
      case 'shipping':
        return Truck;
      case 'payment':
        return CreditCard;
      case 'customers':
        return Users;
      default:
        return ShieldCheck;
    }
  };

  return (
    <div 
      id="policies-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none"
    >
      <div 
        id="policies-modal-container"
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-850 bg-neutral-900/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {lang === 'ar' ? 'السياسات والشروط المعتمدة' : 'Official Policies & Terms'}
              </h2>
              <p className="text-[10px] text-neutral-400">ضَجّة مول — ضَجّة في وجه الغلاء</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              id="btn-close-policies-modal"
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Horizontal Policy Tabs */}
        <div className="bg-neutral-900/40 border-b border-neutral-850 px-2 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 whitespace-nowrap">
          {policies.map((pol) => {
            const Icon = getPolicyIcon(pol.key);
            const isSelected = selectedKey === pol.key;
            return (
              <button
                key={pol.id || pol.key}
                type="button"
                onClick={() => setSelectedKey(pol.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 shadow-sm font-black'
                    : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-850 border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{lang === 'ar' ? pol.titleAr : pol.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Content View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {currentPolicy && (
            <div className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="pb-3 border-b border-neutral-800 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {lang === 'ar' ? currentPolicy.titleAr : currentPolicy.titleEn}
                  </h3>
                  {currentPolicy.lastUpdated && (
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>
                        {lang === 'ar' ? `آخر تحديث: ${currentPolicy.lastUpdated}` : `Last Updated: ${currentPolicy.lastUpdated}`}
                      </span>
                    </p>
                  )}
                </div>
                <div className="p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Text content formatted */}
              <div className="whitespace-pre-line text-neutral-200 text-xs sm:text-sm leading-loose bg-neutral-900/50 p-4 rounded-2xl border border-neutral-850 font-medium">
                {lang === 'ar' ? currentPolicy.contentAr : currentPolicy.contentEn}
              </div>

              {/* Bottom Assurance Note */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'لأي استفسارات قانونية أو مساعدة بشأن السياسات، يرجى التواصل مع فريق خدمة عملاء ضَجّة مول عبر الواتساب.'
                    : 'For any legal inquiries or support regarding policies, please contact Dajjah Mall support team on WhatsApp.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-850 bg-neutral-900/80 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400">
            © 2026 ضَجّة مول — جميع الحقوق محفوظة
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
