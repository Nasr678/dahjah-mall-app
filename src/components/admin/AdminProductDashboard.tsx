import React, { useState, useRef } from 'react';
import { Product, Category, Order, OrderStatus, Brand } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { uploadProductImage, uploadBrandImage } from '../../services/firebase';
import { AdminBannersManager } from './AdminBannersManager';
import { AdminPopupManager } from './AdminPopupManager';
import { AdminPoliciesManager } from './AdminPoliciesManager';
import { AdminSocialMediaManager } from './AdminSocialMediaManager';
import { AdminAIKnowledgeManager } from './AdminAIKnowledgeManager';
import { AdminPaymentMethodsManager } from './AdminPaymentMethodsManager';
import { AdminShippingManager } from './AdminShippingManager';
import { AdminAbandonedCartManager } from './AdminAbandonedCartManager';
import { AdminVolumeDiscountsManager } from './AdminVolumeDiscountsManager';
import { AdminFlashSalesManager } from './AdminFlashSalesManager';
import { AdminReviewsManager } from './AdminReviewsManager';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { AdminBranchesManager } from './AdminBranchesManager';
import { AdminFooterManager } from './AdminFooterManager';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Layers, 
  Sparkles, 
  Flame, 
  Tag, 
  Package, 
  ChevronRight, 
  FolderPlus, 
  ShieldCheck, 
  Lock, 
  Eye, 
  TrendingUp,
  RefreshCw,
  Sliders,
  ShoppingBag,
  Users as UsersIcon,
  Settings,
  Truck,
  CreditCard,
  Send,
  CheckCircle,
  Clock,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Percent,
  BookOpen,
  Coins,
  Calculator,
  Gift,
  Share2,
  Bot,
  Building2
} from 'lucide-react';

interface AdminProductDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '0-3 أشهر', '3-6 أشهر', '6-12 شهر', 'سنة', 'سنتين', '3-4 سنوات', '5-6 سنوات'];
const COMMON_COLORS = [
  { name: 'أسود ملكي', hex: '#000000' },
  { name: 'أبيض ناصع', hex: '#FFFFFF' },
  { name: 'كحلي فاخر', hex: '#0F172A' },
  { name: 'أحمر قاني', hex: '#DC2626' },
  { name: 'بيج رملي', hex: '#D4B996' },
  { name: 'ذهبي ملوكي', hex: '#D97706' },
  { name: 'وردي ناعم', hex: '#EC4899' },
  { name: 'زيتي زيتوني', hex: '#4D7C0F' },
  { name: 'رمادي فضي', hex: '#6B7280' },
  { name: 'بنفسجي ملكي', hex: '#7C3AED' },
];

export const AdminProductDashboard: React.FC<AdminProductDashboardProps> = ({ isOpen, onClose }) => {
  const {
    products,
    categories,
    brands,
    orders,
    users,
    updateOrderStatus,
    isAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    saveCategory,
    addBrand,
    updateBrand,
    deleteBrand,
    toggleBrandActive,
    formatPrice,
    currentUser,
    coupons,
    appSettings,
    updateAppSettings,
    saveCoupon,
    deleteCoupon,
    toggleCouponActive,
    setFeaturedCoupon,
    currencyRates,
    updateCurrencyRates,
  } = useMarketplace();

  // Tab navigation inside Admin
  type AdminDashboardTab = 
    | 'products' 
    | 'orders' 
    | 'categories' 
    | 'brands' 
    | 'paymentMethods'
    | 'shipping'
    | 'abandonedCarts'
    | 'volumeDiscounts'
    | 'flashSales'
    | 'reviews'
    | 'analytics'
    | 'banners' 
    | 'popups' 
    | 'policies' 
    | 'social' 
    | 'branches'
    | 'footer'
    | 'aiKnowledge' 
    | 'coupons' 
    | 'rates' 
    | 'contact' 
    | 'guide' 
    | 'customers' 
    | 'settings';

  const [adminTab, setAdminTab] = useState<AdminDashboardTab>('products');

  // Brand Management State
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [brandLogoInput, setBrandLogoInput] = useState('');
  const [brandCoverInput, setBrandCoverInput] = useState('');
  const [brandDescInput, setBrandDescInput] = useState('');
  const [brandIsActiveInput, setBrandIsActiveInput] = useState(true);
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [isUploadingBrandCover, setIsUploadingBrandCover] = useState(false);
  const [deleteConfirmBrand, setDeleteConfirmBrand] = useState<Brand | null>(null);
  const [brandStatusMessage, setBrandStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const brandCoverInputRef = useRef<HTMLInputElement>(null);

  // Orders State & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Search & Filter state for Products
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFlag, setFilterFlag] = useState<'all' | 'bestSeller' | 'newArrival' | 'flashDeal' | 'lowStock'>('all');

  // Category Edit State
  const [editCatName, setEditCatName] = useState('');
  const [editCatSubtitle, setEditCatSubtitle] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatBanner, setEditCatBanner] = useState('');

  // Coupon Creation State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed_yer'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(10);
  const [newMinOrder, setNewMinOrder] = useState<number>(0);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Exchange Rates State
  const northRate = currencyRates?.YER_NORTH || 1.0;
  const [southRate, setSouthRate] = useState<number>(currencyRates?.YER_SOUTH || 3.0);
  const [usdRate, setUsdRate] = useState<number>(currencyRates?.USD || 0.0018868);
  const [sarRate, setSarRate] = useState<number>(currencyRates?.SAR || 0.0071428);
  const [calcAmount, setCalcAmount] = useState<number>(10000);

  // Contact Info State
  const [contactPhone, setContactPhone] = useState(appSettings?.contactPhone || '+967 770 000 000');
  const [contactWhatsapp, setContactWhatsapp] = useState(appSettings?.contactWhatsapp || '+967 770 000 000');
  const [contactEmail, setContactEmail] = useState(appSettings?.contactEmail || 'support@dajjahmall.com');
  const [contactAddress, setContactAddress] = useState(appSettings?.contactAddress || 'صنعاء — شارع حدة / عدن — المعلا');
  const [contactHours, setContactHours] = useState(appSettings?.supportHours || '24 ساعة على مدار الأسبوع');
  const [promoBannerInput, setPromoBannerInput] = useState(appSettings?.promoBannerText || 'توصيل فوري مجاني ومعاينة عند الاستلام في كافة المحافظات اليمنية');

  // Promo Buttons Management State
  const defaultPromoButtons = [
    {
      id: 'btn-flash-sale',
      titleAr: 'تخفيضات الفلاش سيل',
      titleEn: 'Flash Sale',
      subtitleAr: 'خصومات حصرية حتى 50%',
      subtitleEn: 'Up to 50% Off',
      linkType: 'category' as const,
      linkTarget: 'women',
      icon: 'flame' as const,
      size: 'sm' as const,
      shape: 'rounded' as const,
      color: 'purple' as const,
      enabled: true,
    },
    {
      id: 'btn-free-shipping',
      titleAr: 'شحن مجاني وسريع',
      titleEn: 'Free Shipping',
      subtitleAr: 'للطلبات المؤهلة لجميع المحافظات',
      subtitleEn: 'On Eligible Orders',
      linkType: 'cart' as const,
      linkTarget: 'cart',
      icon: 'truck' as const,
      size: 'sm' as const,
      shape: 'rounded' as const,
      color: 'emerald' as const,
      enabled: true,
    },
  ];

  const [promoButtonsState, setPromoButtonsState] = useState(
    appSettings?.promoButtons && appSettings.promoButtons.length > 0
      ? appSettings.promoButtons
      : defaultPromoButtons
  );
  const [isSavingPromoButtons, setIsSavingPromoButtons] = useState(false);
  const [promoButtonsSaveSuccess, setPromoButtonsSaveSuccess] = useState(false);

  const handleSavePromoButtons = async () => {
    setIsSavingPromoButtons(true);
    try {
      await updateAppSettings({ promoButtons: promoButtonsState });
      setPromoButtonsSaveSuccess(true);
      setTimeout(() => setPromoButtonsSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving promo buttons:', err);
    } finally {
      setIsSavingPromoButtons(false);
    }
  };

  // Guide Active Tab State
  const [guideTab, setGuideTab] = useState<'overview' | 'customer' | 'ai' | 'wallets' | 'admin'>('overview');

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Modal / Form state for Add/Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [description, setDescription] = useState('');
  const [priceYER, setPriceYER] = useState<number>(10000);
  const [originalPriceYER, setOriginalPriceYER] = useState<number>(12500);
  const [hasDiscount, setHasDiscount] = useState(true);
  const [category, setCategory] = useState<string>('women');
  const [subcategory, setSubcategory] = useState<string>('فساتين');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [stock, setStock] = useState<number>(20);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string; inStock: boolean }[]>([
    { name: 'أسود ملكي', hex: '#000000', inStock: true },
    { name: 'بيج رملي', hex: '#D4B996', inStock: true },
  ]);
  const [productBrandId, setProductBrandId] = useState<string>('');

  // Feature Flags
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isFlashDeal, setIsFlashDeal] = useState(false);

  // Category Manager State
  const [selectedCatToEdit, setSelectedCatToEdit] = useState<Category | null>(null);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Security Access Guard
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md">
        <div className="bg-white border border-[#E5DFD7] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#8B2635]/10 border border-[#8B2635]/20 flex items-center justify-center mx-auto text-[#8B2635]">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#1A1A1A]">منطقة محمية — صلاحيات المالك فقط</h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            عذرًا، لوحة التحكم وإدارة المنتجات والمخزون مخصصة لمالك المنصة والمسؤولين المصرح لهم عبر Firebase.
          </p>
          <div className="p-3 rounded-xl bg-[#FAF9F7] border border-[#E5DFD7] text-xs text-[#6B6B6B]">
            الحساب الحالي: <span className="font-bold text-[#1A1A1A]">{currentUser?.email || currentUser?.phone || 'غير مسجل'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black transition-all cursor-pointer"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  // Open Form to Add New Product
  const handleOpenAddForm = () => {
    setEditingProductId(null);
    setName('');
    setArabicName('');
    setDescription('');
    setPriceYER(12000);
    setOriginalPriceYER(15000);
    setHasDiscount(true);
    setCategory('women');
    const defaultSub = categories.find((c) => c.id === 'women')?.subcategories[0] || 'فساتين';
    setSubcategory(defaultSub);
    setCustomSubcategory('');
    setProductBrandId('');
    setStock(25);
    setImages(['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop']);
    setNewImageUrl('');
    setSelectedSizes(['S', 'M', 'L']);
    setSelectedColors([
      { name: 'أسود ملكي', hex: '#000000', inStock: true },
      { name: 'كحلي فاخر', hex: '#0F172A', inStock: true },
    ]);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsFlashDeal(false);
    setIsFormModalOpen(true);
  };

  // Open Form to Edit Existing Product
  const handleOpenEditForm = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setArabicName(prod.arabicName || prod.name);
    setDescription(prod.description || '');
    setPriceYER(prod.priceYER);
    setOriginalPriceYER(prod.originalPriceYER || prod.priceYER);
    setHasDiscount(Boolean(prod.originalPriceYER && prod.originalPriceYER > prod.priceYER));
    setCategory(prod.category);
    setSubcategory(prod.subcategory);
    setCustomSubcategory('');
    setProductBrandId(prod.brandId || '');
    setStock(prod.stock || 0);
    setImages(prod.images && prod.images.length > 0 ? [...prod.images] : []);
    setNewImageUrl('');
    setSelectedSizes(prod.sizes && prod.sizes.length > 0 ? [...prod.sizes] : ['M', 'L']);
    setSelectedColors(prod.colors && prod.colors.length > 0 ? [...prod.colors] : [{ name: 'أسود', hex: '#000', inStock: true }]);
    setIsBestSeller(Boolean(prod.isBestSeller));
    setIsNewArrival(Boolean(prod.isNewArrival));
    setIsFlashDeal(Boolean(prod.isFlashDeal));
    setIsFormModalOpen(true);
  };

  // Handle Image Upload from device with parallel processing
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadProductImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
      setStatusMessage({ type: 'success', text: 'تم ضغط ورفع الصور بنجاح في ثوانٍ معدودة!' });
    } catch (err) {
      console.error('Image upload failed:', err);
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الصورة.' });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Image via Direct URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Size
  const handleToggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes((prev) => prev.filter((s) => s !== size));
    } else {
      setSelectedSizes((prev) => [...prev, size]);
    }
  };

  // Add Custom Size
  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    if (!selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes((prev) => [...prev, customSizeInput.trim()]);
    }
    setCustomSizeInput('');
  };

  // Add Color
  const handleAddColor = (color: { name: string; hex: string }) => {
    if (!selectedColors.some((c) => c.name === color.name)) {
      setSelectedColors((prev) => [...prev, { ...color, inStock: true }]);
    }
  };

  // Remove Color
  const handleRemoveColor = (index: number) => {
    setSelectedColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit (Create or Update Product)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabicName.trim() && !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال اسم المنتج.' });
      return;
    }
    if (images.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إضافة صورة واحدة على الأقل للمنتج.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const calculatedDiscount = hasDiscount && originalPriceYER > priceYER
      ? Math.round(((originalPriceYER - priceYER) / originalPriceYER) * 100)
      : undefined;

    const finalSubcategory = customSubcategory.trim() ? customSubcategory.trim() : subcategory;
    const selectedBrandObj = brands.find((b) => b.id === productBrandId);

    const productPayload: Product = {
      id: editingProductId || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || arabicName.trim(),
      arabicName: arabicName.trim() || name.trim(),
      description: description.trim() || 'منتج عالي الجودة من تشكيلات ضَجّة مول الفاخرة.',
      category,
      subcategory: finalSubcategory,
      brandId: productBrandId ? productBrandId : undefined,
      brandName: selectedBrandObj ? selectedBrandObj.name : undefined,
      priceYER: Number(priceYER),
      originalPriceYER: hasDiscount ? Number(originalPriceYER) : Number(priceYER),
      discountPercentage: calculatedDiscount,
      stock: Number(stock),
      images,
      sizes: selectedSizes.length > 0 ? selectedSizes : ['قياس موحد'],
      colors: selectedColors.length > 0 ? selectedColors : [{ name: 'افتراضي', hex: '#000', inStock: true }],
      isBestSeller,
      isNewArrival,
      isFlashDeal,
      rating: 4.9,
      reviewCount: 18,
      storeId: 'store-1',
      storeName: 'دار الأناقة الملكية — صنعاء',
      features: ['خامة فاخرة عالية الجودة', 'توصيل فوري مجاني مع المعاينة', 'ضمان الاستبدال'],
      specifications: { 'المنشأ': 'مستورد فاخر', 'الجودة': 'نخب أول AAA+' },
      tags: [category, finalSubcategory, isBestSeller ? 'الأكثر مبيعاً' : '', isNewArrival ? 'جديد' : '', selectedBrandObj ? selectedBrandObj.name : ''].filter(Boolean),
      reviews: [],
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        setStatusMessage({ type: 'success', text: 'تم تحديث المنتج في Firestore بنجاح!' });
      } else {
        await addProduct(productPayload);
        setStatusMessage({ type: 'success', text: 'تم إضافة المنتج الجديد ونشره مباشرة في التطبيق!' });
      }

      // If a custom subcategory was introduced, append it to the category in Firestore
      if (customSubcategory.trim()) {
        const catObj = categories.find((c) => c.id === category);
        if (catObj && !catObj.subcategories.includes(customSubcategory.trim())) {
          await saveCategory({
            ...catObj,
            subcategories: [...catObj.subcategories, customSubcategory.trim()],
          });
        }
      }

      setTimeout(() => {
        setIsFormModalOpen(false);
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      console.error('Error saving product:', err);
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ المنتج في Firestore.' });
      setIsSubmitting(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      setStatusMessage({ type: 'success', text: 'تم حذف المنتج من قاعدة البيانات بنجاح.' });
    } catch (err) {
      console.error('Error deleting product:', err);
      setStatusMessage({ type: 'error', text: 'تعذر حذف المنتج.' });
    }
  };

  // Quick Stock Adjustment
  const handleQuickStockChange = async (productId: string, delta: number, current: number) => {
    const newStock = Math.max(0, current + delta);
    await updateProductStock(productId, newStock);
  };

  // Category & Subcategory Operations
  const handleAddSubcategory = async () => {
    if (!selectedCatToEdit || !newSubcategoryInput.trim()) return;
    const subTrimmed = newSubcategoryInput.trim();
    if (selectedCatToEdit.subcategories.includes(subTrimmed)) return;

    const updatedCat: Category = {
      ...selectedCatToEdit,
      subcategories: [...selectedCatToEdit.subcategories, subTrimmed],
    };

    await saveCategory(updatedCat);
    setSelectedCatToEdit(updatedCat);
    setNewSubcategoryInput('');
  };

  const handleRemoveSubcategory = async (subNameToRemove: string) => {
    if (!selectedCatToEdit) return;
    const updatedCat: Category = {
      ...selectedCatToEdit,
      subcategories: selectedCatToEdit.subcategories.filter((s) => s !== subNameToRemove),
    };
    await saveCategory(updatedCat);
    setSelectedCatToEdit(updatedCat);
  };

  // Brand CRUD Handlers
  const handleOpenAddBrand = () => {
    setEditingBrandId(null);
    setBrandNameInput('');
    setBrandLogoInput('');
    setBrandCoverInput('');
    setBrandDescInput('');
    setBrandIsActiveInput(true);
    setBrandStatusMessage(null);
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setBrandNameInput(brand.name);
    setBrandLogoInput(brand.logo);
    setBrandCoverInput(brand.coverImage || '');
    setBrandDescInput(brand.description || '');
    setBrandIsActiveInput(brand.isActive);
    setBrandStatusMessage(null);
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameInput.trim()) {
      setBrandStatusMessage({ type: 'error', text: 'يرجى إدخال اسم البراند.' });
      return;
    }
    if (!brandLogoInput.trim()) {
      setBrandStatusMessage({ type: 'error', text: 'يرجى رفع شعار أو إدخال رابط صورة الشعار.' });
      return;
    }

    try {
      if (editingBrandId) {
        await updateBrand(editingBrandId, {
          name: brandNameInput.trim(),
          logo: brandLogoInput.trim(),
          coverImage: brandCoverInput.trim() || undefined,
          description: brandDescInput.trim() || undefined,
          isActive: brandIsActiveInput,
        });
        setBrandStatusMessage({ type: 'success', text: 'تم تحديث البراند بنجاح!' });
      } else {
        await addBrand({
          name: brandNameInput.trim(),
          logo: brandLogoInput.trim(),
          coverImage: brandCoverInput.trim() || undefined,
          description: brandDescInput.trim() || undefined,
          isActive: brandIsActiveInput,
        });
        setBrandStatusMessage({ type: 'success', text: 'تم إضافة البراند الجديد بنجاح!' });
      }

      setTimeout(() => {
        setIsBrandModalOpen(false);
        setBrandStatusMessage(null);
      }, 600);
    } catch (err) {
      console.error('Error saving brand:', err);
      setBrandStatusMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ البراند.' });
    }
  };

  const handleDeleteBrand = async () => {
    if (!deleteConfirmBrand) return;
    try {
      await deleteBrand(deleteConfirmBrand.id);
      setDeleteConfirmBrand(null);
      setBrandStatusMessage({ type: 'success', text: 'تم حذف البراند بنجاح.' });
    } catch (err) {
      console.error('Error deleting brand:', err);
      setBrandStatusMessage({ type: 'error', text: 'تعذر حذف البراند.' });
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBrandLogo(true);
    try {
      const url = await uploadBrandImage(file, 'logo');
      setBrandLogoInput(url);
      setBrandStatusMessage({ type: 'success', text: 'تم رفع شعار البراند بنجاح!' });
    } catch (err) {
      console.error('Brand logo upload failed:', err);
      setBrandStatusMessage({ type: 'error', text: 'فشل رفع الشعار.' });
    } finally {
      setIsUploadingBrandLogo(false);
      if (brandLogoInputRef.current) brandLogoInputRef.current.value = '';
    }
  };

  const handleBrandCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBrandCover(true);
    try {
      const url = await uploadBrandImage(file, 'cover');
      setBrandCoverInput(url);
      setBrandStatusMessage({ type: 'success', text: 'تم رفع غلاف البراند بنجاح!' });
    } catch (err) {
      console.error('Brand cover upload failed:', err);
      setBrandStatusMessage({ type: 'error', text: 'فشل رفع الغلاف.' });
    } finally {
      setIsUploadingBrandCover(false);
      if (brandCoverInputRef.current) brandCoverInputRef.current.value = '';
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.arabicName && p.arabicName.includes(searchQuery)) ||
      (p.subcategory && p.subcategory.includes(searchQuery));

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;

    let matchesFlag = true;
    if (filterFlag === 'bestSeller') matchesFlag = Boolean(p.isBestSeller);
    if (filterFlag === 'newArrival') matchesFlag = Boolean(p.isNewArrival);
    if (filterFlag === 'flashDeal') matchesFlag = Boolean(p.isFlashDeal);
    if (filterFlag === 'lowStock') matchesFlag = (p.stock || 0) <= 5;

    return matchesSearch && matchesCategory && matchesFlag;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F7] overflow-y-auto text-[#1A1A1A]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5DFD7] px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/20 flex items-center justify-center text-[#8B2635]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#1A1A1A] flex items-center gap-2">
              <span>لوحة إدارة المنتجات والمخزون</span>
              <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#8B6F15] border border-[#D4AF37]/40 text-[10px] font-black uppercase">
                المالك فقط
              </span>
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              متصل مباشرة بقاعدة بيانات Cloud Firestore السحابية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm shadow-md shadow-[#8B2635]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] transition-all cursor-pointer border border-[#E5DFD7]"
            title="إغلاق لوحة الإدارة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (Products / Orders / Categories / Brands / Customers / Settings) */}
        <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3 gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setAdminTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'analytics'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>التحليلات والمبيعات</span>
            </button>

            <button
              onClick={() => setAdminTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'products'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المنتجات والمخزون ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('categories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'categories'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>الأقسام ({categories.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('paymentMethods')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'paymentMethods'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>بوابات وطرق الدفع</span>
            </button>

            <button
              onClick={() => setAdminTab('shipping')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'shipping'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>مناطق ورسوم الشحن</span>
            </button>

            <button
              onClick={() => setAdminTab('flashSales')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'flashSales'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>العروض الخاطفة</span>
            </button>

            <button
              onClick={() => setAdminTab('volumeDiscounts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'volumeDiscounts'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>خصومات الكميات</span>
            </button>

            <button
              onClick={() => setAdminTab('abandonedCarts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'abandonedCarts'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>السلات المتروكة</span>
            </button>

            <button
              onClick={() => setAdminTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'reviews'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>تقييمات ومراجعات</span>
            </button>

            <button
              onClick={() => setAdminTab('brands')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'brands'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>إدارة البراندات ({brands.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('banners')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'banners'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>البنرات والسلايدر</span>
            </button>

            <button
              onClick={() => setAdminTab('popups')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'popups'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>عروض الـ Popup</span>
            </button>

            <button
              onClick={() => setAdminTab('policies')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'policies'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>السياسات والشروط</span>
            </button>

            <button
              onClick={() => setAdminTab('social')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'social'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>قنوات التواصل</span>
            </button>

            <button
              onClick={() => setAdminTab('branches')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'branches'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>الفروع والمواقع</span>
            </button>

            <button
              onClick={() => setAdminTab('footer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'footer'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>إدارة التذييل والمحتوى السفلي</span>
            </button>

            <button
              onClick={() => setAdminTab('aiKnowledge')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'aiKnowledge'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>معرفة وإعدادات ضَجّة AI</span>
            </button>

            <button
              onClick={() => setAdminTab('coupons')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'coupons'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>أكواد الخصم والبانر ({coupons.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('rates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'rates'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>أسعار الصرف</span>
            </button>

            <button
              onClick={() => setAdminTab('contact')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'contact'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>الاتصال والدعم</span>
            </button>

            <button
              onClick={() => setAdminTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'guide'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دليل الاستخدام</span>
            </button>

            <button
              onClick={() => setAdminTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'orders'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>الطلبات الحية ({orders.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'customers'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              <span>العملاء ({users.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'settings'
                  ? 'bg-[#8B2635] text-white font-black shadow-md shadow-[#8B2635]/20'
                  : 'bg-white border border-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#8B2635]/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>التوصيل والإشعارات</span>
            </button>
          </div>

          <div className="text-xs text-[#6B6B6B] hidden sm:flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>المزامنة الحية مفعلة</span>
          </div>
        </div>

        {/* Global Status Message Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            TAB 1: PRODUCTS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            {/* Search & Filters Toolbar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#6B6B6B] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو القسم الفرعي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#8B2635]"
                />
              </div>

              {/* Filter Category Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filterCategory === 'all'
                      ? 'bg-[#8B2635] text-white font-black'
                      : 'bg-[#FAF9F7] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E5DFD7]'
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      filterCategory === cat.id
                        ? 'bg-[#8B2635] text-white font-black'
                        : 'bg-[#FAF9F7] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E5DFD7]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Filter Flags */}
              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <select
                  value={filterFlag}
                  onChange={(e) => setFilterFlag(e.target.value as any)}
                  className="bg-[#FAF9F7] border border-[#E5DFD7] text-[#1A1A1A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#8B2635] w-full md:w-auto"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="bestSeller">🔥 الأكثر مبيعاً</option>
                  <option value="newArrival">✨ وصل حديثاً</option>
                  <option value="flashDeal">🏷️ العروض والتخفيضات</option>
                  <option value="lowStock">⚠️ مخزون منخفض (5 أو أقل)</option>
                </select>
              </div>
            </div>

            {/* Products Table / Cards Grid */}
            <div className="bg-white border border-[#E5DFD7] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#F4F1EA] border-b border-[#E5DFD7] text-[11px] font-black text-[#6B6B6B] uppercase tracking-wider">
                      <th className="p-4">المنتج</th>
                      <th className="p-4">القسم / الفرعي</th>
                      <th className="p-4">السعر الأساسي</th>
                      <th className="p-4">المخزون</th>
                      <th className="p-4">المقاسات والألوان</th>
                      <th className="p-4">الوسوم</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD7]/60 text-xs text-[#1A1A1A]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[#6B6B6B] space-y-2">
                          <Package className="w-10 h-10 mx-auto text-[#B5ADA3] mb-2" />
                          <p className="font-bold text-sm text-[#1A1A1A]">لا توجد منتجات مطابقة لخيارات البحث أو التصفية.</p>
                          <button
                            onClick={handleOpenAddForm}
                            className="inline-flex items-center gap-1.5 text-xs text-[#8B2635] font-bold hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>أضف منتجك الأول الآن</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const currentCat = categories.find((c) => c.id === prod.category)?.name || prod.category;
                        return (
                          <tr key={prod.id} className="hover:bg-[#FAF9F7] transition-colors">
                            {/* Product Info with Image */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#FAF9F7] border border-[#E5DFD7] flex-shrink-0">
                                  <img
                                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop'}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-[#1A1A1A] line-clamp-1">{prod.arabicName || prod.name}</h4>
                                  <p className="text-[11px] text-[#6B6B6B] line-clamp-1">{prod.description}</p>
                                </div>
                              </div>
                            </td>

                            {/* Category & Subcategory */}
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] border border-[#E5DFD7] text-[#8B6F15] font-bold text-[11px]">
                                {currentCat}
                              </span>
                              <span className="block text-[11px] text-[#6B6B6B] mt-1">
                                {prod.subcategory}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-4">
                              <div className="font-black text-[#1A1A1A]">{formatPrice(prod.priceYER)}</div>
                              {prod.originalPriceYER && prod.originalPriceYER > prod.priceYER && (
                                <div className="text-[10px] text-[#6B6B6B] line-through">
                                  {formatPrice(prod.originalPriceYER)}
                                </div>
                              )}
                              {prod.discountPercentage && (
                                <span className="text-[10px] text-emerald-700 font-bold">
                                  خصم {prod.discountPercentage}%
                                </span>
                              )}
                            </td>

                            {/* Stock with quick buttons */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuickStockChange(prod.id, -1, prod.stock || 0)}
                                  className="w-6 h-6 rounded-md bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] border border-[#E5DFD7] flex items-center justify-center font-bold"
                                  title="إنقاص المخزون"
                                >
                                  -
                                </button>
                                <span
                                  className={`px-2 py-0.5 rounded font-black text-xs ${
                                    (prod.stock || 0) <= 5
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-[#F4F1EA] text-[#1A1A1A] border border-[#E5DFD7]'
                                  }`}
                                >
                                  {prod.stock || 0}
                                </span>
                                <button
                                  onClick={() => handleQuickStockChange(prod.id, 1, prod.stock || 0)}
                                  className="w-6 h-6 rounded-md bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] border border-[#E5DFD7] flex items-center justify-center font-bold"
                                  title="زيادة المخزون"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Sizes & Colors count */}
                            <td className="p-4">
                              <div className="text-[11px] space-y-1">
                                <div className="text-[#6B6B6B]">
                                  المقاسات: <span className="text-[#1A1A1A] font-bold">{prod.sizes?.join(', ') || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {prod.colors?.slice(0, 4).map((c, i) => (
                                    <span
                                      key={i}
                                      className="w-3.5 h-3.5 rounded-full border border-[#E5DFD7] inline-block"
                                      style={{ backgroundColor: c.hex }}
                                      title={c.name}
                                    />
                                  ))}
                                  {prod.colors && prod.colors.length > 4 && (
                                    <span className="text-[10px] text-[#6B6B6B]">+{prod.colors.length - 4}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Badges */}
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {prod.isBestSeller && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[#8B6F15] border border-amber-200 text-[10px] font-bold">
                                    الأكثر مبيعاً
                                  </span>
                                )}
                                {prod.isNewArrival && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                    جديد
                                  </span>
                                )}
                                {prod.isFlashDeal && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                    عرض خاص
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditForm(prod)}
                                  className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] hover:bg-[#8B2635] hover:text-white hover:border-[#8B2635] text-[#1A1A1A] transition-all"
                                  title="تعديل المنتج"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmProduct(prod)}
                                  className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-700 transition-all"
                                  title="حذف المنتج"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CATEGORIES & SUBCATEGORIES MANAGEMENT
           ========================================================================= */}
        {adminTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories List */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-sm font-black text-[#1A1A1A] mb-2">الأقسام الرئيسية الستة</h3>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatToEdit(cat)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedCatToEdit?.id === cat.id
                      ? 'bg-[#8B2635]/10 border-[#8B2635] text-[#8B2635] shadow-sm'
                      : 'bg-white border-[#E5DFD7] hover:border-[#D4AF37] text-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E5DFD7]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm">{cat.name}</h4>
                      <p className="text-xs text-[#6B6B6B]">{cat.subcategories.length} أقسام فرعية</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                </div>
              ))}
            </div>

            {/* Subcategories & Details Editor Panel */}
            <div className="md:col-span-2 bg-white border border-[#E5DFD7] rounded-3xl p-6 shadow-sm space-y-6">
              {selectedCatToEdit ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                        <span>إدارة وتعديل قسم:</span>
                        <span className="text-[#8B2635]">{selectedCatToEdit.name}</span>
                      </h3>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{selectedCatToEdit.subtitle}</p>
                    </div>
                    <button
                      onClick={async () => {
                        const updatedCat: Category = {
                          ...selectedCatToEdit,
                          name: editCatName || selectedCatToEdit.name,
                          subtitle: editCatSubtitle || selectedCatToEdit.subtitle,
                          image: editCatImage || selectedCatToEdit.image,
                          bannerImage: editCatBanner || selectedCatToEdit.bannerImage,
                        };
                        await saveCategory(updatedCat);
                        setSelectedCatToEdit(updatedCat);
                        setStatusMessage({ type: 'success', text: `تم حفظ تعديلات قسم "${updatedCat.name}" بنجاح!` });
                        setTimeout(() => setStatusMessage(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ تفاصيل القسم</span>
                    </button>
                  </div>

                  {/* Category Image & Info Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7]">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">اسم القسم بالعربية</label>
                      <input
                        type="text"
                        defaultValue={selectedCatToEdit.name}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">الوصف المختصر (Subtitle)</label>
                      <input
                        type="text"
                        defaultValue={selectedCatToEdit.subtitle}
                        onChange={(e) => setEditCatSubtitle(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">رابط صورة الأيقونة / الغلاف</label>
                      <input
                        type="text"
                        defaultValue={selectedCatToEdit.image}
                        onChange={(e) => setEditCatImage(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">رابط صورة البانر العريض</label>
                      <input
                        type="text"
                        defaultValue={selectedCatToEdit.bannerImage || ''}
                        placeholder="https://images.unsplash.com/..."
                        onChange={(e) => setEditCatBanner(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      />
                    </div>
                  </div>

                  {/* Add Subcategory Input */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="أدخل اسم القسم الفرعي الجديد..."
                      value={newSubcategoryInput}
                      onChange={(e) => setNewSubcategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory();
                        }
                      }}
                      className="flex-1 bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#8B2635]"
                    />
                    <button
                      onClick={handleAddSubcategory}
                      className="px-5 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-sm flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة فرعي</span>
                    </button>
                  </div>

                  {/* Existing Subcategories Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#6B6B6B]">الأقسام الفرعية الحالية ({selectedCatToEdit.subcategories.length}):</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedCatToEdit.subcategories.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF9F7] border border-[#E5DFD7] text-[#1A1A1A] text-xs font-bold shadow-sm"
                        >
                          <span>{sub}</span>
                          <button
                            onClick={() => handleRemoveSubcategory(sub)}
                            className="text-[#6B6B6B] hover:text-rose-600 transition-colors cursor-pointer"
                            title="حذف هذا القسم الفرعي"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-[#6B6B6B] space-y-2">
                  <FolderPlus className="w-12 h-12 mx-auto text-[#B5ADA3] mb-2" />
                  <h4 className="font-bold text-[#1A1A1A] text-base">اختر قسمًا رئيسيًا من القائمة لتعديله</h4>
                  <p className="text-xs text-[#6B6B6B]">
                    يمكنك تعديل اسم القسم، صورته، ووصفه، والأقسام الفرعية وتحديثها في كامل المتجر.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: BRANDS MANAGEMENT (STANDALONE)
           ========================================================================= */}
        {adminTab === 'brands' && (
          <div className="space-y-6">
            {/* Header & Quick Action Bar */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-white to-[#F4F1EA] border border-[#D4AF37]/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15] shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                    <span>إدارة البراندات المستقلة</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8B6F15] text-[10px] font-black">
                      مستقل عن الأقسام
                    </span>
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    أضف، عدّل، فعّل أو عطّل البراندات وشعاراتها. تظهر للمستخدمين كصفحة تصفح مستقلة للماركات.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  id="admin-add-brand-btn"
                  onClick={handleOpenAddBrand}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة براند جديد</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm space-y-1">
                <span className="text-xs text-[#6B6B6B] font-medium">إجمالي البراندات</span>
                <div className="text-xl sm:text-2xl font-black text-[#1A1A1A]">{brands.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm space-y-1">
                <span className="text-xs text-emerald-700 font-medium">البراندات النشطة</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-700">
                  {brands.filter((b) => b.isActive).length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm space-y-1">
                <span className="text-xs text-[#6B6B6B] font-medium">البراندات المعطلة</span>
                <div className="text-xl sm:text-2xl font-black text-[#6B6B6B]">
                  {brands.filter((b) => !b.isActive).length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm space-y-1">
                <span className="text-xs text-[#8B6F15] font-medium">المنتجات المرتبطة</span>
                <div className="text-xl sm:text-2xl font-black text-[#8B6F15]">
                  {products.filter((p) => p.brandId || p.brandName).length}
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E5DFD7] p-3 rounded-2xl shadow-sm">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-[#6B6B6B] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في أسماء البراندات..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl pr-9 pl-4 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                />
              </div>

              <div className="text-xs text-[#6B6B6B] font-medium">
                يتم مزامنة أي تعديل فورياً عبر قاعدة بيانات Cloud Firestore السحابية.
              </div>
            </div>

            {/* Brands Cards Grid */}
            {brands.length === 0 ? (
              <div className="bg-white border border-[#E5DFD7] rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD7] flex items-center justify-center mx-auto text-[#8B6F15]">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h4 className="text-lg font-black text-[#1A1A1A]">لا توجد براندات مضافة حتى الآن</h4>
                <p className="text-xs text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
                  ابدأ بإنشاء البراندات الفاخرة التي يفضلها عملاؤك (مثل: زارا، نايكي، شانيل، أديداس، غوتشي، لويس فيتون).
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddBrand}
                  className="px-6 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول براند</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {brands
                  .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()) || (b.description && b.description.includes(brandSearch)))
                  .map((brand) => {
                    const brandProductsCount = products.filter(
                      (p) => p.brandId === brand.id || p.brandName === brand.name
                    ).length;

                    return (
                      <div
                        key={brand.id}
                        className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between shadow-sm ${
                          brand.isActive
                            ? 'bg-white border-[#E5DFD7] hover:border-[#D4AF37]'
                            : 'bg-[#FAF9F7] border-[#E5DFD7] opacity-75'
                        }`}
                      >
                        {/* Cover Image or Gradient */}
                        <div className="h-24 w-full relative bg-gradient-to-r from-[#F4F1EA] to-[#EAE3D5] overflow-hidden">
                          {brand.coverImage && (
                            <img
                              src={brand.coverImage}
                              alt={brand.name}
                              className="w-full h-full object-cover opacity-80"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />

                          {/* Status Badge */}
                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                brand.isActive
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-[#F4F1EA] border-[#E5DFD7] text-[#6B6B6B]'
                              }`}
                            >
                              {brand.isActive ? 'نشط بالواجهة' : 'معطل'}
                            </span>
                          </div>
                        </div>

                        {/* Brand Body */}
                        <div className="p-4 pt-0 relative space-y-3 flex-1 flex flex-col justify-between">
                          <div className="flex items-end gap-3 -mt-8">
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#E5DFD7] p-2 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0 flex-1 pb-1">
                              <h4 className="font-black text-sm text-[#1A1A1A] truncate">{brand.name}</h4>
                              <p className="text-[11px] text-[#8B6F15] font-bold">
                                {brandProductsCount} منتج مرتبط
                              </p>
                            </div>
                          </div>

                          {brand.description && (
                            <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed">
                              {brand.description}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="pt-3 border-t border-[#E5DFD7] flex items-center justify-between gap-2">
                            {/* Toggle Active Button */}
                            <button
                              type="button"
                              onClick={() => toggleBrandActive(brand.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                brand.isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-[#F4F1EA] text-[#6B6B6B] hover:bg-[#E5DFD7] border border-[#E5DFD7]'
                              }`}
                            >
                              {brand.isActive ? 'تعطيل' : 'تفعيل'}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditBrand(brand)}
                                className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] hover:bg-[#8B2635] hover:text-white hover:border-[#8B2635] text-[#1A1A1A] transition-all cursor-pointer"
                                title="تعديل البراند"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmBrand(brand)}
                                className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] hover:bg-rose-600 hover:text-white hover:border-rose-600 text-rose-700 transition-all cursor-pointer"
                                title="حذف البراند"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: COUPONS & PROMO BANNER MANAGEMENT
           ========================================================================= */}
        {adminTab === 'coupons' && (
          <div className="space-y-6">
            {/* Top Banner Control Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-white to-[#F4F1EA] border border-[#D4AF37]/40 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                    <Percent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                      <span>إدارة البانر العلوي وكود الخصم المعروض للعملاء</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8B6F15] text-[10px] font-black">
                        مباشر في أعلى المتجر
                      </span>
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      الكود النشط حالياً في الشريط العلوي:{' '}
                      <span className="font-mono font-bold text-[#8B2635] bg-[#FAF9F7] px-2 py-0.5 rounded border border-[#E5DFD7]">
                        {appSettings?.featuredCouponCode || 'DAJJAH10'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateAppSettings({
                        promoBannerText: promoBannerInput,
                      });
                      setStatusMessage({ type: 'success', text: 'تم تحديث نص البانر العلوي بنجاح!' });
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ نص البانر</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                  نص الشريط العلوي الترويجي
                </label>
                <input
                  type="text"
                  value={promoBannerInput}
                  onChange={(e) => setPromoBannerInput(e.target.value)}
                  placeholder="أدخل النص الترويجي المعروض في أعلى الموقع..."
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                />
              </div>
            </div>

            {/* Create New Coupon & Coupons List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to Add Coupon */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#8B2635]">
                  <Tag className="w-5 h-5" />
                  <h3 className="text-base font-black text-[#1A1A1A]">إضافة كود خصم جديد</h3>
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  أنشئ كوبونات خصم بنسبة مئوية أو بمبلغ يمني ثابت.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">رمز الكود (مثال: YEMEN2026)</label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="DAJJAH20"
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#8B2635] uppercase focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">نوع الخصم</label>
                      <select
                        value={newDiscountType}
                        onChange={(e) => setNewDiscountType(e.target.value as 'percentage' | 'fixed_yer')}
                        className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      >
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed_yer">مبلغ ثابت (ر.ي)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                        قيمة الخصم ({newDiscountType === 'percentage' ? '%' : 'ر.ي'})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newDiscountValue}
                        onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                        className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">الحد الأدنى لقيمة الطلب (ر.ي)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={newMinOrder}
                      onChange={(e) => setNewMinOrder(Number(e.target.value))}
                      placeholder="0 = بدون حد أدنى"
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">وصف الكود والمناسبة</label>
                    <input
                      type="text"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="مثال: خصم 20% بمناسبة عروض الأسبوع"
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newCouponCode.trim()) {
                        setStatusMessage({ type: 'error', text: 'يرجى إدخال رمز الكود أولاً' });
                        return;
                      }
                      saveCoupon({
                        id: `coupon-${Date.now()}`,
                        code: newCouponCode.trim(),
                        discountType: newDiscountType === 'percentage' ? 'percentage' : 'fixed',
                        discountValue: newDiscountValue,
                        minOrderYER: newMinOrder,
                        description: newCouponDesc.trim() || `خصم ${newDiscountValue}${newDiscountType === 'percentage' ? '%' : ' ر.ي'}`,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                      });
                      setNewCouponCode('');
                      setNewCouponDesc('');
                      setStatusMessage({ type: 'success', text: `تم إضافة كود الخصم "${newCouponCode.trim()}" بنجاح!` });
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة وحفظ الكود</span>
                  </button>
                </div>
              </div>

              {/* Coupons List Table */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[#8B6F15]" />
                    <h3 className="text-base font-black text-[#1A1A1A]">قائمة كوبونات الخصم النشطة ({coupons.length})</h3>
                  </div>
                  <span className="text-xs text-[#6B6B6B]">انقر لعرض الكود في الشريط العلوي</span>
                </div>

                <div className="space-y-3">
                  {coupons.map((cp) => {
                    const isFeatured = (appSettings?.featuredCouponCode || 'DAJJAH10') === cp.code;
                    return (
                      <div
                        key={cp.id || cp.code}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isFeatured
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-sm'
                            : 'bg-[#FAF9F7] border-[#E5DFD7]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15] font-mono font-black text-sm">
                            %
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-sm text-[#8B2635]">{cp.code}</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#F4F1EA] border border-[#E5DFD7] text-[10px] font-bold text-[#1A1A1A]">
                                {cp.discountType === 'percentage' ? `خصم ${cp.discountValue}%` : `خصم ${formatPrice(cp.discountValue)}`}
                              </span>
                              {isFeatured && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8B6F15] text-[10px] font-black">
                                  معروض في البانر العلوي ⭐
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cp.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                {cp.isActive ? 'مفعل' : 'معطل'}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B6B6B] mt-1">{cp.description}</p>
                            {cp.minOrderYER && cp.minOrderYER > 0 ? (
                              <p className="text-[10px] text-[#6B6B6B]">الحد الأدنى: {formatPrice(cp.minOrderYER)}</p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setFeaturedCoupon(cp.code);
                              setStatusMessage({ type: 'success', text: `تم تعيين ${cp.code} ككود معروض في البانر العلوي للمتجر!` });
                              setTimeout(() => setStatusMessage(null), 3000);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isFeatured
                                ? 'bg-[#8B2635] text-white'
                                : 'bg-white border border-[#E5DFD7] hover:bg-[#F4F1EA] text-[#1A1A1A]'
                            }`}
                          >
                            {isFeatured ? 'الرمز النشط في البانر' : 'عرض في البانر العلوي'}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCouponActive(cp.code)}
                            className="p-2 rounded-xl bg-white border border-[#E5DFD7] hover:bg-[#F4F1EA] text-[#1A1A1A] transition-colors cursor-pointer"
                            title={cp.isActive ? 'تعطيل الكود' : 'تفعيل الكود'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteCoupon(cp.code);
                              setStatusMessage({ type: 'success', text: `تم حذف كود الخصم ${cp.code}` });
                              setTimeout(() => setStatusMessage(null), 3000);
                            }}
                            className="p-2 rounded-xl bg-white border border-[#E5DFD7] hover:bg-rose-600 text-rose-700 hover:text-white transition-colors cursor-pointer"
                            title="حذف الكود"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: EXCHANGE RATES MANAGEMENT
           ========================================================================= */}
        {adminTab === 'rates' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2 flex-wrap">
                      <span>إدارة وتعديل أسعار صرف العملات اليمنية والدولية</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        تحديث فوري لجميع المنتجات
                      </span>
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      تنعكس هذه الأسعار مباشرة في حساب أسعار السلع والسلة وإجمالي الفواتير للعملاء.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateCurrencyRates({
                      YER_NORTH: Number(northRate) || 1.0,
                      YER_SOUTH: Number(southRate) || 3.0,
                      USD: Number(usdRate) || 0.0018868,
                      SAR: Number(sarRate) || 0.0071428,
                    });
                    setStatusMessage({ type: 'success', text: 'تم حفظ وتحديث أسعار الصرف لجميع المحافظات بنجاح!' });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ أسعار الصرف الحية</span>
                </button>
              </div>

              {/* Rate Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                  <span className="text-xs font-bold text-[#6B6B6B]">صنعاء ومحافظات الشمال (الريال القديم)</span>
                  <div className="text-lg font-black text-[#8B6F15]">1.0 (العملة الأساسية)</div>
                  <input
                    type="number"
                    step="0.1"
                    disabled
                    value={1.0}
                    className="w-full bg-[#F4F1EA] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-mono text-[#6B6B6B] cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#6B6B6B]">معامل التحويل الأساسي للمتجر = 1.0</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">عدن ومحافظات الجنوب (الريال الجديد)</span>
                  <div className="text-lg font-black text-[#8B2635]">× {southRate}</div>
                  <input
                    type="number"
                    step="0.05"
                    value={southRate}
                    onChange={(e) => setSouthRate(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                  <p className="text-[10px] text-[#6B6B6B]">1 ريال شمال = {southRate} ريال جنوب</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">الدولار الأمريكي (USD)</span>
                  <div className="text-lg font-black text-emerald-700">$ {(1 / usdRate).toFixed(0)} ر.ي</div>
                  <input
                    type="number"
                    step="0.00001"
                    value={usdRate}
                    onChange={(e) => setUsdRate(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                  <p className="text-[10px] text-[#6B6B6B]">$1 دولار = {(1 / usdRate).toFixed(1)} ر.ي شمال</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">الريال السعودي (SAR)</span>
                  <div className="text-lg font-black text-sky-700">{(1 / sarRate).toFixed(0)} ر.ي</div>
                  <input
                    type="number"
                    step="0.00001"
                    value={sarRate}
                    onChange={(e) => setSarRate(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                  <p className="text-[10px] text-[#6B6B6B]">1 ريال سعودي = {(1 / sarRate).toFixed(1)} ر.ي شمال</p>
                </div>
              </div>

              {/* Instant Live Price Calculator Preview */}
              <div className="p-5 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-3">
                <div className="flex items-center gap-2 text-[#8B6F15]">
                  <Calculator className="w-4 h-4" />
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">حاسبة معاينة الأسعار الفورية</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] text-[#6B6B6B] mb-1">مبلغ الاختبار (شمال):</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1A1A]"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7] text-center">
                    <span className="block text-[10px] text-[#6B6B6B]">صنعاء</span>
                    <span className="text-xs font-black text-[#8B6F15]">{calcAmount.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7] text-center">
                    <span className="block text-[10px] text-[#6B6B6B]">عدن</span>
                    <span className="text-xs font-black text-[#8B2635]">{(calcAmount * southRate).toLocaleString()} ر.ي</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7] text-center">
                    <span className="block text-[10px] text-[#6B6B6B]">دولار أمريكي</span>
                    <span className="text-xs font-black text-emerald-700">${(calcAmount * usdRate).toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7] text-center">
                    <span className="block text-[10px] text-[#6B6B6B]">ريال سعودي</span>
                    <span className="text-xs font-black text-sky-700">{(calcAmount * sarRate).toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CONTACT INFO & STORE SUPPORT
           ========================================================================= */}
        {adminTab === 'contact' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A]">إدارة معلومات الاتصال وخدمة العملاء</h3>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      تظهر هذه البيانات في تذييل الموقع، صفحات الحساب، ورسائل الدعم والتواصل.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateAppSettings({
                      contactPhone,
                      contactWhatsapp,
                      contactEmail,
                      contactAddress,
                      supportHours: contactHours,
                    });
                    setStatusMessage({ type: 'success', text: 'تم حفظ وتحديث معلومات الاتصال بنجاح!' });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ معلومات الاتصال</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8B6F15]" />
                    <span>رقم الهاتف المباشر</span>
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                    <span>رقم الواتساب المعتمد (WhatsApp)</span>
                  </label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-700" />
                    <span>البريد الإلكتروني للدعم</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8B6F15]" />
                    <span>ساعات الدعم والعمل</span>
                  </label>
                  <input
                    type="text"
                    value={contactHours}
                    onChange={(e) => setContactHours(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-700" />
                    <span>العنوان الجغرافي والمستودعات</span>
                  </label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: USER & ADMIN GUIDE (دليل الاستخدام والترحيب)
           ========================================================================= */}
        {adminTab === 'guide' && (
          <div className="space-y-6">
            {/* Guide Header */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1A1A]">دليل الاستخدام والترحيب الشامل — ضَجّة مول</h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    مرجع كامل للمستخدمين والمالك لشرح كيفية الاستفادة القصوى من كافة ميزات المنصة.
                  </p>
                </div>
              </div>

              {/* Subtabs for Guide */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#E5DFD7]">
                {[
                  { id: 'overview', label: '🌟 نظرة عامة' },
                  { id: 'customer', label: '🛍️ خطوات الشراء والتوصيل' },
                  { id: 'ai', label: '🤖 الذكاء الاصطناعي الفائق' },
                  { id: 'wallets', label: '💳 المحافظ وطرق الدفع' },
                  { id: 'admin', label: '🛡️ دليل إدارة المالك' },
                ].map((gt) => (
                  <button
                    key={gt.id}
                    onClick={() => setGuideTab(gt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      guideTab === gt.id
                        ? 'bg-[#8B2635] text-white font-black'
                        : 'bg-[#FAF9F7] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E5DFD7]'
                    }`}
                  >
                    {gt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Content Cards */}
            {guideTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#8B6F15] font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>مفهوم ضَجّة مول</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    منصة التسوق الإلكتروني الأولى في اليمن المصممة بأعلى معايير السرعة والكفاءة، تدعم التبديل السلس بين عملتي الشمال والجنوب مع تسعير حقيقي ودقيق.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#8B6F15] font-bold">
                    <Truck className="w-5 h-5" />
                    <span>المعاينة قبل الدفع</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    حق المعاينة الكاملة عند استلام الطلب من مندوب التوصيل قبل دفع أي ريال، لضمان رضا وثقة العميل 100%.
                  </p>
                </div>
              </div>
            )}

            {guideTab === 'customer' && (
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-[#8B2635]">خطوات الشراء والتتبع في 3 خطوات بسيطة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-black text-xs">1</div>
                    <h5 className="font-bold text-[#1A1A1A] text-xs">اختر المنتج والمقاس واللون</h5>
                    <p className="text-[11px] text-[#6B6B6B]">تصفح الأقسام أو ابحث بالذكاء الاصطناعي واختر مواصفاتك المناسبة.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-black text-xs">2</div>
                    <h5 className="font-bold text-[#1A1A1A] text-xs">أدخل العنوان وكود الخصم</h5>
                    <p className="text-[11px] text-[#6B6B6B]">حدد مدينتك ورقم هاتفك واستخدم كود الخصم الفعال لتوفير المال.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#8B2635] text-white flex items-center justify-center font-black text-xs">3</div>
                    <h5 className="font-bold text-[#1A1A1A] text-xs">استلم وعاين مجانًا</h5>
                    <p className="text-[11px] text-[#6B6B6B]">تابع حركة مندوب التوصيل في شاشة التتبع واستلم طلبك بضمانة تامة.</p>
                  </div>
                </div>
              </div>
            )}

            {guideTab === 'ai' && (
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#8B6F15] font-bold">
                  <Sparkles className="w-5 h-5" />
                  <span>مساعد التسوق الذكي المدعوم بـ Google Gemini</span>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  يستطيع المساعد الذكي في ضَجّة مول التعرف على طلب العميل بدقة (مثل: "أريد فستان بناتي للعيد مقاس 4 سنين بسعر أقل من 15 ألف") وعرض صور المنتج وروابطه المباشرة داخل المحادثة وإضافتها للسلة بنقرة واحدة.
                </p>
              </div>
            )}

            {guideTab === 'wallets' && (
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#8B6F15] font-bold">
                  <CreditCard className="w-5 h-5" />
                  <span>المحافظ الرقمية والتحويل المالي المعتمد</span>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  ندعم بنك الكريمي (حساب مميز)، محفظة جيب، ون كاش، النجم للحوالات، محفظة فلوسك، بالإضافة للدفع نقدًا عند المعاينة والاستلام.
                </p>
              </div>
            )}

            {guideTab === 'admin' && (
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-[#8B6F15] font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>صلاحيات المالك المستقلة</span>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  يمكنك من هذه اللوحة إضافة المنتجات وتعديل صورها ومخزونها، تغيير أسعار الصرف، إضافة أكواد الخصم، وتعديل بيانات التواصل وإرسال الإشعارات بدون الحاجة إلى Google AI Studio.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 7: ORDERS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Filter & Search */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#6B6B6B] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب أو اسم العميل..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#8B2635]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'جميع الطلبات' },
                  { id: 'received', label: '📥 جديد' },
                  { id: 'processing', label: '⚙️ قيد التجهيز' },
                  { id: 'out_for_delivery', label: '🚚 في الطريق' },
                  { id: 'delivered', label: '✅ تم التسليم' },
                  { id: 'cancelled', label: '❌ ملغي' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === st.id
                        ? 'bg-[#8B2635] text-white font-black'
                        : 'bg-[#FAF9F7] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E5DFD7]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#E5DFD7] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#F4F1EA] border-b border-[#E5DFD7] text-[11px] font-black text-[#6B6B6B] uppercase tracking-wider">
                      <th className="p-4">رقم الطلب والتاريخ</th>
                      <th className="p-4">العميل والمدينة</th>
                      <th className="p-4">المنتجات</th>
                      <th className="p-4">المبلغ الإجمالي</th>
                      <th className="p-4">طريقة الدفع</th>
                      <th className="p-4">حالة الطلب</th>
                      <th className="p-4 text-center">إجراءات الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD7]/60 text-xs text-[#1A1A1A]">
                    {orders
                      .filter((o) => {
                        const matchesSearch =
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          (o.shippingAddress?.fullName && o.shippingAddress.fullName.includes(orderSearch)) ||
                          (o.shippingAddress?.city && o.shippingAddress.city.includes(orderSearch));
                        const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((ord) => {
                        const statusColors: Record<string, string> = {
                          received: 'bg-blue-50 text-blue-700 border-blue-200',
                          processing: 'bg-amber-50 text-amber-800 border-amber-200',
                          out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
                          delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                        };

                        const statusLabels: Record<string, string> = {
                          received: 'طلب جديد',
                          processing: 'قيد التجهيز',
                          out_for_delivery: 'في الطريق للتسليم',
                          delivered: 'تم التسليم بنجاح',
                          cancelled: 'ملغي',
                        };

                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF9F7] transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-[#1A1A1A] text-xs">{ord.orderNumber || ord.id}</div>
                              <div className="text-[10px] text-[#6B6B6B]">
                                {new Date(ord.createdAt).toLocaleDateString('ar-YE')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-[#1A1A1A]">{ord.shippingAddress?.fullName || 'عميل ضَجّة'}</div>
                              <div className="text-[10px] text-[#6B6B6B] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#8B6F15]" />
                                <span>{ord.shippingAddress?.city || 'صنعاء'} - {ord.shippingAddress?.streetAddress || ''}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs text-[#1A1A1A] font-bold">
                                {ord.items.length} قطع
                              </div>
                              <div className="text-[10px] text-[#6B6B6B] truncate max-w-[160px]">
                                {ord.items.map((i) => i.name).join('، ')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-black text-[#8B2635] text-sm">
                                {formatPrice(ord.totalYER)}
                              </div>
                              <div className="text-[10px] text-[#6B6B6B]">
                                رسوم توصيل: {formatPrice(ord.shippingFeeYER || 0)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-md bg-[#F4F1EA] border border-[#E5DFD7] text-[10px] font-bold text-[#1A1A1A]">
                                {ord.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام' : 'محفظة إلكترونية'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusColors[ord.status] || 'bg-[#F4F1EA] text-[#6B6B6B] border-[#E5DFD7]'}`}>
                                {statusLabels[ord.status] || ord.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                  className="bg-[#FAF9F7] border border-[#E5DFD7] text-[#1A1A1A] rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-[#8B2635] cursor-pointer"
                                >
                                  <option value="received">جديد (استلام)</option>
                                  <option value="processing">تجهيز وتغليف</option>
                                  <option value="out_for_delivery">خرج للتوصيل</option>
                                  <option value="delivered">تم التسليم</option>
                                  <option value="cancelled">إلغاء الطلب</option>
                                </select>
                                <button
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="p-1.5 rounded-lg bg-[#F4F1EA] border border-[#E5DFD7] hover:bg-[#8B2635] hover:text-white text-[#1A1A1A] transition-all"
                                  title="عرض الفاتورة وتفاصيل الشحن"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CUSTOMERS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5DFD7] rounded-3xl overflow-hidden shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-4 mb-4">
                <div>
                  <h3 className="text-base font-black text-[#1A1A1A]">قائمة العملاء والمستخدمين</h3>
                  <p className="text-xs text-[#6B6B6B]">سجل المستخدمين المسجلين في المنصة عبر Firebase</p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8B6F15] text-xs font-bold">
                  إجمالي العملاء: {users.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#F4F1EA] border-b border-[#E5DFD7] text-[11px] font-black text-[#6B6B6B] uppercase">
                      <th className="p-3">الاسم</th>
                      <th className="p-3">رقم الهاتف / البريد</th>
                      <th className="p-3">المدينة</th>
                      <th className="p-3">نوع الحساب</th>
                      <th className="p-3">الرصيد / النقاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD7]/60 text-xs text-[#1A1A1A]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF9F7]">
                        <td className="p-3 font-bold text-[#1A1A1A]">{u.fullName || u.displayName || 'عميل'}</td>
                        <td className="p-3 font-mono text-[#6B6B6B]">{u.phone || u.email || '—'}</td>
                        <td className="p-3">{u.city || 'صنعاء'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            u.role === 'admin' ? 'bg-[#8B2635] text-white' : 'bg-[#F4F1EA] border border-[#E5DFD7] text-[#1A1A1A]'
                          }`}>
                            {u.role === 'admin' ? 'مالك المنصة' : 'عميل معتمد'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#8B6F15]">{u.loyaltyPoints || 120} نقطة</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: SETTINGS, PROMO BUTTONS & BROADCAST NOTIFICATIONS
           ========================================================================= */}
        {adminTab === 'settings' && (
          <div className="space-y-6">
            {/* 1. Home Promo Buttons Live Manager (الفلاش سيل والشحن المجاني) */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD7] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A]">إدارة زري العروض والشحن في الصفحة الرئيسية</h3>
                    <p className="text-xs text-[#6B6B6B]">تحكم كامل بالنصوص، الروابط، الأيقونات، وحالة التفعيل/التعطيل مع الحفظ المباشر في Firestore</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePromoButtons}
                  disabled={isSavingPromoButtons}
                  className="px-5 py-2 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  {isSavingPromoButtons ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>حفظ إعدادات الأزرار</span>
                </button>
              </div>

              {promoButtonsSaveSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ وتحديث إعدادات الأزرار في Firestore بنجاح! ستظهر فوراً للمستخدمين.</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {promoButtonsState.map((btn, index) => (
                  <div
                    key={btn.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      btn.enabled
                        ? 'bg-[#FAF9F7] border-[#E5DFD7] shadow-sm'
                        : 'bg-[#FAF9F7]/60 border-[#E5DFD7] opacity-75'
                    }`}
                  >
                    {/* Header with Enable Switch */}
                    <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#F4F1EA] border border-[#E5DFD7] text-[#8B6F15] text-xs font-black flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-black text-[#1A1A1A]">
                          {index === 0 ? 'الزر الأول: الفلاش سيل / التخفيضات' : 'الزر الثاني: الشحن المجاني'}
                        </h4>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={btn.enabled}
                          onChange={(e) => {
                            const updated = [...promoButtonsState];
                            updated[index].enabled = e.target.checked;
                            setPromoButtonsState(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#E5DFD7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5DFD7] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B2635]"></div>
                        <span className="mr-2 text-xs font-bold text-[#1A1A1A]">
                          {btn.enabled ? 'مفعل ويظهر' : 'معطل ومخفي'}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Arabic / English Titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">العنوان الرئيسي (عربي)</label>
                          <input
                            type="text"
                            value={btn.titleAr}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].titleAr = e.target.value;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">العنوان الرئيسي (English)</label>
                          <input
                            type="text"
                            value={btn.titleEn || ''}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].titleEn = e.target.value;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-bold"
                          />
                        </div>
                      </div>

                      {/* Arabic / English Subtitles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">النص الفرعي (عربي)</label>
                          <input
                            type="text"
                            value={btn.subtitleAr}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].subtitleAr = e.target.value;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">النص الفرعي (English)</label>
                          <input
                            type="text"
                            value={btn.subtitleEn || ''}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].subtitleEn = e.target.value;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                          />
                        </div>
                      </div>

                      {/* Link Type & Target */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">نوع الرابط أو الوجهة</label>
                          <select
                            value={btn.linkType}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].linkType = e.target.value as any;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] cursor-pointer"
                          >
                            <option value="category">قسم معين (Category)</option>
                            <option value="cart">حقيبة التسوق (Cart)</option>
                            <option value="page">صفحة داخلية (Page)</option>
                            <option value="external">رابط خارجي (URL)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">
                            {btn.linkType === 'category' ? 'اختر القسم' : 'الرابط أو المعرف'}
                          </label>
                          {btn.linkType === 'category' ? (
                            <select
                              value={btn.linkTarget}
                              onChange={(e) => {
                                const updated = [...promoButtonsState];
                                updated[index].linkTarget = e.target.value;
                                setPromoButtonsState(updated);
                              }}
                              className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] cursor-pointer"
                            >
                              <option value="women">نساء</option>
                              <option value="boys">ولادي</option>
                              <option value="girls">بناتي</option>
                              <option value="baby">مواليد</option>
                              <option value="shoes">أحذية</option>
                              <option value="bags">شنط</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={btn.linkTarget}
                              onChange={(e) => {
                                const updated = [...promoButtonsState];
                                updated[index].linkTarget = e.target.value;
                                setPromoButtonsState(updated);
                              }}
                              placeholder={btn.linkType === 'external' ? 'https://...' : 'cart أو categories'}
                              className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-mono text-xs"
                            />
                          )}
                        </div>
                      </div>

                      {/* Icon Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">الأيقونة</label>
                          <select
                            value={btn.icon}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].icon = e.target.value as any;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] cursor-pointer"
                          >
                            <option value="flame">🔥 لهب (Flame)</option>
                            <option value="truck">🚚 شاحنة (Truck)</option>
                            <option value="tag">🏷️ بطاقة خصم (Tag)</option>
                            <option value="sparkles">✨ بريق (Sparkles)</option>
                            <option value="percent">٪ نسبة (Percent)</option>
                            <option value="shield">🛡️ درع أمان (Shield)</option>
                            <option value="gift">🎁 هدية (Gift)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">الحجم</label>
                          <select
                            value={btn.size}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].size = e.target.value as any;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] cursor-pointer"
                          >
                            <option value="sm">صغير ومدمج (Compact - موصى به)</option>
                            <option value="md">متوسط (Medium)</option>
                            <option value="lg">كبير (Large)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#6B6B6B] font-bold mb-1">لون التمييز</label>
                          <select
                            value={btn.color}
                            onChange={(e) => {
                              const updated = [...promoButtonsState];
                              updated[index].color = e.target.value as any;
                              setPromoButtonsState(updated);
                            }}
                            className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] cursor-pointer"
                          >
                            <option value="purple">بنفسجي ملكي (Royal Purple)</option>
                            <option value="emerald">زمردي مبهج (Emerald Green)</option>
                            <option value="amber">ذهبي كهرماني (Amber Gold)</option>
                            <option value="rose">وردي ناري (Rose Red)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Broadcast Notifications & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Broadcast Push Notifications */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#8B2635]">
                  <Send className="w-5 h-5" />
                  <h3 className="text-base font-black text-[#1A1A1A]">إرسال إشعار ترويجي فوري للعملاء</h3>
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  يصل هذا الإشعار مباشرة إلى جميع مستخدمي التطبيق في شريط الإشعارات وقسم التنبيهات.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">عنوان الإشعار</label>
                    <input
                      type="text"
                      placeholder="مثال: خصم 30% على تشكيلة الصيف الجديدة! 🔥"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1">نص الرسالة</label>
                    <textarea
                      rows={3}
                      placeholder="اكتب تفاصيل العرض أو التنبيه..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!broadcastTitle.trim()) return;
                      setBroadcastSuccess(true);
                      setBroadcastTitle('');
                      setBroadcastBody('');
                      setTimeout(() => setBroadcastSuccess(false), 3000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>بث الإشعار الآن</span>
                  </button>

                  {broadcastSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>تم بث الإشعار لجميع العملاء بنجاح!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Fees & Payment Methods Information */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5DFD7] space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#8B6F15]">
                  <Truck className="w-5 h-5" />
                  <h3 className="text-base font-black text-[#1A1A1A]">رسوم التوصيل والمحافظ المعتمدة</h3>
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  إعدادات التوصيل الفوري وتغطية المحافظات اليمنية وبوابات الدفع الإلكتروني
                </p>

                <div className="space-y-2 pt-2">
                  {[
                    { city: 'أمانة العاصمة — صنعاء', fee: 'مجاني للطلبات فوق 20,000 ر.ي (أو 1,500 ر.ي)' },
                    { city: 'محافظة عدن', fee: '2,500 ر.ي (توصيل سريع 24 ساعة)' },
                    { city: 'محافظة تعز', fee: '3,000 ر.ي' },
                    { city: 'محافظة إب والحديدة', fee: '2,500 ر.ي' },
                    { city: 'حضرموت ومأرب', fee: '3,500 ر.ي' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#FAF9F7] border border-[#E5DFD7] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1A1A1A]">{item.city}</span>
                      <span className="text-[#6B6B6B] text-[11px]">{item.fee}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E5DFD7]">
                  <h4 className="text-xs font-bold text-[#1A1A1A] mb-2">المحافظ الإلكترونية النشطة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['الكريمي جوال', 'النجم للحوالات', 'محفظة فلوسك', 'جيب (Jeeb)', 'ون كاش (OneCash)', 'الدفع عند الاستلام'].map((w) => (
                      <span key={w} className="px-2.5 py-1 rounded-lg bg-[#FAF9F7] border border-[#E5DFD7] text-[10px] font-bold text-[#1A1A1A]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* =========================================================================
            TAB 11: BANNERS & HERO SLIDER MANAGEMENT
           ========================================================================= */}
        {adminTab === 'banners' && (
          <div className="space-y-6">
            <AdminBannersManager />
          </div>
        )}

        {/* =========================================================================
            TAB 12: POPUP OFFERS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'popups' && (
          <div className="space-y-6">
            <AdminPopupManager />
          </div>
        )}

        {/* =========================================================================
            TAB 13: POLICIES & LEGAL TERMS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'policies' && (
          <div className="space-y-6">
            <AdminPoliciesManager />
          </div>
        )}

        {/* =========================================================================
            TAB 14: SOCIAL MEDIA CHANNELS MANAGEMENT
           ========================================================================= */}
        {adminTab === 'social' && (
          <div className="space-y-6">
            <AdminSocialMediaManager />
          </div>
        )}

        {/* =========================================================================
            TAB 14.5: BRANCHES & PHYSICAL LOCATIONS
           ========================================================================= */}
        {adminTab === 'branches' && (
          <div className="space-y-6">
            <AdminBranchesManager />
          </div>
        )}

        {/* =========================================================================
            TAB 14.6: FOOTER & BOTTOM BAR CONTROLS
           ========================================================================= */}
        {adminTab === 'footer' && (
          <div className="space-y-6">
            <AdminFooterManager onNavigateTab={(tab) => setAdminTab(tab as AdminDashboardTab)} />
          </div>
        )}

        {/* =========================================================================
            TAB 15: AI KNOWLEDGE BASE & SETTINGS
           ========================================================================= */}
        {adminTab === 'aiKnowledge' && (
          <div className="space-y-6">
            <AdminAIKnowledgeManager />
          </div>
        )}

        {/* =========================================================================
            TAB 16: ANALYTICS & REVENUE DASHBOARD
           ========================================================================= */}
        {adminTab === 'analytics' && (
          <div className="space-y-6">
            <AdminAnalyticsDashboard />
          </div>
        )}

        {/* =========================================================================
            TAB 17: PAYMENT METHODS GATEWAYS
           ========================================================================= */}
        {adminTab === 'paymentMethods' && (
          <div className="space-y-6">
            <AdminPaymentMethodsManager />
          </div>
        )}

        {/* =========================================================================
            TAB 18: SHIPPING ZONES & FEES
           ========================================================================= */}
        {adminTab === 'shipping' && (
          <div className="space-y-6">
            <AdminShippingManager />
          </div>
        )}

        {/* =========================================================================
            TAB 19: FLASH SALES & TIMED DEALS
           ========================================================================= */}
        {adminTab === 'flashSales' && (
          <div className="space-y-6">
            <AdminFlashSalesManager />
          </div>
        )}

        {/* =========================================================================
            TAB 20: VOLUME DISCOUNTS (TIERED PRICING)
           ========================================================================= */}
        {adminTab === 'volumeDiscounts' && (
          <div className="space-y-6">
            <AdminVolumeDiscountsManager />
          </div>
        )}

        {/* =========================================================================
            TAB 21: ABANDONED CARTS RECOVERY
           ========================================================================= */}
        {adminTab === 'abandonedCarts' && (
          <div className="space-y-6">
            <AdminAbandonedCartManager />
          </div>
        )}

        {/* =========================================================================
            TAB 22: PRODUCT REVIEWS MODERATION
           ========================================================================= */}
        {adminTab === 'reviews' && (
          <div className="space-y-6">
            <AdminReviewsManager />
          </div>
        )}
      </main>

      {/* =========================================================================
          ORDER DETAILS MODAL
         ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-[#E5DFD7] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
              <div>
                <h3 className="font-black text-[#1A1A1A] text-base">فاتورة الطلب {selectedOrderDetails.orderNumber || selectedOrderDetails.id}</h3>
                <p className="text-xs text-[#6B6B6B]">{new Date(selectedOrderDetails.createdAt).toLocaleString('ar-YE')}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-1">
                <div className="font-bold text-[#1A1A1A]">معلومات العميل والشحن:</div>
                <div className="text-[#6B6B6B]">الاسم: <span className="text-[#1A1A1A] font-bold">{selectedOrderDetails.shippingAddress?.fullName}</span></div>
                <div className="text-[#6B6B6B]">الهاتف: <span className="text-[#1A1A1A] font-mono">{selectedOrderDetails.shippingAddress?.phone}</span></div>
                <div className="text-[#6B6B6B]">العنوان: <span className="text-[#1A1A1A]">{selectedOrderDetails.shippingAddress?.city} - {selectedOrderDetails.shippingAddress?.streetAddress}</span></div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#1A1A1A]">المنتجات المطلوبة:</div>
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F7] border border-[#E5DFD7]">
                    <div>
                      <div className="font-bold text-[#1A1A1A]">{item.name}</div>
                      <div className="text-[10px] text-[#6B6B6B]">الكمية: {item.quantity} {item.selectedSize ? `| المقاس: ${item.selectedSize}` : ''} {item.selectedColor ? `| اللون: ${item.selectedColor}` : ''}</div>
                    </div>
                    <div className="font-bold text-[#8B2635]">{formatPrice(item.priceYER * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-between font-black text-sm text-[#1A1A1A]">
                <span>المبلغ الإجمالي النهائي:</span>
                <span className="text-[#8B2635]">{formatPrice(selectedOrderDetails.totalYER)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] border border-[#E5DFD7] text-[#1A1A1A] font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT PRODUCT MODAL FORM
         ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-[#E5DFD7] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                  {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  يتم حفظ المنتج مباشرة في Cloud Firestore بدون الحاجة لتعديل الكود
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-6">
              {/* Product Basic Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    اسم المنتج بالعربية <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فستان سهرة ملكي مطرز باليد"
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    الاسم بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: Royal Embroidered Evening Gown"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                  وصف المنتج ومميزاته
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب وصفًا جذابًا يوضح خامة المنتج وتفاصيل تصميمه..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                />
              </div>

              {/* Category & Subcategory Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    القسم الرئيسي <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      const subList = categories.find((c) => c.id === newCat)?.subcategories || [];
                      if (subList.length > 0) setSubcategory(subList[0]);
                    }}
                    className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.englishName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    القسم الفرعي <span className="text-rose-600">*</span>
                  </label>
                  <div className="space-y-2">
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    >
                      {categories
                        .find((c) => c.id === category)
                        ?.subcategories.map((sub, idx) => (
                          <option key={idx} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>

                    <input
                      type="text"
                      placeholder="أو اكتب قسمًا فرعيًا مخصصًا جديدًا..."
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                  </div>
                </div>
              </div>

              {/* Standalone Brand Selector (Independent of Categories) */}
              <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-1.5">
                <label className="block text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B6F15]" />
                    <span>البراند / الماركة (مستقل تماماً عن الأقسام)</span>
                  </span>
                  <span className="text-[11px] text-[#8B6F15] font-medium">اختياري</span>
                </label>
                <select
                  value={productBrandId}
                  onChange={(e) => setProductBrandId(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                >
                  <option value="">بدون براند (منتج عام غير تابع لبراند محدد)</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {!b.isActive ? '(معطل)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6B6B6B]">
                  يمكن ربط أي منتج بأي براند مع الحفاظ على استقلالية البراندات عن الأقسام الرئيسية.
                </p>
              </div>

              {/* Price, Discount, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7]">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    سعر البيع (ريال يمني شمال) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceYER}
                    onChange={(e) => setPriceYER(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#8B2635] focus:outline-none focus:border-[#8B2635]"
                  />
                  <span className="text-[10px] text-[#6B6B6B] mt-1 block">
                    يتم تحويله تلقائيًا لليمني الجنوبي والدولار والريال السعودي
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    min={priceYER}
                    value={originalPriceYER}
                    onChange={(e) => setOriginalPriceYER(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                  {originalPriceYER > priceYER && (
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                      خصم {Math.round(((originalPriceYER - priceYER) / originalPriceYER) * 100)}%
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                    الكمية / المخزون <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                  />
                  <span className="text-[10px] text-[#6B6B6B] mt-1 block">
                    {stock > 0 ? 'متوفر بالمستودع' : 'نفد من المخزون'}
                  </span>
                </div>
              </div>

              {/* Product Images (Upload + URL) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#1A1A1A]">
                  صور المنتج (رفع من الجهاز أو إدخال روابط) <span className="text-rose-600">*</span>
                </label>

                {/* Upload Button + URL Input */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-4 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] font-bold text-xs flex items-center justify-center gap-2 border border-[#E5DFD7] transition-all cursor-pointer flex-shrink-0"
                  >
                    {isUploadingImage ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#8B6F15]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#8B6F15]" />
                    )}
                    <span>{isUploadingImage ? 'جاري التحسين والرفع...' : 'رفع صور من جهازك'}</span>
                  </button>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="أو الصق رابط صورة مباشرة..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] border border-[#E5DFD7] text-[#1A1A1A] font-bold text-xs"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail Grid */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#FAF9F7] border border-[#E5DFD7] group"
                    >
                      <img
                        src={imgUrl}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#8B2635] text-white text-[9px] font-black">
                          الرئيسية
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 left-1 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A]">
                  المقاسات المتوفرة
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSizes.includes(sz)
                          ? 'bg-[#8B2635] text-white font-black'
                          : 'bg-[#FAF9F7] text-[#6B6B6B] border border-[#E5DFD7] hover:border-[#D4AF37]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="مقاس مخصص..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="flex-1 bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3 py-1.5 text-xs text-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] text-xs font-bold text-[#1A1A1A] hover:bg-[#E5DFD7]"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Colors Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A]">
                  الألوان المتوفرة
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => handleAddColor(col)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#E5DFD7] hover:border-[#D4AF37] text-xs text-[#1A1A1A]"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#E5DFD7]"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Colors List */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F1EA] border border-[#E5DFD7] text-xs text-[#1A1A1A]"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#E5DFD7]"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="font-bold">{col.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-[#6B6B6B] hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Showcase & Marketing Feature Flags */}
              <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] space-y-3">
                <h4 className="text-xs font-black text-[#1A1A1A]">خيارات العرض والترويج في الواجهة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E5DFD7] cursor-pointer hover:border-[#D4AF37]">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8B2635] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[#8B6F15]" />
                        <span>الأكثر مبيعاً</span>
                      </div>
                      <span className="text-[10px] text-[#6B6B6B]">يظهر في تبويب الأكثر طلباً</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E5DFD7] cursor-pointer hover:border-blue-300">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>وصل حديثاً</span>
                      </div>
                      <span className="text-[10px] text-[#6B6B6B]">يظهر في قسم أحدث الإطلالات</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E5DFD7] cursor-pointer hover:border-rose-300">
                    <input
                      type="checkbox"
                      checked={isFlashDeal}
                      onChange={(e) => setIsFlashDeal(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-rose-600" />
                        <span>عروض وتخفيضات</span>
                      </div>
                      <span className="text-[10px] text-[#6B6B6B]">يظهر في عروض ضَجّة مول</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD7]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] font-bold text-xs sm:text-sm"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingProductId ? 'حفظ التعديلات في Firestore' : 'حفظ ونشر المنتج فوراً'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md">
          <div className="bg-white border border-[#E5DFD7] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A]">تأكيد حذف المنتج</h3>
            <p className="text-sm text-[#6B6B6B]">
              هل أنت متأكد من رغبتك في حذف المنتج:{' '}
              <span className="font-bold text-[#1A1A1A]">
                {deleteConfirmProduct.arabicName || deleteConfirmProduct.name}
              </span>
              ؟ سيتم حذفه نهائيًا من قاعدة بيانات Firestore.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-3 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] font-bold text-sm"
              >
                تراجع
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-sm"
              >
                نعم، احذف المنتج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT BRAND MODAL
         ========================================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-[#E5DFD7] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B6F15]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A]">
                    {editingBrandId ? 'تعديل بيانات البراند' : 'إضافة براند جديد للمتجر'}
                  </h3>
                  <p className="text-xs text-[#6B6B6B]">
                    نظام براند مستقل تماماً لإبراز العلامات التجارية الشهيرة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {brandStatusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  brandStatusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {brandStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{brandStatusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveBrand} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                  اسم البراند / الماركة <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ZARA, Nike, Chanel, Gucci..."
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-bold"
                />
              </div>

              {/* Brand Logo Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A]">
                  شعار البراند (Logo) <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={brandLogoInputRef}
                    accept="image/*"
                    onChange={handleBrandLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => brandLogoInputRef.current?.click()}
                    disabled={isUploadingBrandLogo}
                    className="px-4 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#E5DFD7]"
                  >
                    {isUploadingBrandLogo ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#8B6F15]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#8B6F15]" />
                    )}
                    <span>{isUploadingBrandLogo ? 'جاري الرفع...' : 'رفع من الجهاز'}</span>
                  </button>

                  <input
                    type="url"
                    placeholder="أو ضع رابط صورة الشعار مباشرة..."
                    value={brandLogoInput}
                    onChange={(e) => setBrandLogoInput(e.target.value)}
                    className="flex-1 bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-mono"
                  />
                </div>

                {/* Logo Preview */}
                {brandLogoInput && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] mt-2">
                    <div className="w-14 h-14 rounded-xl bg-white border border-[#E5DFD7] p-2 flex items-center justify-center shrink-0">
                      <img
                        src={brandLogoInput}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs text-[#6B6B6B]">
                      <span className="font-bold text-[#1A1A1A] block">معاينة الشعار</span>
                      يظهر كأيقونة مربعة أنيقة في قائمة البراندات
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Cover Banner (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
                  <span>صورة الغلاف / البانر للبراند</span>
                  <span className="text-[11px] text-[#6B6B6B] font-normal">اختياري</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={brandCoverInputRef}
                    accept="image/*"
                    onChange={handleBrandCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => brandCoverInputRef.current?.click()}
                    disabled={isUploadingBrandCover}
                    className="px-4 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#E5DFD7]"
                  >
                    {isUploadingBrandCover ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#8B6F15]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#8B6F15]" />
                    )}
                    <span>{isUploadingBrandCover ? 'جاري الرفع...' : 'رفع من الجهاز'}</span>
                  </button>

                  <input
                    type="url"
                    placeholder="أو رابط بانر عريض..."
                    value={brandCoverInput}
                    onChange={(e) => setBrandCoverInput(e.target.value)}
                    className="flex-1 bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635] font-mono"
                  />
                </div>

                {brandCoverInput && (
                  <div className="relative h-20 w-full rounded-2xl overflow-hidden bg-[#FAF9F7] border border-[#E5DFD7] mt-2">
                    <img
                      src={brandCoverInput}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center justify-between">
                  <span>نبذة تعريفية عن البراند</span>
                  <span className="text-[11px] text-[#6B6B6B] font-normal">اختياري</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر لمجموعات وتصاميم البراند..."
                  value={brandDescInput}
                  onChange={(e) => setBrandDescInput(e.target.value)}
                  className="w-full bg-[#FAF9F7] border border-[#E5DFD7] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B2635]"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F7] border border-[#E5DFD7] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A]">تفعيل البراند في واجهة المتجر</div>
                  <div className="text-[11px] text-[#6B6B6B]">
                    عند التفعيل، سيظهر البراند في صفحة البراندات للعملاء
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={brandIsActiveInput}
                  onChange={(e) => setBrandIsActiveInput(e.target.checked)}
                  className="w-5 h-5 rounded text-[#8B2635] focus:ring-0"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD7]">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] font-bold text-xs sm:text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#8B2635] hover:bg-[#721D2A] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBrandId ? 'حفظ تعديلات البراند' : 'إضافة البراند فوراً'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL FOR BRAND
         ========================================================================= */}
      {deleteConfirmBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-md">
          <div className="bg-white border border-[#E5DFD7] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A]">تأكيد حذف البراند</h3>
            <p className="text-sm text-[#6B6B6B]">
              هل أنت متأكد من حذف براند:{' '}
              <span className="font-bold text-[#1A1A1A]">{deleteConfirmBrand.name}</span>
              ؟ لن يتم حذف المنتجات المرتبطة به ولكن سيتم إلغاء ربط البراند منها.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBrand(null)}
                className="flex-1 py-3 rounded-xl bg-[#F4F1EA] hover:bg-[#E5DFD7] text-[#1A1A1A] font-bold text-sm"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDeleteBrand}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-sm"
              >
                نعم، احذف البراند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductDashboard;
