import React, { useMemo } from 'react';
import { 
  Phone, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_POLICIES, DEFAULT_SOCIAL_MEDIA_LIST, DEFAULT_FOOTER_CONFIG } from '../../data/mockData';
import { SocialBrandIcon } from '../common/SocialBrandIcon';
import { DynamicLucideIcon } from '../common/DynamicLucideIcon';
import { createWhatsAppLink } from '../../utils/whatsappHelper';

interface HomeFooterPoliciesProps {
  onOpenPolicy: (key: string) => void;
  onOpenSupport: () => void;
}

export const HomeFooterPolicies: React.FC<HomeFooterPoliciesProps> = React.memo(({
  onOpenPolicy,
  onOpenSupport,
}) => {
  const { appSettings } = useMarketplace();

  const footerConfig = useMemo(() => {
    return appSettings?.footerConfig || DEFAULT_FOOTER_CONFIG;
  }, [appSettings?.footerConfig]);

  // Dynamic active policies from AppSettings / Firestore
  const activePolicies = useMemo(() => {
    const list = appSettings?.policies && appSettings.policies.length > 0
      ? appSettings.policies
      : DEFAULT_POLICIES;
    return list.filter((p) => p.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [appSettings?.policies]);

  // Dynamic active social channels from AppSettings / Firestore
  const activeSocialList = useMemo(() => {
    const list = appSettings?.socialMediaList && appSettings.socialMediaList.length > 0
      ? appSettings.socialMediaList
      : DEFAULT_SOCIAL_MEDIA_LIST;
    return list.filter((s) => s.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [appSettings?.socialMediaList]);

  // Dynamic active trust badges
  const activeTrustBadges = useMemo(() => {
    const list = footerConfig?.trustBadges && footerConfig.trustBadges.length > 0
      ? footerConfig.trustBadges
      : DEFAULT_FOOTER_CONFIG.trustBadges;
    return list.filter((b) => b.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [footerConfig?.trustBadges]);

  if (footerConfig.isEnabled === false) {
    return null;
  }

  const currentYear = footerConfig.autoUpdateYear !== false 
    ? new Date().getFullYear() 
    : (footerConfig.customYear || 2026);

  return (
    <footer 
      id="home-footer-policies-section"
      className="w-full bg-white border border-neutral-200/85 rounded-3xl pt-8 pb-8 text-right select-none shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Trust Badges Dynamic Grid */}
        {footerConfig.showTrustBadges !== false && activeTrustBadges.length > 0 && (
          <div 
            className={`grid gap-2 sm:gap-4 p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 text-center ${
              activeTrustBadges.length === 1 
                ? 'grid-cols-1 max-w-sm mx-auto' 
                : activeTrustBadges.length === 2 
                  ? 'grid-cols-2 max-w-2xl mx-auto' 
                  : activeTrustBadges.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {activeTrustBadges.map((badge, idx) => (
              <div 
                key={badge.id || idx}
                className={`flex flex-col items-center gap-1.5 p-1 ${
                  idx > 0 && idx < activeTrustBadges.length ? 'border-r border-neutral-200 sm:border-r' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700">
                  <DynamicLucideIcon name={badge.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-black text-neutral-900">{badge.titleAr}</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500">{badge.subtitleAr}</span>
              </div>
            ))}
          </div>
        )}

        {/* Brand & Slogan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {footerConfig.showLogo !== false && (
                <>
                  {footerConfig.customLogoUrl ? (
                    <img 
                      src={footerConfig.customLogoUrl} 
                      alt={footerConfig.brandNameAr} 
                      className="h-6 w-auto object-contain max-w-[100px] rounded"
                      loading="lazy"
                    />
                  ) : null}
                </>
              )}
              <span className="text-xl font-black text-neutral-900">{footerConfig.brandNameAr || 'ضَجّة مول'}</span>
              {footerConfig.sloganAr && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  {footerConfig.sloganAr}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed max-w-md">
              {footerConfig.aboutTextAr || 'المنصة اليمنية الأولى لتجارة الأزياء، الأحذية، والحقائب بأسعار تنافسية وجودة أصلية معتمدة. نوفر خيارات دفع آمنة بالريال الشمالي والجنوبي وتوصيل فوري حتى باب منزلك.'}
            </p>

            {/* Contact quick buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {footerConfig.showWhatsappButton !== false && (
                <a
                  href={createWhatsAppLink(appSettings?.contactWhatsapp, 'السلام عليكم، أريد الاستفسار والطلب من متجر ضَجّة مول')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{footerConfig.whatsappButtonTextAr || 'واتساب المبيعات'}</span>
                </a>
              )}

              {footerConfig.showSupportButton !== false && (
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="px-3.5 py-2 rounded-xl bg-[#F6F7F9] text-neutral-800 border border-neutral-200 hover:border-amber-400 hover:text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>{footerConfig.supportButtonTextAr || 'خدمة العملاء 24/7'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Quick Policy Links Column */}
          {footerConfig.showPoliciesColumn !== false && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{footerConfig.policiesColumnTitleAr || 'السياسات والشروط'}</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                {activePolicies.map((policy) => (
                  <li key={policy.id || policy.key}>
                    <button
                      type="button"
                      onClick={() => onOpenPolicy(policy.key)}
                      className="hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer text-right w-full font-medium"
                    >
                      <ChevronLeft className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{policy.titleAr}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Social Channels Column */}
          {footerConfig.showSocialColumn !== false && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-neutral-900 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-amber-600" />
                <span>{footerConfig.socialColumnTitleAr || 'قنواتنا ومتابعتنا'}</span>
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 text-xs">
                {activeSocialList.map((item) => {
                  return (
                    <a
                      key={item.id}
                      href={item.url.startsWith('http') || item.url.startsWith('https') || item.url.startsWith('mailto:') || item.url.startsWith('tel:') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.name}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 hover:border-amber-400 hover:bg-amber-50/40 text-neutral-700 hover:text-neutral-950 transition-all group cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 p-1 group-hover:scale-110 transition-transform shadow-2xs">
                        <SocialBrandIcon platform={item.icon || item.name} className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-600 group-hover:text-neutral-950 truncate max-w-full mt-1">
                        {item.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Copyright & Security Info */}
        {(footerConfig.showCopyright !== false || footerConfig.showPaymentInfo !== false) && (
          <div className="pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs text-neutral-500">
            {footerConfig.showCopyright !== false && (
              <div>
                جميع الحقوق محفوظة لمنصة <strong className="text-neutral-900">{footerConfig.brandNameAr || 'ضَجّة مول'}</strong> © {currentYear} — {footerConfig.sloganAr || 'ضَجّة في وجه الغلاء'}
              </div>
            )}
            {footerConfig.showPaymentInfo !== false && (
              <div className="flex items-center gap-3">
                {footerConfig.paymentTextNorthSouthAr && <span>{footerConfig.paymentTextNorthSouthAr}</span>}
                {footerConfig.paymentTextNorthSouthAr && footerConfig.paymentGatewaysTextAr && <span>•</span>}
                {footerConfig.paymentGatewaysTextAr && <span>{footerConfig.paymentGatewaysTextAr}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
});

HomeFooterPolicies.displayName = 'HomeFooterPolicies';
