import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  UserProfile, 
  Address, 
  Order, 
  CartItem, 
  NotificationItem, 
  Product, 
  Category,
  Brand,
  CurrencyCode, 
  ExchangeRates, 
  RegionType, 
  Coupon, 
  AppSettings,
  PaymentMethodType, 
  OrderStatus,
  FooterConfig,
  Review
} from '../types';
import { 
  getStoredExchangeRates, 
  saveStoredExchangeRates, 
  getStoredCurrency, 
  saveStoredCurrency, 
  convertFromBaseYER, 
  formatPriceWithCurrency, 
  getRegionFromCity 
} from '../services/currencyService';
import { calculateDeliveryFee } from '../services/deliveryService';
import { 
  PRODUCTS, 
  CATEGORIES, 
  NOTIFICATIONS,
  DEFAULT_BANNERS,
  DEFAULT_POPUP_OFFER,
  DEFAULT_POLICIES,
  DEFAULT_SOCIAL_CHANNELS,
  DEFAULT_BRANCHES,
  DEFAULT_FOOTER_CONFIG
} from '../data/mockData';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc 
} from 'firebase/firestore';
import { 
  db,
  sanitizeForFirestore,
  firebaseAuthService, 
  firestoreCatalogService, 
  firestoreUserService, 
  firestoreOrderService, 
  firestoreConfigService,
  firestoreSettingsService,
  firestoreFooterService,
  firestoreReviewService,
  isFirebaseConfigured,
  isOfflineError
} from '../services/firebase';
import { cacheService, CacheKeys } from '../services/cacheService';

const DEFAULT_APP_SETTINGS: AppSettings = {
  featuredCouponCode: 'DAJJAH10',
  promoBannerText: 'توصيل فوري مجاني ومعاينة عند الاستلام في كافة المحافظات اليمنية',
  isPromoBannerActive: true,
  contactPhone: '+967 777 123 456',
  contactWhatsapp: '+967 777 123 456',
  contactEmail: 'support@dajjahmall.ye',
  storeAddress: 'اليمن — صنعاء (شارع حدة) • عدن (المنصورة)',
  contactAddress: 'صنعاء — شارع حدة / عدن — المنصورة',
  supportHours: '24 ساعة على مدار الأسبوع',
  workingHours: 'خدمة العملاء متوفرة 24/7 على مدار الساعة',
  banners: DEFAULT_BANNERS,
  popupOffer: DEFAULT_POPUP_OFFER,
  policies: DEFAULT_POLICIES,
  socialChannels: DEFAULT_SOCIAL_CHANNELS,
  branches: DEFAULT_BRANCHES,
  footerConfig: DEFAULT_FOOTER_CONFIG,
  homePromoButtons: {
    button1: {
      id: 'flash_sale',
      title: 'عروض اليوم المخفضة',
      titleEn: 'Daily Deals',
      subtitle: 'خصومات مختارة لفترة محدودة',
      subtitleEn: 'Limited Deals',
      linkType: 'deals',
      linkTarget: 'all',
      icon: 'Zap',
      buttonSize: 'small',
      styleVariant: 'amber',
      isActive: true,
    },
    button2: {
      id: 'free_shipping',
      title: 'شحن مجاني للمحافظات',
      titleEn: 'Free Shipping',
      subtitle: 'للطلبات فوق 30,000 ر.ي',
      subtitleEn: 'Free Delivery',
      linkType: 'page',
      linkTarget: 'cart',
      icon: 'Truck',
      buttonSize: 'small',
      styleVariant: 'default',
      isActive: true,
    },
  },
};

const AVAILABLE_COUPONS: Record<string, Coupon> = {
  'DAJJAH10': {
    code: 'DAJJAH10',
    discountType: 'percentage',
    discountValue: 10,
    description: 'خصم 10% ترحيبي على كامل الطلب',
    isActive: true,
    showInTopBanner: true,
  },
  'YEMEN2026': {
    code: 'YEMEN2026',
    discountType: 'percentage',
    discountValue: 15,
    minOrderBaseYER: 20000,
    description: 'خصم 15% للطلبات فوق 20,000 ريال',
    isActive: true,
  },
  'FREE_DELIVERY': {
    code: 'FREE_DELIVERY',
    discountType: 'fixed',
    discountValue: 0,
    description: 'توصيل مجاني لكافة المحافظات اليمنية',
    isActive: true,
  },
};

interface MarketplaceContextType {
  currentUser: UserProfile | null;
  isAuthLoading: boolean;
  users: UserProfile[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  activeBrands: Brand[];
  isAdmin: boolean;
  currentCurrency: CurrencyCode;
  currencyRates: ExchangeRates;
  currentRegion: RegionType;
  cart: CartItem[];
  favorites: string[];
  wishlist: string[];
  orders: Order[];
  addresses: Address[];
  selectedAddress: Address | null;
  notifications: NotificationItem[];
  activeCoupon: Coupon | null;
  coupons: Coupon[];
  appSettings: AppSettings;
  footerConfig: FooterConfig;
  isBackendConnected: boolean;
  
  // Actions
  setCurrentCurrency: (currency: CurrencyCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  updateCurrencyRates: (newRates: ExchangeRates) => void;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;
  updateFooterConfig: (newFooterConfig: Partial<FooterConfig>) => Promise<void>;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  toggleCouponActive: (code: string) => void;
  setFeaturedCoupon: (code: string) => void;
  formatPrice: (amountBaseYER: number, options?: { showSymbol?: boolean; detailedLabel?: boolean }) => string;
  convertPrice: (amountBaseYER: number) => number;
  
  // User Authentication & Management
  loginUser: (phone: string, name?: string, city?: string) => Promise<void>;
  login: (phone: string, name?: string, city?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string, city: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Admin Catalog Management Actions
  addProduct: (product: Product) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, newStock: number) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (brandData: Omit<Brand, 'id' | 'createdAt'> & { id?: string }) => Promise<Brand>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  toggleBrandActive: (id: string) => Promise<void>;
  getProductsByBrand: (brandId: string) => Product[];

  // Cart Actions
  addToCart: (
    product: Product,
    optionsOrQty?: number | { color?: string; size?: string; quantity?: number },
    color?: string,
    size?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Favorites Actions
  toggleFavorite: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  
  // Address Actions
  addOrUpdateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setSelectedAddress: (address: Address | null) => void;
  
  // Coupon Actions
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Order Actions
  calculateCheckoutTotals: () => {
    subtotalBaseYER: number;
    discountBaseYER: number;
    deliveryFeeBaseYER: number;
    totalBaseYER: number;
    isDeliveryFree: boolean;
    estimatedDeliveryText: string;
    subtotalInActiveCurrency: number;
    discountInActiveCurrency: number;
    deliveryFeeInActiveCurrency: number;
    totalInActiveCurrency: number;
  };
  createOrder: (orderData: {
    paymentMethod: PaymentMethodType;
    shippingAddress: Address;
    notes?: string;
    transferReference?: string;
    giftOrder?: {
      isGift: boolean;
      recipientName: string;
      recipientPhone: string;
      giftMessage?: string;
      hidePrice?: boolean;
    };
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  cancelCustomerOrder: (orderId: string) => Promise<void>;
  
  // Reviews & Rating System
  hasUserPurchasedProduct: (productId: string) => boolean;
  submitProductReview: (
    productId: string,
    rating: number,
    comment: string,
    images?: string[]
  ) => Promise<{ success: boolean; message: string; review?: Review }>;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products & Categories & Brands from Cloud Firestore (instant memory/local cache)
  const [products, setProducts] = useState<Product[]>(() => {
    return cacheService.get<Product[]>(CacheKeys.PRODUCTS) || PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    return cacheService.get<Category[]>(CacheKeys.CATEGORIES) || CATEGORIES;
  });
  const [brands, setBrands] = useState<Brand[]>(() => {
    return cacheService.get<Brand[]>(CacheKeys.BRANDS) || [];
  });
  const activeBrands = useMemo(() => brands.filter((b) => b.isActive), [brands]);

  // Current logged in user (strictly null by default, 100% managed by Firebase Auth)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Currency & Rates State
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyCode>(getStoredCurrency);
  const [currencyRates, setCurrencyRates] = useState<ExchangeRates>(() => {
    return cacheService.get<ExchangeRates>(CacheKeys.RATES) || getStoredExchangeRates();
  });

  // User-isolated state (guest persistence fallback)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dajjah_guest_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dajjah_guest_favs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS || []);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('dajjah_coupons_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return Object.values(AVAILABLE_COUPONS);
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const cached = cacheService.get<AppSettings>(CacheKeys.SETTINGS);
    if (cached) return { ...DEFAULT_APP_SETTINGS, ...cached };
    try {
      const saved = localStorage.getItem('dajjah_app_settings_v2');
      if (saved) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_APP_SETTINGS;
  });
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    try {
      const saved = localStorage.getItem('dajjah_footer_config_v1');
      if (saved) return { ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_FOOTER_CONFIG;
  });
  const isBackendConnected = isFirebaseConfigured;

  // 1. Initial Load of Catalog and Currency Config from Firestore with Stale-While-Revalidate
  useEffect(() => {
    let isMounted = true;

    // Background live subscriptions (they push initial data + live updates in 1 call, avoiding duplicate reads)
    const unsubProducts = firestoreCatalogService.subscribeToProducts((newProds) => {
      if (isMounted && newProds && newProds.length > 0) {
        setProducts(newProds);
        cacheService.set(CacheKeys.PRODUCTS, newProds);
      }
    });

    const unsubCategories = firestoreCatalogService.subscribeToCategories((newCats) => {
      if (isMounted && newCats && newCats.length > 0) {
        setCategories(newCats);
        cacheService.set(CacheKeys.CATEGORIES, newCats);
      }
    });

    const unsubBrands = firestoreCatalogService.subscribeToBrands((newBrands) => {
      if (isMounted) {
        setBrands(newBrands || []);
        cacheService.set(CacheKeys.BRANDS, newBrands || []);
      }
    });

    const unsubSettings = firestoreSettingsService.subscribeToSettings((newSettings) => {
      if (isMounted && newSettings) {
        setAppSettings((prev) => {
          const merged = { ...prev, ...newSettings };
          cacheService.set(CacheKeys.SETTINGS, merged);
          return merged;
        });
      }
    });

    const unsubFooter = firestoreFooterService.subscribeToFooterConfig((newFooterConfig) => {
      if (isMounted && newFooterConfig) {
        setFooterConfig(newFooterConfig);
        try {
          localStorage.setItem('dajjah_footer_config_v1', JSON.stringify(newFooterConfig));
        } catch {}
        setAppSettings((prev) => ({
          ...prev,
          footerConfig: newFooterConfig,
        }));
      }
    });

    // Fast background exchange rates check
    firestoreConfigService.getCurrencyRates().then((cloudRates) => {
      if (isMounted && cloudRates) {
        setCurrencyRates(cloudRates);
        cacheService.set(CacheKeys.RATES, cloudRates);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
      unsubProducts();
      unsubCategories();
      unsubBrands();
      unsubSettings();
      unsubFooter();
    };
  }, []);

  // 2. Real Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuth(async (fbUser) => {
      if (fbUser) {
        // Real authenticated user detected in Firebase
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          let profile: UserProfile;

          const isOwnerEmail = fbUser.email?.toLowerCase().trim() === 'nsralnaty93@gmail.com';

          if (snap.exists()) {
            profile = snap.data() as UserProfile;
            if (isOwnerEmail && profile.role !== 'admin') {
              profile.role = 'admin';
              profile.memberTier = 'مالك التطبيق — Admin';
              await updateDoc(userDocRef, { role: 'admin', memberTier: 'مالك التطبيق — Admin' }).catch(() => {});
            }
          } else {
            const region = getRegionFromCity('صنعاء');
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || (isOwnerEmail ? 'ناصر العناتي (المالك)' : 'مستخدم ضَجّة مول'),
              phone: fbUser.phoneNumber || '',
              email: fbUser.email || '',
              avatarUrl: fbUser.photoURL || undefined,
              city: 'صنعاء',
              preferredRegion: region,
              preferredCurrency: 'YER_NORTH',
              walletBalanceYER: 10000,
              points: 200,
              memberTier: isOwnerEmail ? 'مالك التطبيق — Admin' : 'عضو فضي',
              role: isOwnerEmail ? 'admin' : 'customer',
              savedAddresses: [],
              favoriteProductIds: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, sanitizeForFirestore(profile));
          }

          setCurrentUser(profile);

          // Fetch user-specific cloud data
          const [userAddrs, userCart, userFavs, userOrders] = await Promise.all([
            firestoreUserService.getAddresses(fbUser.uid).catch(() => []),
            firestoreUserService.getCart(fbUser.uid).catch(() => []),
            firestoreUserService.getFavorites(fbUser.uid).catch(() => []),
            firestoreOrderService.getUserOrders(fbUser.uid).catch(() => []),
          ]);

          let finalCart = (userCart && userCart.length > 0) ? userCart : [];
          try {
            const guestCartSaved = localStorage.getItem('dajjah_guest_cart');
            if (guestCartSaved) {
              const guestItems: CartItem[] = JSON.parse(guestCartSaved);
              if (guestItems && guestItems.length > 0) {
                const map = new Map<string, CartItem>();
                finalCart.forEach((item) => map.set(`${item.id}_${item.selectedSize || ''}_${item.selectedColor || ''}`, item));
                guestItems.forEach((gItem) => {
                  const key = `${gItem.id}_${gItem.selectedSize || ''}_${gItem.selectedColor || ''}`;
                  if (map.has(key)) {
                    const ex = map.get(key)!;
                    map.set(key, { ...ex, quantity: ex.quantity + gItem.quantity });
                  } else {
                    map.set(key, gItem);
                  }
                });
                finalCart = Array.from(map.values());
                localStorage.removeItem('dajjah_guest_cart');
                firestoreUserService.saveCart(fbUser.uid, finalCart).catch(() => {});
              }
            }
          } catch {}

          setCart(finalCart);
          if (userFavs && userFavs.length > 0) setFavorites(userFavs);
          if (userOrders && userOrders.length > 0) setOrders(userOrders);
          
          if (userAddrs && userAddrs.length > 0) {
            setAddresses(userAddrs);
            setSelectedAddress(userAddrs.find((a) => a.isDefault) || userAddrs[0] || null);
          } else if (profile.savedAddresses && profile.savedAddresses.length > 0) {
            setAddresses(profile.savedAddresses);
            setSelectedAddress(profile.savedAddresses.find((a) => a.isDefault) || profile.savedAddresses[0] || null);
          } else {
            setAddresses([]);
            setSelectedAddress(null);
          }

          lastLoadedUserIdRef.current = fbUser.uid;
        } catch (e) {
          if (!isOfflineError(e)) {
            console.warn('Notice syncing user data with Cloud Firestore:', e);
          }
        }
      } else {
        // Visitor is not logged in / Guest mode: retain guest cart and favorites
        lastLoadedUserIdRef.current = null;
        setCurrentUser(null);
        setAddresses([]);
        setSelectedAddress(null);
        try {
          const guestCart = localStorage.getItem('dajjah_guest_cart');
          setCart(guestCart ? JSON.parse(guestCart) : []);
          const guestFavs = localStorage.getItem('dajjah_guest_favs');
          setFavorites(guestFavs ? JSON.parse(guestFavs) : []);
        } catch {
          setCart([]);
          setFavorites([]);
        }
        setOrders([]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. User Data synchronization when currentUser changes
  useEffect(() => {
    if (!currentUser?.id) return;
    if (lastLoadedUserIdRef.current === currentUser.id) return;
    lastLoadedUserIdRef.current = currentUser.id;

    try {
      firestoreUserService.getCart(currentUser.id).then((cloudCart) => {
        if (cloudCart && cloudCart.length > 0) {
          setCart(cloudCart);
        }
      }).catch((err) => {
        if (!isOfflineError(err)) console.warn('User cart load notice:', err);
      });

      firestoreUserService.getFavorites(currentUser.id).then((cloudFavs) => {
        if (cloudFavs && cloudFavs.length > 0) {
          setFavorites(cloudFavs);
        }
      }).catch((err) => {
        if (!isOfflineError(err)) console.warn('User favorites load notice:', err);
      });

      firestoreOrderService.getUserOrders(currentUser.id).then((cloudOrders) => {
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }
      }).catch((err) => {
        if (!isOfflineError(err)) console.warn('User orders load notice:', err);
      });

      const userAddrs = currentUser.savedAddresses || [];
      if (userAddrs.length > 0) {
        setAddresses(userAddrs);
        setSelectedAddress(userAddrs.find((a) => a.isDefault) || userAddrs[0] || null);
      }
    } catch (e) {
      console.error('Error switching user state:', e);
    }
  }, [currentUser?.id]);

  // Persist cart to Firestore & local cache (guest and logged-in accounts)
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`dajjah_cart_${currentUser.id}`, JSON.stringify(cart));
      const handler = setTimeout(() => {
        firestoreUserService.saveCart(currentUser.id, cart).catch(() => {});
      }, 500);
      return () => clearTimeout(handler);
    } else {
      localStorage.setItem('dajjah_guest_cart', JSON.stringify(cart));
    }
  }, [cart, currentUser?.id]);

  // Persist favorites to Firestore & local cache
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`dajjah_favs_${currentUser.id}`, JSON.stringify(favorites));
      const handler = setTimeout(() => {
        firestoreUserService.saveFavorites(currentUser.id, favorites).catch(() => {});
      }, 500);
      return () => clearTimeout(handler);
    } else {
      localStorage.setItem('dajjah_guest_favs', JSON.stringify(favorites));
    }
  }, [favorites, currentUser?.id]);

  // Currency Handlers (memoized with useCallback to prevent child re-renders)
  const setCurrentCurrency = useCallback((currency: CurrencyCode) => {
    setCurrentCurrencyState(currency);
    saveStoredCurrency(currency);
  }, []);

  const updateCurrencyRates = useCallback(async (newRates: ExchangeRates) => {
    setCurrencyRates(newRates);
    saveStoredExchangeRates(newRates);
    try {
      await firestoreConfigService.saveCurrencyRates(newRates);
    } catch (err) {
      console.error('Error saving exchange rates to Firestore:', err);
    }
  }, []);

  const formatPrice = useCallback((amountBaseYER: number, options?: { showSymbol?: boolean; detailedLabel?: boolean }) => {
    return formatPriceWithCurrency(amountBaseYER, currentCurrency, currencyRates, options);
  }, [currentCurrency, currencyRates]);

  const convertPrice = useCallback((amountBaseYER: number) => {
    return convertFromBaseYER(amountBaseYER, currentCurrency, currencyRates);
  }, [currentCurrency, currencyRates]);

  const currentRegion: RegionType = selectedAddress?.region || (currentUser?.preferredRegion ?? 'north');

  // User Actions
  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await firebaseAuthService.loginWithEmail(email, pass);
    setCurrentUser(profile);
    return profile;
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    phone: string, 
    city: string
  ): Promise<UserProfile> => {
    const profile = await firebaseAuthService.registerWithEmail(email, pass, name, phone, city);
    setCurrentUser(profile);
    return profile;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const profile = await firebaseAuthService.loginWithGoogle();
    setCurrentUser(profile);
    return profile;
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await firebaseAuthService.sendPasswordReset(email);
  };

  const loginUser = async (phone: string, name?: string, city?: string) => {
    const existing = users.find((u) => u.phone === phone);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const region = getRegionFromCity(city || 'صنعاء');
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name || 'عميل جديد',
        phone,
        email: `${phone}@dajjahmall.ye`,
        city: city || 'صنعاء',
        preferredRegion: region,
        preferredCurrency: region === 'south' ? 'YER_SOUTH' : 'YER_NORTH',
        walletBalanceYER: 10000,
        points: 200,
        memberTier: 'عضو فضي',
        role: 'customer',
        savedAddresses: [
          {
            id: `addr-${Date.now()}`,
            title: 'المنزل',
            recipientName: name || 'عميل جديد',
            phone,
            city: city || 'صنعاء',
            district: 'وسط المدينة',
            street: 'الشارع الرئيسي',
            region,
            isDefault: true,
          },
        ],
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);

      // Async sync with Firebase Auth
      try {
        await firebaseAuthService.quickPhoneAuth(phone, name, city);
      } catch (err) {
        console.error('Firebase phone auth sync notice:', err);
      }
    }
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    setCart([]);
    setFavorites([]);
    setOrders([]);
    setAddresses([]);
    setSelectedAddress(null);
    try {
      await firebaseAuthService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Cart Actions (memoized to preserve child React.memo stability)
  const addToCart = useCallback((
    product: Product,
    optionsOrQty?: number | { color?: string; size?: string; quantity?: number },
    color?: string,
    size?: string
  ) => {
    if (!product) return;
    let quantity = 1;
    let selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0]?.name : '');
    let selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');

    if (typeof optionsOrQty === 'number') {
      quantity = optionsOrQty;
    } else if (typeof optionsOrQty === 'object' && optionsOrQty !== null) {
      if (optionsOrQty.quantity !== undefined) quantity = optionsOrQty.quantity;
      if (optionsOrQty.color !== undefined) selectedColor = optionsOrQty.color;
      if (optionsOrQty.size !== undefined) selectedSize = optionsOrQty.size;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product?.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        quantity,
        selectedColor: selectedColor || '',
        selectedSize: selectedSize || '',
        priceYER: product.priceYER || 0,
      };
      return [newItem, ...prev];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Favorites Actions
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  // Address Actions
  const addOrUpdateAddress = (newAddr: Address) => {
    setAddresses((prev) => {
      let updated: Address[];
      const exists = prev.some((a) => a.id === newAddr.id);

      if (newAddr.isDefault) {
        const unDefaulted = prev.map((a) => ({ ...a, isDefault: false }));
        updated = exists
          ? unDefaulted.map((a) => (a.id === newAddr.id ? newAddr : a))
          : [newAddr, ...unDefaulted];
      } else {
        updated = exists
          ? prev.map((a) => (a.id === newAddr.id ? newAddr : a))
          : [newAddr, ...prev];
      }

      if (currentUser) {
        updateUserProfile({ savedAddresses: updated });
        firestoreUserService.saveAddress(currentUser.id, newAddr);
      }

      if (newAddr.isDefault || !selectedAddress) {
        setSelectedAddress(newAddr);
      }

      return updated;
    });
  };

  const deleteAddress = (addressId: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== addressId);
      if (currentUser) {
        updateUserProfile({ savedAddresses: filtered });
        firestoreUserService.deleteAddress(currentUser.id, addressId);
      }
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(filtered[0] || null);
      }
      return filtered;
    });
  };

  // App Settings Management
  const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
    setAppSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('dajjah_app_settings_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newSettings.footerConfig) {
      setFooterConfig(newSettings.footerConfig);
      try {
        localStorage.setItem('dajjah_footer_config_v1', JSON.stringify(newSettings.footerConfig));
      } catch {}
      firestoreFooterService.saveFooterConfig(newSettings.footerConfig).catch(() => {});
    }

    try {
      await firestoreSettingsService.saveSettings(newSettings);
    } catch (err) {
      console.error('Error saving app settings to Firestore:', err);
    }
  };

  // Footer Config Management (Dynamic Firestore Collection: footer_config)
  const updateFooterConfig = async (newFooterConfig: Partial<FooterConfig>) => {
    const updated: FooterConfig = {
      ...footerConfig,
      ...newFooterConfig,
    };
    setFooterConfig(updated);
    try {
      localStorage.setItem('dajjah_footer_config_v1', JSON.stringify(updated));
    } catch {}

    setAppSettings((prev) => ({
      ...prev,
      footerConfig: updated,
    }));

    try {
      await firestoreFooterService.saveFooterConfig(updated);
      await firestoreSettingsService.saveSettings({ footerConfig: updated });
    } catch (err) {
      console.error('Error saving footer config to Firestore footer_config collection:', err);
    }
  };

  // Coupons Management
  const saveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const index = prev.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
      let updated: Coupon[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = coupon;
      } else {
        updated = [coupon, ...prev];
      }
      try {
        localStorage.setItem('dajjah_coupons_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (coupon.showInTopBanner) {
      updateAppSettings({ featuredCouponCode: coupon.code });
    }
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
      try {
        localStorage.setItem('dajjah_coupons_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activeCoupon?.code.toUpperCase() === code.toUpperCase()) {
      setActiveCoupon(null);
    }
  };

  const toggleCouponActive = (code: string) => {
    setCoupons((prev) => {
      const updated = prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase() ? { ...c, isActive: !c.isActive } : c
      );
      try {
        localStorage.setItem('dajjah_coupons_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setFeaturedCoupon = (code: string) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => ({
        ...c,
        showInTopBanner: c.code.toUpperCase() === code.toUpperCase(),
      }));
      try {
        localStorage.setItem('dajjah_coupons_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    updateAppSettings({ featuredCouponCode: code });
  };

  // Coupons
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const upper = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === upper) || AVAILABLE_COUPONS[upper];

    if (!found || !found.isActive) {
      return { success: false, message: 'كوبون الخصم غير صالح أو منتهي الصلاحية' };
    }

    const totals = calculateCheckoutTotals();
    if (found.minOrderBaseYER && totals.subtotalBaseYER < found.minOrderBaseYER) {
      return {
        success: false,
        message: `هذا الكوبون يتطلب طلباً بقيمة ${formatPrice(found.minOrderBaseYER)} كحد أدنى`,
      };
    }

    setActiveCoupon(found);
    return { success: true, message: `تم تفعيل الكوبون (${found.code}) بنجاح!` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Authoritative Checkout Totals Calculation (strict catalog verification)
  const calculateCheckoutTotals = () => {
    // Validate and derive authoritative price strictly from product catalog to prevent price tampering
    const subtotalBaseYER = cart.reduce((sum, item) => {
      const catalogProd = products.find((p) => p.id === item.product.id) || products.find((p) => p.id === item.id);
      const verifiedPrice = (catalogProd?.priceYER && catalogProd.priceYER > 0)
        ? catalogProd.priceYER
        : (item.product.priceYER || 0);
      return sum + verifiedPrice * Math.max(1, item.quantity);
    }, 0);

    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    let couponDiscountBaseYER = 0;
    const isFreeDeliveryCoupon = activeCoupon?.code === 'FREE_DELIVERY';

    if (activeCoupon && !isFreeDeliveryCoupon) {
      if (activeCoupon.discountType === 'percentage') {
        couponDiscountBaseYER = Math.round((subtotalBaseYER * activeCoupon.discountValue) / 100);
      } else {
        couponDiscountBaseYER = activeCoupon.discountValue;
      }
      if (activeCoupon.maxDiscountBaseYER && couponDiscountBaseYER > activeCoupon.maxDiscountBaseYER) {
        couponDiscountBaseYER = activeCoupon.maxDiscountBaseYER;
      }
    }

    // Volume Discounts calculation from appSettings
    let volumeDiscountBaseYER = 0;
    if (appSettings.volumeDiscounts && appSettings.volumeDiscounts.length > 0) {
      const activeRules = appSettings.volumeDiscounts
        .filter((r) => r.isActive && totalItemCount >= r.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity);

      if (activeRules.length > 0) {
        const bestRule = activeRules[0];
        const pct = bestRule.discountPercentage || (bestRule as any).discountValue || 0;
        volumeDiscountBaseYER = Math.round((subtotalBaseYER * pct) / 100);
      }
    }

    const discountBaseYER = couponDiscountBaseYER + volumeDiscountBaseYER;

    const deliveryResult = calculateDeliveryFee(subtotalBaseYER, selectedAddress, isFreeDeliveryCoupon, appSettings.shippingZones);
    const deliveryFeeBaseYER = deliveryResult.feeBaseYER;
    const totalBaseYER = Math.max(0, subtotalBaseYER - discountBaseYER + deliveryFeeBaseYER);

    return {
      subtotalBaseYER,
      discountBaseYER,
      volumeDiscountBaseYER,
      couponDiscountBaseYER,
      deliveryFeeBaseYER,
      totalBaseYER,
      isDeliveryFree: deliveryResult.isFree,
      estimatedDeliveryText: deliveryResult.estimatedDuration,
      subtotalInActiveCurrency: convertFromBaseYER(subtotalBaseYER, currentCurrency, currencyRates),
      discountInActiveCurrency: convertFromBaseYER(discountBaseYER, currentCurrency, currencyRates),
      deliveryFeeInActiveCurrency: convertFromBaseYER(deliveryFeeBaseYER, currentCurrency, currencyRates),
      totalInActiveCurrency: convertFromBaseYER(totalBaseYER, currentCurrency, currencyRates),
    };
  };

  // Order Creation (tamper-proof, stock-checked, atomic)
  const createOrder = async (orderData: {
    paymentMethod: PaymentMethodType;
    shippingAddress: Address;
    notes?: string;
    transferReference?: string;
    giftOrder?: {
      isGift: boolean;
      recipientName: string;
      recipientPhone: string;
      giftMessage?: string;
      hidePrice?: boolean;
    };
  }): Promise<Order> => {
    // 1. Enforce authentication: Guest must be logged in to create an order
    if (!currentUser?.id) {
      throw new Error('يرجى تسجيل الدخول أو إنشاء حساب لإتمام وحفظ طلبك بأمان.');
    }

    if (cart.length === 0) {
      throw new Error('سلة التسوق فارغة.');
    }

    // 2. Validate inventory stock against live catalog
    for (const cartItem of cart) {
      const catalogProd = products.find((p) => p.id === cartItem.product.id) || products.find((p) => p.id === cartItem.id);
      if (!catalogProd) {
        throw new Error(`المنتج "${cartItem.product.name}" غير متوفر حالياً في كتالوج المتجر.`);
      }
      if (typeof catalogProd.stock === 'number' && catalogProd.stock < cartItem.quantity) {
        throw new Error(`عذراً، الكمية المتوفرة من "${catalogProd.name}" بالمخزون هي (${catalogProd.stock}) قطعة فقط ولا تكفي للطلب (${cartItem.quantity}).`);
      }
    }

    const totals = calculateCheckoutTotals();
    const orderId = `DJ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Build verified order items strictly from catalog authoritative data
    const verifiedItems = cart.map((item) => {
      const catalogProd = products.find((p) => p.id === item.product.id) || products.find((p) => p.id === item.id);
      const verifiedPrice = (catalogProd?.priceYER && catalogProd.priceYER > 0)
        ? catalogProd.priceYER
        : item.product.priceYER;
      return {
        ...item,
        product: {
          ...item.product,
          priceYER: verifiedPrice,
        },
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      };
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderId,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      items: verifiedItems,
      subtotalYER: totals.subtotalBaseYER,
      discountYER: totals.discountBaseYER,
      shippingFeeYER: totals.deliveryFeeBaseYER,
      totalYER: totals.totalBaseYER,
      currency: currentCurrency,
      exchangeRateUsed: currencyRates[currentCurrency] || 1.0,
      totalInPaidCurrency: totals.totalInActiveCurrency,
      status: 'received',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentReference: orderData.transferReference?.trim() || null,
      isPaymentVerified: orderData.paymentMethod === 'cash_on_delivery',
      estimatedDelivery: totals.estimatedDeliveryText,
      trackingNumber: `TRK-${orderId}`,
      giftDetails: orderData.giftOrder ? {
        isGift: orderData.giftOrder.isGift,
        recipientName: orderData.giftOrder.recipientName,
        recipientPhone: orderData.giftOrder.recipientPhone,
        giftMessage: orderData.giftOrder.giftMessage,
        hidePriceFromInvoice: orderData.giftOrder.hidePrice
      } : undefined,
      courier: {
        name: 'عمار الحميدي (مندوب معتمد)',
        phone: '775889900',
        vehicle: 'دراجة نارية سريعة',
        estimatedMinutes: 45,
      },
      notes: orderData.notes?.trim() || '',
      couponCode: activeCoupon?.code || null,
      timeline: [
        {
          status: 'received',
          label: 'تم استلام الطلب',
          description: 'تم تسجيل طلبك في نظام ضَجّة مول وتأكيد العنوان',
          time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          current: true,
        },
        {
          status: 'processing',
          label: 'جاري التجهيز والتغليف',
          description: 'يقوم متجر ضَجّة بفحص وتغليف المنتجات',
          completed: false,
          current: false,
        },
        {
          status: 'out_for_delivery',
          label: 'خرج للتوصيل مع المندوب',
          description: 'الشحنة في طريقها مع مندوب التوصيل السريع',
          completed: false,
          current: false,
        },
        {
          status: 'delivered',
          label: 'تم التسليم بنجاح',
          description: 'استلام المنتجات والتوقيع على الإيصال',
          completed: false,
          current: false,
        },
      ],
    };

    // 3. Save to Cloud Firestore FIRST - if it fails, throw error and do NOT show fake success!
    await firestoreOrderService.createOrder(newOrder);

    // 4. Update local state and inventory after successful save
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      if (currentUser?.id) {
        localStorage.setItem(`dajjah_orders_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Deduct inventory stock for purchased items in local state
    setProducts((prev) =>
      prev.map((p) => {
        const itemInCart = cart.find((c) => c.product.id === p.id || c.id === p.id);
        if (itemInCart && typeof p.stock === 'number') {
          return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
        }
        return p;
      })
    );

    clearCart();
    setActiveCoupon(null);

    // Push notification
    const orderNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: `تم تأكيد طلبك بنجاح (${orderId})`,
      message: `طلبك بقيمة ${formatPrice(newOrder.totalYER)} قيد التجهيز الآن وسيصلك إلى ${orderData.shippingAddress.city}.`,
      date: 'الآن',
      time: 'الآن',
      category: 'orders',
      type: 'order',
      isRead: false,
      orderId: orderId,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [orderNotification, ...prev]);

    return newOrder;
  };

  // Customer order cancellation with strict lifecycle guard
  const cancelCustomerOrder = async (orderId: string): Promise<void> => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) {
      throw new Error('الطلب غير موجود في النظام.');
    }
    if (existing.status !== 'received') {
      throw new Error('لا يمكن إلغاء الطلب لأنه بدأ بالفعل في مرحلة التجهيز أو الشحن أو تم تسليمه.');
    }
    if (!currentUser?.id) {
      throw new Error('يجب تسجيل الدخول لإلغاء الطلب.');
    }

    await firestoreOrderService.cancelCustomerOrder(orderId, currentUser.id);

    // Restore stock in local state
    setProducts((prev) =>
      prev.map((p) => {
        const itemInOrder = existing.items.find((item) => item.product?.id === p.id || item.id === p.id);
        if (itemInOrder && typeof p.stock === 'number') {
          return { ...p, stock: p.stock + itemInOrder.quantity };
        }
        return p;
      })
    );

    // Update order in state
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedTimeline = ord.timeline.map((step) => {
          if (step.status === 'received') {
            return { ...step, description: 'تم إلغاء الطلب بناءً على رغبة العميل' };
          }
          return { ...step, current: false };
        });
        return {
          ...ord,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!isAdmin && newStatus !== 'cancelled') {
      throw new Error('فقط مدير المتجر يمكنه تعديل مراحل الطلب والتوصيل.');
    }
    if (!isAdmin && newStatus === 'cancelled') {
      return cancelCustomerOrder(orderId);
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedTimeline = ord.timeline.map((step) => {
          if (step.status === newStatus) {
            return { ...step, completed: true, current: true, time: 'الآن' };
          }
          return { ...step, current: false };
        });

        return {
          ...ord,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );

    try {
      await firestoreOrderService.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Firestore update order status notice:', err);
      throw err;
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Check if current user is owner / admin
  const isAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase().trim() === 'nsralnaty93@gmail.com'
  );

  // Admin Actions for Products & Categories
  const addProduct = async (productData: Product): Promise<Product> => {
    const saved = await firestoreCatalogService.addProduct(productData);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    await firestoreCatalogService.updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await firestoreCatalogService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProductStock = async (id: string, newStock: number): Promise<void> => {
    await firestoreCatalogService.updateProductStock(id, newStock);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  const saveCategory = async (category: Category): Promise<void> => {
    await firestoreCatalogService.saveCategory(category);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = category;
        return next;
      }
      return [...prev, category];
    });
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const existing = categories.find((c) => c.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    await saveCategory(merged);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await firestoreCatalogService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Brand Management Actions (Independent from Categories)
  const addBrand = async (brandData: Omit<Brand, 'id' | 'createdAt'> & { id?: string }): Promise<Brand> => {
    const newBrand: Brand = {
      ...brandData,
      id: brandData.id || `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    await firestoreCatalogService.saveBrand(newBrand);
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === newBrand.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newBrand;
        return next;
      }
      return [newBrand, ...prev];
    });
    return newBrand;
  };

  const updateBrand = async (id: string, updates: Partial<Brand>): Promise<void> => {
    const existing = brands.find((b) => b.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await firestoreCatalogService.saveBrand(updated);
    setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const deleteBrand = async (id: string): Promise<void> => {
    await firestoreCatalogService.deleteBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBrandActive = async (id: string): Promise<void> => {
    const existing = brands.find((b) => b.id === id);
    if (!existing) return;
    const updated = { ...existing, isActive: !existing.isActive };
    await firestoreCatalogService.saveBrand(updated);
    setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const getProductsByBrand = (brandId: string): Product[] => {
    return products.filter((p) => p.brandId === brandId);
  };

  // Check if current user has purchased a product
  const hasUserPurchasedProduct = useCallback((productId: string): boolean => {
    if (!currentUser) return false;
    return orders.some((order) => {
      const isUserOrder = order.userId === currentUser.id || !order.userId || order.userId === 'guest';
      if (!isUserOrder) return false;
      return order.items && order.items.some((item) => {
        const itemId = item.product?.id || item.productId || item.id;
        return itemId === productId;
      });
    });
  }, [orders, currentUser]);

  // Submit verified product rating and review
  const submitProductReview = useCallback(async (
    productId: string,
    rating: number,
    comment: string,
    images?: string[]
  ): Promise<{ success: boolean; message: string; review?: Review }> => {
    if (!currentUser) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً لتتمكن من تقييم المنتج' };
    }

    const purchased = hasUserPurchasedProduct(productId);
    if (!purchased && !isAdmin) {
      return {
        success: false,
        message: 'عذراً، التقييم متاح فقط للعملاء الذين اشتروا هذا المنتج سابقاً لضمان مصداقية التقييمات.',
      };
    }

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return { success: false, message: 'المنتج غير موجود' };
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReview: Review = {
      id: reviewId,
      userName: currentUser.name || 'عميل موثق',
      userAvatar: currentUser.avatarUrl || '',
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      date: 'اليوم',
      comment: comment.trim(),
      verifiedPurchase: true,
      images: images || [],
    };

    const prevReviews = targetProduct.reviews || [];
    const nextReviews = [newReview, ...prevReviews];
    const totalScore = nextReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const newRating = Number((totalScore / nextReviews.length).toFixed(1));
    const newReviewCount = nextReviews.length;

    // Update in memory & state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              rating: newRating,
              reviewCount: newReviewCount,
              reviews: nextReviews,
            }
          : p
      )
    );

    // Sync to Firestore
    try {
      await firestoreReviewService.addReview({
        productId,
        productName: targetProduct.name,
        productImage: targetProduct.images?.[0] || '',
        userId: currentUser.id,
        userName: currentUser.name || 'مشتري موثق',
        userAvatar: currentUser.avatarUrl || '',
        rating: newReview.rating,
        comment: newReview.comment,
        verifiedPurchase: true,
        images: newReview.images,
      });

      await firestoreCatalogService.updateProduct(productId, {
        rating: newRating,
        reviewCount: newReviewCount,
        reviews: nextReviews,
      });
    } catch (err) {
      console.warn('Firestore review sync note:', err);
    }

    return {
      success: true,
      message: 'تم إضافة تقييمك بنجاح! شكراً لمشاركتك رأيك وتجربتك.',
      review: newReview,
    };
  }, [currentUser, hasUserPurchasedProduct, isAdmin, products]);

  const contextValue = useMemo<MarketplaceContextType>(() => ({
    currentUser,
    isAuthLoading,
    users,
    products,
    categories,
    brands,
    activeBrands,
    isAdmin,
    currentCurrency,
    currencyRates,
    currentRegion,
    cart,
    favorites,
    wishlist: favorites,
    orders,
    addresses,
    selectedAddress,
    notifications,
    activeCoupon,
    coupons,
    appSettings,
    footerConfig,
    isBackendConnected,
    setCurrentCurrency,
    setCurrency: setCurrentCurrency,
    updateCurrencyRates,
    updateAppSettings,
    updateFooterConfig,
    saveCoupon,
    deleteCoupon,
    toggleCouponActive,
    setFeaturedCoupon,
    formatPrice,
    convertPrice,
    loginUser,
    login: loginUser,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    logoutUser,
    logout: logoutUser,
    switchUser,
    updateUserProfile,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    saveCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    updateBrand,
    deleteBrand,
    toggleBrandActive,
    getProductsByBrand,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleFavorite,
    toggleWishlist: toggleFavorite,
    isFavorite,
    addOrUpdateAddress,
    deleteAddress,
    setSelectedAddress,
    applyCoupon,
    removeCoupon,
    calculateCheckoutTotals,
    createOrder,
    updateOrderStatus,
    cancelCustomerOrder,
    hasUserPurchasedProduct,
    submitProductReview,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }), [
    currentUser,
    isAuthLoading,
    users,
    products,
    categories,
    brands,
    activeBrands,
    isAdmin,
    currentCurrency,
    currencyRates,
    currentRegion,
    cart,
    favorites,
    orders,
    addresses,
    selectedAddress,
    notifications,
    activeCoupon,
    coupons,
    appSettings,
    footerConfig,
    isBackendConnected,
    setCurrentCurrency,
    updateCurrencyRates,
    formatPrice,
    convertPrice,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    hasUserPurchasedProduct,
    submitProductReview,
  ]);

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
