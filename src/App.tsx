import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Product } from './types';
import { CATEGORIES } from './data/mockData';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';

// Core Navigation & Static Components
import { Header } from './components/navigation/Header';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { SplashScreen } from './components/splash/SplashScreen';

// Home Sections (Strictly ordered to user specification)
import { HeroCarousel } from './components/home/HeroCarousel';
import { HomePromoBenefits } from './components/home/HomePromoBenefits';
import { EditorialCategories } from './components/home/EditorialCategories';
import { HomeShortcutsBar } from './components/home/HomeShortcutsBar';
import { BestSellersSection } from './components/home/BestSellersSection';
import { NewArrivalsSection } from './components/home/NewArrivalsSection';
import { FlashDealsSection } from './components/home/FlashDealsSection';
import { DajjahPicksSection } from './components/home/DajjahPicksSection';
import { PersonalizedForYouSection } from './components/home/PersonalizedForYouSection';
import { FeaturedStores } from './components/home/FeaturedStores';
import { HomeProductTabs } from './components/home/HomeProductTabs';
import { HomeTopCategoryBar } from './components/home/HomeTopCategoryBar';
import { HomeFooterPolicies } from './components/home/HomeFooterPolicies';
import { AppFooterBottomBar } from './components/layout/AppFooterBottomBar';
import { ProductCard } from './components/products/ProductCard';
import { FlyToCartOverlay } from './components/cart/FlyToCartOverlay';
import { ProductGridSkeleton, ProfileSkeleton } from './components/common/ProductSkeleton';

// Views & Screens
import { MainCategoriesScreen } from './components/categories/MainCategoriesScreen';
import { CategoryLandingPage } from './components/categories/CategoryLandingPage';
import { BrandsScreen } from './components/brands/BrandsScreen';
import { TrendsScreen } from './components/trends/TrendsScreen';
import { ProfileView } from './components/profile/ProfileView';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { SmartSearchModal } from './components/search/SmartSearchModal';
import { ProductDetailsModal } from './components/products/ProductDetailsModal';
import { ProductQuickViewModal } from './components/products/ProductQuickViewModal';
import AIAssistantModal from './components/ai/AIAssistantModal';
import { CartModal } from './components/cart/CartModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { LocationPickerModal } from './components/location/LocationPickerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AccessibilityModal } from './components/settings/AccessibilityModal';
import { CustomerServiceModal } from './components/support/CustomerServiceModal';
import { PoliciesModal } from './components/policies/PoliciesModal';
import { CurrencySettingsModal } from './components/admin/CurrencySettingsModal';
import { PromoOffersModal } from './components/common/PromoOffersModal';
import { LeafletStoreLocatorModal } from './components/maps/LeafletStoreLocatorModal';

// Large Admin Dashboard remains lazy-loaded
const AdminProductDashboard = lazy(() => import('./components/admin/AdminProductDashboard'));

// Icons
import { Heart, CheckCircle2 } from 'lucide-react';

function MarketplaceApp() {
  const {
    products,
    categories,
    brands,
    cart,
    addToCart,
    wishlist,
    toggleWishlist,
    currentCurrency,
    setCurrency,
    currencyRates,
    updateCurrencyRates,
    currentUser,
    selectedAddress,
    addOrUpdateAddress,
    setSelectedAddress,
    isAdmin,
    notifications,
  } = useMarketplace();

  const unreadNotifsCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.isRead).length;
  }, [notifications]);

  const appCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : CATEGORIES;
  }, [categories]);

  // App Lifecycle States
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isCurrencyAdminOpen, setIsCurrencyAdminOpen] = useState(false);
  const [isProductAdminOpen, setIsProductAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('privacy');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');

  // Category & Subcategory Navigation State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct URL Hash Route & Admin Portal listener (e.g. /#admin or ?admin=true)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#admin' || search.includes('admin=true')) {
        setIsProductAdminOpen(true);
      }
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  // Browser Back Button (popstate) safety handling
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
      } else if (isProductAdminOpen) {
        setIsProductAdminOpen(false);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isSearchOpen) {
        setIsSearchOpen(false);
      } else if (isAuthOpen) {
        setIsAuthOpen(false);
      } else if (isNotifsOpen) {
        setIsNotifsOpen(false);
      } else if (isLocationPickerOpen) {
        setIsLocationPickerOpen(false);
      } else if (isCurrencyAdminOpen) {
        setIsCurrencyAdminOpen(false);
      } else if (isAIOpen) {
        setIsAIOpen(false);
      } else if (selectedSubcategory) {
        setSelectedSubcategory(null);
      } else if (selectedCategoryId) {
        setSelectedCategoryId(null);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    selectedProduct,
    isProductAdminOpen,
    isCartOpen,
    isSearchOpen,
    isAuthOpen,
    isNotifsOpen,
    isLocationPickerOpen,
    isCurrencyAdminOpen,
    isAIOpen,
    selectedSubcategory,
    selectedCategoryId,
    activeTab,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleAddToCartWithToast = useCallback((product: Product, options?: { color?: string; size?: string; quantity?: number }) => {
    addToCart(product, options);
    showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح!`);
  }, [addToCart, showToast]);

  const handleOpenQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const handleOpenCart = useCallback(() => {
    setCartInitialStep('cart');
    setIsCartOpen(true);
  }, []);

  const handleBuyNow = useCallback((product: Product, options?: { color?: string; size?: string; quantity?: number }) => {
    addToCart(product, options);
    setCartInitialStep('checkout');
    setIsCartOpen(true);
  }, [addToCart]);

  const handleToggleFavoriteWithToast = useCallback((product: Product) => {
    toggleWishlist(product.id);
    showToast('تم تحديث المفضلة ❤️');
  }, [toggleWishlist, showToast]);

  const [homeDepartment, setHomeDepartment] = useState<string>('all');

  const handleSelectCategory = useCallback((categoryId: string, subcategoryId?: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategory(subcategoryId || null);
    setActiveTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenCategoriesTab = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedSubcategory(null);
    setActiveTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fast O(1) set for wishlist lookups & memoized list
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);
  const wishlistProducts = useMemo(() => products.filter((p) => wishlistSet.has(p.id)), [products, wishlistSet]);
  const totalCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return appCategories.find((c) => c.id === selectedCategoryId) || appCategories[0];
  }, [selectedCategoryId, appCategories]);

  return (
    <div 
      className="min-h-screen bg-[#07060A] text-neutral-100 flex flex-col antialiased selection:bg-amber-500 selection:text-neutral-950 font-sans"
      dir="rtl"
    >
      {/* 1. Splash Screen Animation */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          onSkip={() => setShowSplash(false)}
        />
      )}

      {/* 2. Onboarding Modal for New Users */}
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingScreen
            onComplete={() => setShowOnboarding(false)}
          />
        </Suspense>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-neutral-900/95 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-bold shadow-2xl shadow-amber-500/20 backdrop-blur-xl flex items-center gap-2 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        unreadNotifsCount={unreadNotifsCount}
        currentCurrency={currentCurrency}
        currentCity={selectedAddress ? `${selectedAddress.city} - ${selectedAddress.district || ''}` : 'صنعاء - حدة'}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onCurrencyChange={setCurrency}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={handleOpenCart}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => {
          if (currentUser) {
            setActiveTab('profile');
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenWishlist={() => setActiveTab('wishlist')}
        onOpenOffers={() => {}}
        onOpenAdmin={() => setIsProductAdminOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ========================================================================= */}
      {/* VIEW 1: HOME PAGE */}
      {/* ========================================================================= */}
      {activeTab === 'home' && (
        <main 
          className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-2.5 pb-24 md:pb-12 space-y-4 sm:space-y-6"
        >
          {/* Top Quick Category Navigation Bar */}
          <HomeTopCategoryBar
            categories={appCategories}
            selectedCategoryId={homeDepartment}
            onSelectCategory={(catId) => {
              setHomeDepartment(catId);
              if (catId !== 'all') {
                handleSelectCategory(catId);
              }
            }}
            onViewAllCategories={handleOpenCategoriesTab}
          />

          {/* Section 1: Hero Carousel Banner */}
          <HeroCarousel
            onShopNow={(categoryId) => categoryId ? handleSelectCategory(categoryId) : handleOpenCategoriesTab()}
            onExploreOffers={handleOpenCategoriesTab}
            onOpenAI={() => setIsAIOpen(true)}
            onSelectProduct={(prodId) => {
              const p = products.find((x) => x.id === prodId);
              if (p) setSelectedProduct(p);
            }}
          />

          {/* Section 2: Promo Benefits Strip */}
          <HomePromoBenefits 
            onOpenFreeShipping={() => {
              setSelectedPolicyKey('shipping');
              setIsPoliciesOpen(true);
            }}
          />

          {/* Section 3: Shortcuts Bar */}
          <HomeShortcutsBar />

          {/* Section 4: Editorial Categories Navigation */}
          <EditorialCategories
            categories={appCategories}
            onSelectCategory={handleSelectCategory}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 5: Flash Deals Section */}
          <FlashDealsSection
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 6: Home Product Tabs */}
          <HomeProductTabs
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onOpenBrands={() => setActiveTab('brands')}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 7: Best Sellers */}
          <BestSellersSection
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 8: New Arrivals */}
          <NewArrivalsSection
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 9: Dajjah Picks */}
          <DajjahPicksSection
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onViewAll={handleOpenCategoriesTab}
          />

          {/* Section 10: Featured Stores */}
          <FeaturedStores
            onSelectStore={handleOpenCategoriesTab}
            onExploreCategories={handleOpenCategoriesTab}
          />

          {/* Section 11: Personalized For You Section */}
          <PersonalizedForYouSection
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
          />

          {/* Section 12: Footer Policies & Guarantees */}
          <HomeFooterPolicies 
            onOpenPolicy={(policyKey) => {
              setSelectedPolicyKey(policyKey);
              setIsPoliciesOpen(true);
            }}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BRANDS */}
      {/* ========================================================================= */}
      {activeTab === 'brands' && (
        <Suspense fallback={
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 space-y-4">
            <div className="h-6 w-44 rounded-xl shimmer-wave" />
            <ProductGridSkeleton count={6} />
          </div>
        }>
          <BrandsScreen
            brands={brands}
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleOpenQuickView}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onBackToHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2.5: TRENDS */}
      {/* ========================================================================= */}
      {activeTab === 'trends' && (
        <Suspense fallback={
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 space-y-4">
            <div className="h-44 w-full rounded-3xl shimmer-wave" />
            <ProductGridSkeleton count={6} />
          </div>
        }>
          <TrendsScreen
            products={products}
            currency={currentCurrency}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleOpenQuickView}
            onSelectProduct={setSelectedProduct}
            onBackToHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="flex-1 w-full">
          <Suspense fallback={
            <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 space-y-4">
              <div className="h-28 w-full rounded-3xl shimmer-wave" />
              <ProductGridSkeleton count={8} />
            </div>
          }>
            {!activeCategory ? (
              <MainCategoriesScreen
                categories={appCategories}
                onSelectCategory={handleSelectCategory}
                onBackToHome={() => setActiveTab('home')}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            ) : (
              <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4">
                <CategoryLandingPage
                  category={activeCategory}
                  allCategories={appCategories}
                  products={products}
                  currency={currentCurrency}
                  wishlist={wishlist}
                  initialSubcategory={selectedSubcategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategoryId(catId);
                    setSelectedSubcategory(null);
                  }}
                  onBackToHome={() => setActiveTab('home')}
                  onBackToMainCategories={() => {
                    setSelectedCategoryId(null);
                    setSelectedSubcategory(null);
                  }}
                  onToggleFavorite={handleToggleFavoriteWithToast}
                  onAddToCart={handleOpenQuickView}
                  onSelectProduct={setSelectedProduct}
                  onOpenCart={handleOpenCart}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              </div>
            )}
          </Suspense>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER APP VIEWS (WISHLIST, PROFILE, ORDERS) */}
      {/* ========================================================================= */}
      {activeTab !== 'home' && activeTab !== 'categories' && activeTab !== 'trends' && activeTab !== 'brands' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-10 sm:space-y-14">
          {/* VIEW 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    <span>قائمة أمنياتي ({wishlistProducts.length})</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    منتجاتك المفضلة المحفوظة للشراء لاحقاً ومتابعة خصوماتها
                  </p>
                </div>

                {wishlistProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      wishlistProducts.forEach((p) => addToCart(p));
                      showToast('تمت إضافة جميع المفضلة إلى السلة!');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-neutral-950 transition-colors"
                  >
                    إضافة الكل إلى السلة
                  </button>
                )}
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-20 text-center bg-neutral-900/50 rounded-3xl border border-neutral-800">
                  <Heart className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">قائمة المفضلة فارغة حالياً</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                    اضغط على أيقونة القلب على أي منتج أثناء التصفح لحفظه والرجوع إليه بسهولة.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold"
                  >
                    استكشف المنتجات الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {wishlistProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      currency={currentCurrency}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavoriteWithToast}
                      onAddToCart={handleOpenQuickView}
                      onSelectProduct={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: PROFILE */}
          {activeTab === 'profile' && (
            <Suspense fallback={<ProfileSkeleton />}>
              <ProfileView
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenWishlist={() => setActiveTab('wishlist')}
                onOpenSupport={() => setIsSupportOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenAdmin={() => setIsProductAdminOpen(true)}
                onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
                onReplaySplash={() => setShowSplash(true)}
                onOpenCurrencyAdmin={() => setIsCurrencyAdminOpen(true)}
              />
            </Suspense>
          )}
        </main>
      )}

      {/* Global Modals (Lazy Loaded on demand) */}
      <Suspense fallback={null}>
        {/* 1. Smart Search */}
        {isSearchOpen && (
          <SmartSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            currency={currentCurrency}
            onSelectProduct={setSelectedProduct}
            onSelectCategory={(catId) => {
              handleSelectCategory(catId);
            }}
          />
        )}

        {/* 2. Product Details (Full Screen & Detailed) */}
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            currency={currentCurrency}
            isFavorite={wishlistSet.has(selectedProduct.id)}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleAddToCartWithToast}
            onBuyNow={handleBuyNow}
            onSelectProduct={setSelectedProduct}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* 2.5 Product Quick View Modal */}
        {quickViewProduct && (
          <ProductQuickViewModal
            isOpen={Boolean(quickViewProduct)}
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            currency={currentCurrency}
            isFavorite={wishlistSet.has(quickViewProduct.id)}
            onToggleFavorite={handleToggleFavoriteWithToast}
            onAddToCart={handleAddToCartWithToast}
            onBuyNow={handleBuyNow}
            onOpenFullDetails={(p) => {
              setQuickViewProduct(null);
              setSelectedProduct(p);
            }}
            onShowToast={showToast}
          />
        )}

        {/* 3. AI Concierge Assistant */}
        {isAIOpen && (
          <AIAssistantModal
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            currency={currentCurrency}
            onSelectProduct={(p) => {
              setIsAIOpen(false);
              setSelectedProduct(p);
            }}
            onAddToCart={handleAddToCartWithToast}
          />
        )}

        {/* 4. Cart & Checkout */}
        {isCartOpen && (
          <CartModal
            isOpen={isCartOpen}
            initialStep={cartInitialStep}
            onClose={() => setIsCartOpen(false)}
            onTrackOrder={(order) => {
              setIsCartOpen(false);
              setActiveTab('profile');
              showToast(`تم فتح تتبع طلبك (${order.id}) بنجاح`);
            }}
            onNavigateHome={() => {
              setIsCartOpen(false);
              setActiveTab('home');
            }}
          />
        )}

        {/* 5. Auth Modal */}
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={(newUser) => {
              showToast(`مرحباً بك يا ${newUser.name} في ضَجّة مول!`);
            }}
          />
        )}

        {/* 6. Notifications */}
        {isNotifsOpen && (
          <NotificationsModal
            isOpen={isNotifsOpen}
            onClose={() => setIsNotifsOpen(false)}
            onSelectAction={(notif) => {
              if (notif.type === 'deal') {
                handleOpenCategoriesTab();
              } else if (notif.type === 'order') {
                setActiveTab('profile');
              }
            }}
          />
        )}

        {/* 7. Location Picker Modal */}
        {isLocationPickerOpen && (
          <LocationPickerModal
            isOpen={isLocationPickerOpen}
            onClose={() => setIsLocationPickerOpen(false)}
            onSaveAddress={(newAddr) => {
              addOrUpdateAddress(newAddr);
              setSelectedAddress(newAddr);
              showToast(`تم تحديث موقع التوصيل إلى: ${newAddr.city}`);
            }}
            initialAddress={selectedAddress}
          />
        )}

        {/* 8. Full Real Settings Modal */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          />
        )}

        {/* 9. Customer Service & Support Hub Modal */}
        {isSupportOpen && (
          <CustomerServiceModal
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
          />
        )}

        {/* 10. Accessibility Settings Modal */}
        {isAccessibilityOpen && (
          <AccessibilityModal
            isOpen={isAccessibilityOpen}
            onClose={() => setIsAccessibilityOpen(false)}
          />
        )}

        {/* 11. Currency Settings Modal */}
        {isCurrencyAdminOpen && (
          <CurrencySettingsModal
            isOpen={isCurrencyAdminOpen}
            onClose={() => setIsCurrencyAdminOpen(false)}
            currentCurrency={currentCurrency}
            rates={currencyRates}
            onSelectCurrency={setCurrency}
            onUpdateRates={updateCurrencyRates}
          />
        )}

        {/* 12. Dynamic Policies & Guarantees Modal */}
        {isPoliciesOpen && (
          <PoliciesModal
            isOpen={isPoliciesOpen}
            onClose={() => setIsPoliciesOpen(false)}
            initialPolicyKey={selectedPolicyKey}
          />
        )}

        {/* 13. Dynamic Admin-Controlled Popup Offer */}
        <PromoOffersModal
          onOpenCategory={(target) => {
            if (target && target !== 'all') {
              handleSelectCategory(target);
            } else {
              handleOpenCategoriesTab();
            }
          }}
        />

        {/* 14. Admin Product Dashboard Modal (Owner Only) */}
        {isProductAdminOpen && (
          <AdminProductDashboard
            isOpen={isProductAdminOpen}
            onClose={() => setIsProductAdminOpen(false)}
          />
        )}

        {/* 15. Store & Branch Locator Modal (Leaflet & OpenStreetMap) */}
        {isStoreLocatorOpen && (
          <LeafletStoreLocatorModal
            isOpen={isStoreLocatorOpen}
            onClose={() => setIsStoreLocatorOpen(false)}
          />
        )}
      </Suspense>

      {/* Dynamic Full Admin Controlled Bottom Footer Bar */}
      <AppFooterBottomBar
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onReplaySplash={() => setShowSplash(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenCurrencyAdmin={() => setIsCurrencyAdminOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onNavigatePage={(page) => {
          if (page === 'home' || page === 'trends' || page === 'profile' || page === 'wishlist' || page === 'brands') {
            setActiveTab(page as NavTab);
          } else if (page === 'cart') {
            handleOpenCart();
          } else if (page === 'categories') {
            handleOpenCategoriesTab();
          }
        }}
        onSelectCategory={(catId) => handleSelectCategory(catId)}
        onSelectProduct={(prodId) => {
          const prod = products.find((p) => p.id === prodId);
          if (prod) setSelectedProduct(prod);
        }}
        onOpenPolicy={(policyKey) => {
          setSelectedPolicyKey(policyKey);
          setIsPoliciesOpen(true);
        }}
      />

      {/* Fly-to-Cart 60fps Dynamic Particle Overlay */}
      <FlyToCartOverlay />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ai') {
            setIsAIOpen(true);
          } else if (tab === 'cart') {
            handleOpenCart();
          } else if (tab === 'categories') {
            handleOpenCategoriesTab();
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
      />
    </div>
  );
}

export function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}


export default App;
