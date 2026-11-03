export type CurrencyCode = 'YER_NORTH' | 'YER_SOUTH' | 'USD' | 'SAR' | 'YER';

export type RegionType = 'north' | 'south' | 'international';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  shortName: string;
  symbol: string;
  region: RegionType;
  rateAgainstBaseYER: number; // Base is YER_NORTH = 1.0. For YER_SOUTH, rate is 3.0 (1 North = 3 South)
  isDefault?: boolean;
}

export interface ExchangeRates {
  YER_NORTH: number; // 1.0 (Base)
  YER_SOUTH: number; // 3.0 (1000 North = 3000 South) -> Configurable
  USD: number;       // e.g. 0.0018868 (1 USD = 530 YER North)
  SAR: number;       // e.g. 0.0071428 (1 SAR = 140 YER North)
  [key: string]: number;
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  images?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  color?: { name: string; hex: string };
  size?: string;
  priceModifierYER?: number;
  stock: number;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  nameEn?: string;
  logo: string;
  coverImage?: string;
  description?: string;
  descriptionEn?: string;
  productCount?: number;
  featured?: boolean;
  order?: number;
  isActive: boolean;
  createdAt?: string | number;
}

export interface Product {
  id: string;
  sku?: string; // Unique inventory SKU (رمز التخزين التعريفي الفريد لإدارة المخزون)
  name: string;
  arabicName: string;
  category: string;
  subcategory: string;
  brandId?: string;
  brandName?: string;
  priceYER: number; // Base price in YER_NORTH
  originalPriceYER?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string; inStock: boolean }[];
  sizes: string[];
  stock: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  dealEndsAt?: string; // ISO string
  storeId: string;
  storeName: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  variants?: ProductVariant[];
  reviews: Review[];
}



export interface Store {
  id: string;
  name: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  location: string;
  city: string;
  region: RegionType;
  lat?: number;
  lng?: number;
  followersCount: number;
  description: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  productId?: string;
  product: Product;
  name?: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  priceYER?: number; // In base YER_NORTH
}

export interface Address {
  id: string;
  userId?: string;
  title: 'المنزل' | 'العمل' | 'عنوان آخر' | string;
  recipientName: string;
  name?: string;
  fullName?: string;
  phone: string;
  city: string; // صنعاء, عدن, etc.
  district: string; // حدة, المنصورة, etc.
  street: string;
  streetAddress?: string;
  streetDetails?: string;
  building?: string;
  additionalNotes?: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
  region: RegionType;
  createdAt?: string;
}

export interface DeliveryZone {
  id: string;
  city: string;
  district?: string;
  region: RegionType;
  baseDeliveryFeeYER: number; // In base YER_NORTH
  estimatedDuration: string;
  minHours: number;
  maxHours: number;
  freeShippingThresholdYER: number;
}

export type PaymentCategory = 'cod' | 'wallets' | 'future';

export type PaymentMethodType = 
  | 'cash_on_delivery'
  | 'kuraimi'
  | 'onecash'
  | 'jeeb'
  | 'floosak'
  | 'shamel_money'
  | 'pcash'
  | 'cash_saba'
  | 'jawali'
  | 'card'
  | 'card_future';

export interface PaymentOption {
  id: PaymentMethodType | string;
  category: PaymentCategory;
  name: string;
  shortName?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  logo?: string;
  logoColor?: string;
  merchantCode?: string;
  accountNumber?: string;
  accountHolder?: string;
  isPopular?: boolean;
  isDefault?: boolean;
  badge?: string;
  feePercentage?: number;
  instructions?: string;
  transferSteps?: string[];
  isAvailable?: boolean;
  isEnabled?: boolean;
  order?: number;
  qrCodeUrl?: string;
}

export interface SubcategoryDetail {
  id: string;
  name: string;
  englishName?: string;
  categoryId: string; // Must strictly link to parent category (e.g. women, boys, girls, baby, shoes, bags)
  image?: string;
  fallbackImage?: string;
  itemCount?: number;
  isActive?: boolean;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  englishName: string;
  subtitle?: string;
  description?: string;
  iconName: string;
  image: string;
  fallbackImage?: string;
  bannerImage?: string;
  itemCount: number;
  subcategories: string[];
  subcategoryDetails?: SubcategoryDetail[];
  isPopular?: boolean;
  isActive?: boolean;
  order?: number;
}

export interface ShippingZoneConfig {
  id: string;
  city: string;
  governorate?: string;
  district?: string;
  region: RegionType;
  baseDeliveryFeeYER: number;
  estimatedDuration: string;
  minHours: number;
  maxHours: number;
  freeShippingThresholdYER: number;
  isFreeShippingEnabled: boolean;
  isActive: boolean;
  order?: number;
}

export interface AbandonedCartConfig {
  isEnabled: boolean;
  reminderDelayMinutes: number; // e.g. 120 (2 hours)
  messageTemplate: string;
  maxReminders: number;
}

export interface AbandonedCartRecord {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  items: CartItem[];
  totalBaseYER: number;
  lastActiveAt: string;
  remindersSentCount: number;
  lastReminderSentAt?: string;
  status: 'pending' | 'reminded' | 'recovered' | 'dismissed';
}

export interface GiftOrderDetails {
  isGift: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientAddress?: string;
  giftMessage?: string;
  giftWrappingStyle?: string;
  giftWrappingFeeYER?: number;
  hidePriceFromInvoice?: boolean;
}

export interface VolumeDiscountRule {
  id: string;
  title: string;
  minQuantity: number; // e.g. 2, 3, 5
  discountPercentage: number; // e.g. 5%, 10%, 15%
  isActive: boolean;
  applicableCategory?: string; // 'all' or specific category
}

export interface FlashSaleConfig {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  discountPercentage: number;
  productIds: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  order?: number;
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  images?: string[];
  isHidden?: boolean;
  isApproved?: boolean;
}

export interface AnalyticsStats {
  totalVisitors: number;
  totalOrdersCount: number;
  totalRevenueBaseYER: number;
  abandonedCartsCount: number;
  couponsUsedCount: number;
  conversionRatePercent: number;
  topSellingProducts: { id: string; name: string; salesCount: number; revenueYER: number; image?: string }[];
  topViewedProducts: { id: string; name: string; viewsCount: number; image?: string }[];
  recentActivity: { id: string; type: 'order' | 'cart' | 'signup' | 'review'; text: string; timestamp: string }[];
}

export type OrderStatus = 
  | 'received' 
  | 'processing' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  time?: string;
  completed: boolean;
  current: boolean;
}

export interface CourierInfo {
  name: string;
  phone: string;
  vehicle: string;
  currentLocation?: { lat: number; lng: number };
  estimatedMinutes?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  items: CartItem[];
  subtotalYER: number; // Base YER_NORTH
  discountYER: number;
  shippingFeeYER: number;
  totalYER: number;
  currency: CurrencyCode;
  exchangeRateUsed: number;
  totalInPaidCurrency: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethodType;
  paymentReference?: string;
  isPaymentVerified?: boolean;
  estimatedDelivery?: string;
  trackingNumber?: string;
  deliveryOtp?: string;
  courier?: CourierInfo;
  notes?: string;
  couponCode?: string;
  timeline: OrderTimelineStep[];
  giftDetails?: GiftOrderDetails;
  volumeDiscountAppliedYER?: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  date?: string;
  time?: string;
  category?: 'orders' | 'offers' | 'delivery' | 'system';
  type?: 'deal' | 'order' | 'promo' | 'system';
  isRead: boolean;
  orderId?: string;
  productId?: string;
  createdAt?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // Percentage or Base YER_NORTH amount
  minOrderBaseYER?: number;
  minOrderYER?: number;
  maxDiscountBaseYER?: number;
  description: string;
  expiryDate?: string;
  isActive: boolean;
  showInTopBanner?: boolean;
  createdAt?: string;
}

export interface HomePromoButton {
  id: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  linkType: 'category' | 'page' | 'external' | 'deals';
  linkTarget: string; // e.g. 'women', 'cart', 'deals', or external url
  icon: 'Zap' | 'Truck' | 'Sparkles' | 'Gift' | 'Percent' | 'Flame' | 'ShoppingBag';
  buttonSize: 'compact' | 'small' | 'normal';
  styleVariant?: 'default' | 'amber' | 'emerald' | 'rose';
  isActive: boolean;
}

export interface BannerItem {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  badge?: string;
  ctaText?: string;
  ctaTextEn?: string;
  linkType: 'category' | 'subcategory' | 'product' | 'deals' | 'external' | 'page';
  linkTarget: string; // categoryId, product ID, 'deals', or url
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  order?: number;
  isActive: boolean;
}

export interface PopupOffer {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  description: string;
  imageUrl?: string;
  discountPercentage?: number;
  couponCode?: string;
  ctaText?: string;
  linkType?: 'category' | 'product' | 'deals' | 'external' | 'cart';
  linkTarget?: string;
  showFrequency?: 'once_per_session' | 'always' | 'once_per_day';
  delaySeconds?: number;
  animationType?: 'fade' | 'zoom' | 'bounce' | 'wheel';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface PolicyItem {
  id: string;
  key: 'privacy' | 'terms' | 'return' | 'shipping' | 'payment' | 'cookies' | 'customers' | 'usage' | string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  lastUpdated?: string;
  order?: number;
  isActive: boolean;
}

export interface SocialMediaItem {
  id: string;
  name: string;
  icon: 'whatsapp' | 'telegram' | 'facebook' | 'tiktok' | 'instagram' | 'youtube' | 'snapchat' | 'twitter' | string;
  url: string;
  enabled: boolean;
  order: number;
}

export interface SocialChannels {
  whatsapp?: string;
  whatsappGroup?: string;
  telegram?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  snapchat?: string;
}

export interface AIKnowledgeBaseItem {
  id: string;
  category: 'store' | 'shipping' | 'payment' | 'returns' | 'faq' | 'general' | 'guarantees' | 'custom';
  title: string;
  content: string;
  isActive: boolean;
  order?: number;
}

export interface BranchItem {
  id: string;
  nameAr: string;
  nameEn?: string;
  image?: string;
  addressAr: string;
  addressEn?: string;
  phone: string;
  workingHoursAr: string;
  workingHoursEn?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  isActive: boolean;
  order?: number;
}

export type FooterActionType =
  | 'action_store_locator' 
  | 'action_splash' 
  | 'action_onboarding' 
  | 'action_currency_admin' 
  | 'action_support_modal'
  | 'action_ai_assistant'
  | 'page' 
  | 'category' 
  | 'product' 
  | 'policy' 
  | 'external' 
  | 'whatsapp' 
  | 'phone' 
  | 'email' 
  | 'map';

export interface FooterLinkItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  linkType: FooterActionType;
  target?: string;
  openInNewTab?: boolean;
  badge?: string;
  isActive: boolean;
  order: number;
}

export interface FooterTrustBadge {
  id: string;
  titleAr: string;
  titleEn?: string;
  subtitleAr: string;
  subtitleEn?: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface FooterConfig {
  isEnabled: boolean;
  
  // Brand & Logo
  showLogo: boolean;
  customLogoUrl?: string;
  brandNameAr: string;
  brandNameEn?: string;
  sloganAr: string;
  sloganEn?: string;
  aboutTextAr: string;
  aboutTextEn?: string;
  
  // Trust Badges
  showTrustBadges: boolean;
  trustBadges: FooterTrustBadge[];
  
  // Quick Action Buttons
  showWhatsappButton: boolean;
  whatsappButtonTextAr?: string;
  showSupportButton: boolean;
  supportButtonTextAr?: string;
  
  // Columns
  showPoliciesColumn: boolean;
  policiesColumnTitleAr: string;
  showSocialColumn: boolean;
  socialColumnTitleAr: string;
  
  // Bottom Screen Bar Links (Interactive Actions)
  showBottomLinksBar: boolean;
  bottomLinks: FooterLinkItem[];

  // Payment & Security
  showPaymentInfo: boolean;
  paymentTextNorthSouthAr?: string;
  paymentGatewaysTextAr?: string;

  // Copyright & Signature
  showCopyright: boolean;
  autoUpdateYear: boolean;
  customYear?: number;
  copyrightTextAr: string;
  showDeveloperSignature: boolean;
  developerSignatureName?: string;
  developerVerifiedBadge?: boolean;
}

export interface AppSettings {
  featuredCouponCode: string;
  promoBannerText: string;
  isPromoBannerActive: boolean;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  storeAddress: string;
  contactAddress?: string;
  supportHours?: string;
  workingHours: string;
  branches?: BranchItem[];
  footerConfig?: FooterConfig;
  socialChannels?: SocialChannels;
  socialMediaList?: SocialMediaItem[];
  banners?: BannerItem[];
  popupOffer?: PopupOffer;
  policies?: PolicyItem[];
  aiKnowledgeBase?: AIKnowledgeBaseItem[];
  aiCustomInstructions?: string;
  paymentOptions?: PaymentOption[];
  shippingZones?: ShippingZoneConfig[];
  abandonedCartConfig?: AbandonedCartConfig;
  volumeDiscounts?: VolumeDiscountRule[];
  flashSales?: FlashSaleConfig[];
  giftOrderConfig?: {
    isEnabled: boolean;
    giftWrappingFeeYER: number;
  };
  promoButtons?: {
    id: string;
    titleAr: string;
    titleEn?: string;
    subtitleAr: string;
    subtitleEn?: string;
    linkType: 'category' | 'page' | 'external' | 'deals' | 'cart';
    linkTarget: string;
    icon: 'Zap' | 'Truck' | 'Sparkles' | 'Gift' | 'Percent' | 'Flame' | 'ShoppingBag' | 'tag' | 'flame' | 'truck' | 'shield';
    size: 'compact' | 'small' | 'normal' | 'sm' | 'md' | 'lg';
    shape?: 'rounded' | 'square' | 'pill';
    color?: 'amber' | 'emerald' | 'purple' | 'rose' | 'default';
    enabled: boolean;
  }[];
  homePromoButtons?: {
    button1: HomePromoButton;
    button2: HomePromoButton;
  };
}

export type UserRole = 'customer' | 'admin' | 'seller' | 'delivery';

export interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  displayName?: string;
  phone: string;
  email: string;
  city: string;
  preferredRegion: RegionType;
  preferredCurrency: CurrencyCode;
  avatarUrl?: string;
  walletBalanceYER: number; // In base YER_NORTH
  points: number;
  loyaltyPoints?: number;
  memberTier: 'عضو فضي' | 'عضو ذهبي' | 'عضو بلاتينيوم كبار الشخصيات' | string;
  savedAddresses: Address[];
  favoriteProductIds?: string[];
  role?: UserRole;
  region?: 'north' | 'south' | 'international';
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  actionType?: 'product_recommendation' | 'budget_filter' | 'fashion_advice' | 'gift_finder';
}
