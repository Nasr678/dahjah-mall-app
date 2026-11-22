import React, { useMemo } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEFAULT_FOOTER_CONFIG } from '../../data/mockData';
import { DajjahLogo } from '../common/DajjahLogo';
import { DynamicLucideIcon } from '../common/DynamicLucideIcon';
import { FooterLinkItem } from '../../types';
import { createWhatsAppLink } from '../../utils/whatsappHelper';

interface AppFooterBottomBarProps {
  onOpenStoreLocator: () => void;
  onReplaySplash: () => void;
  onOpenOnboarding: () => void;
  onOpenCurrencyAdmin: () => void;
  onOpenSupport?: () => void;
  onOpenAI?: () => void;
  onNavigatePage?: (page: string) => void;
  onSelectCategory?: (catId: string) => void;
  onSelectProduct?: (prodId: string) => void;
  onOpenPolicy?: (policyKey: string) => void;
}

export const AppFooterBottomBar: React.FC<AppFooterBottomBarProps> = React.memo(({
  onOpenStoreLocator,
  onReplaySplash,
  onOpenOnboarding,
  onOpenCurrencyAdmin,
  onOpenSupport,
  onOpenAI,
  onNavigatePage,
  onSelectCategory,
  onSelectProduct,
  onOpenPolicy,
}) => {
  const { footerConfig: dynamicFooterConfig, appSettings } = useMarketplace();

  // Dynamically sourced directly from Firestore 'footer_config' collection with graceful default fallback
  const footerConfig = useMemo(() => {
    return dynamicFooterConfig || appSettings?.footerConfig || DEFAULT_FOOTER_CONFIG;
  }, [dynamicFooterConfig, appSettings?.footerConfig]);

  const activeBottomLinks = useMemo(() => {
    const list = footerConfig?.bottomLinks && footerConfig.bottomLinks.length > 0
      ? footerConfig.bottomLinks
      : DEFAULT_FOOTER_CONFIG.bottomLinks;
    return list
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [footerConfig?.bottomLinks]);

  // If footer bottom bar or footer as a whole is disabled
  if (footerConfig.isEnabled === false || footerConfig.showBottomLinksBar === false) {
    return null;
  }

  const handleLinkClick = (item: FooterLinkItem) => {
    switch (item.linkType) {
      case 'action_store_locator':
        onOpenStoreLocator();
        break;
      case 'action_splash':
        onReplaySplash();
        break;
      case 'action_onboarding':
        onOpenOnboarding();
        break;
      case 'action_currency_admin':
        onOpenCurrencyAdmin();
        break;
      case 'action_support_modal':
        if (onOpenSupport) onOpenSupport();
        break;
      case 'action_ai_assistant':
        if (onOpenAI) onOpenAI();
        break;
      case 'page':
        if (item.target && onNavigatePage) onNavigatePage(item.target);
        break;
      case 'category':
        if (item.target && onSelectCategory) onSelectCategory(item.target);
        break;
      case 'product':
        if (item.target && onSelectProduct) onSelectProduct(item.target);
        break;
      case 'policy':
        if (item.target && onOpenPolicy) onOpenPolicy(item.target);
        break;
      case 'whatsapp': {
        const url = createWhatsAppLink(item.target || appSettings?.contactWhatsapp, 'السلام عليكم ورحمة الله وبركاته');
        window.open(url, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'phone':
        if (item.target) window.location.href = `tel:${item.target}`;
        break;
      case 'email':
        if (item.target) window.location.href = `mailto:${item.target}`;
        break;
      case 'map':
      case 'external':
      default:
        if (item.target) {
          const url = item.target.startsWith('http') || item.target.startsWith('mailto:') || item.target.startsWith('tel:')
            ? item.target
            : `https://${item.target}`;
          if (item.openInNewTab !== false) {
            window.open(url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = url;
          }
        }
        break;
    }
  };

  const currentYear = footerConfig.autoUpdateYear !== false 
    ? new Date().getFullYear() 
    : (footerConfig.customYear || 2026);

  return (
    <footer 
      id="app-bottom-bar-footer"
      className="w-full bg-white border-t border-neutral-200/85 py-8 pb-24 md:pb-8 px-4 text-center text-xs text-neutral-500 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Logo block */}
        <div className="flex items-center gap-2">
          {footerConfig.showLogo !== false && (
            <>
              {footerConfig.customLogoUrl ? (
                <img 
                  src={footerConfig.customLogoUrl} 
                  alt={footerConfig.brandNameAr || 'ضَجّة مول'} 
                  className="h-6 w-auto object-contain max-w-[120px] rounded"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <DajjahLogo size="xs" withGlow interactive />
              )}
            </>
          )}
          <span className="font-black text-amber-700">{footerConfig.brandNameAr || 'ضَجّة مول'}</span>
          <span className="text-neutral-300">—</span>
          <span className="text-neutral-600">{footerConfig.sloganAr || 'ضَجّة في وجه الغلاء'}</span>
        </div>

        {/* Dynamic Action Links */}
        {activeBottomLinks.length > 0 && (
          <div className="flex items-center flex-wrap justify-center gap-2.5 sm:gap-3.5 text-neutral-600">
            {activeBottomLinks.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <span className="text-neutral-300 select-none">•</span>}
                <button
                  type="button"
                  onClick={() => handleLinkClick(item)}
                  className={`hover:text-amber-700 transition-colors text-[11px] flex items-center gap-1 cursor-pointer font-medium ${
                    item.linkType === 'action_store_locator'
                      ? 'bg-amber-50 border border-amber-300/70 px-2.5 py-1 rounded-xl text-amber-900 hover:bg-amber-100 shadow-2xs'
                      : 'underline decoration-neutral-300 hover:decoration-amber-600'
                  }`}
                >
                  {item.icon && (
                    <DynamicLucideIcon 
                      name={item.icon} 
                      className={`w-3.5 h-3.5 ${item.linkType === 'action_currency_admin' ? 'text-amber-600' : 'text-neutral-500'}`} 
                    />
                  )}
                  <span>{item.titleAr}</span>
                  {item.badge && (
                    <span className="text-[10px] text-amber-700 font-bold">{item.badge}</span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Copyright & Verified signature */}
        {footerConfig.showCopyright !== false && (
          <div className="flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-neutral-500">
            <span>
              {footerConfig.copyrightTextAr || 'جميع الحقوق محفوظة لمنصة ضَجّة مول — صنعاء • عدن • اليمن'} © {currentYear}
            </span>
            {footerConfig.showDeveloperSignature !== false && (
              <>
                <span className="text-neutral-300 select-none">—</span>
                <span className="inline-flex items-center gap-1 font-serif italic text-amber-800 font-black text-xs px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300/70 shadow-2xs">
                  <span>{footerConfig.developerSignatureName || 'Nasr'}</span>
                  {footerConfig.developerVerifiedBadge !== false && (
                    <svg className="w-3.5 h-3.5 text-sky-500 fill-sky-500 inline-block" viewBox="0 0 24 24" aria-label="Verified">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </footer>
  );
});

AppFooterBottomBar.displayName = 'AppFooterBottomBar';
