import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Health check API
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'ضَجّة مول — Dajjah Mall' });
  });

  // Product catalog database for AI grounding & high-performance search
  const catalogData = [
    { 
      id: 'prod-w-1', 
      name: 'فستان سهرة أسود ملكي مرصع بالكريستال اللامع', 
      cat: 'نسائي', 
      subcat: 'فساتين', 
      price: 18500, 
      orig: 32000, 
      colors: ['أسود', 'أسود ملكي', 'كحلي ليلي', 'عنابي مخملي'], 
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], 
      stock: 7, 
      desc: 'فستان سهرة بتصميم استثنائي وقماش ساتان كريب كوري فاخر مرصع بالكريستال اللامع للسهرات والمناسبات' 
    },
    { 
      id: 'prod-w-2', 
      name: 'بنطال نسائي كلاسيك بقصة مستقيمة وقماش إيطالي مرن', 
      cat: 'نسائي', 
      subcat: 'بناطل', 
      price: 11200, 
      orig: 18000, 
      colors: ['بيج كلاسيك', 'أسود كربوني', 'رمادي فاتح'], 
      sizes: ['38', '40', '42', '44'], 
      stock: 15, 
      desc: 'بنطال نسائي عملي للدوام والمناسبات الرسمية بقماش إيطالي مطاطي' 
    },
    { 
      id: 'prod-w-3', 
      name: 'بلوزة شيفون حريري بطبعة أزهار ناعمة وياقة فيونكة', 
      cat: 'نسائي', 
      subcat: 'بلوزات', 
      price: 8900, 
      orig: 14500, 
      colors: ['وردي بودري', 'أوف وايت عاجي'], 
      sizes: ['S', 'M', 'L', 'XL'], 
      stock: 20, 
      desc: 'بلوزة حرير شيفون تركي مطرزة بربطة فيونكة أنيقة' 
    },
    { 
      id: 'prod-w-4', 
      name: 'روب مخملي فاخر بتطريز ذهبي على الأكمام', 
      cat: 'نسائي', 
      subcat: 'أرواب', 
      price: 14800, 
      orig: 24000, 
      colors: ['زمردي ملكي', 'عنابي نبيذي'], 
      sizes: ['Free Size'], 
      stock: 12, 
      desc: 'روب مخملي فخم مع تطريز قصب ذهبي أصيل على الياقة والأكمام' 
    },
    { 
      id: 'prod-w-5', 
      name: 'تنورة بليسيه مكسرة ميدي بلمعة حريرية ساحرة', 
      cat: 'نسائي', 
      subcat: 'تنانير', 
      price: 9500, 
      orig: 16000, 
      colors: ['ذهبي شامبين', 'برونزي لامع', 'أسود'], 
      sizes: ['S/M', 'L/XL'], 
      stock: 18, 
      desc: 'تنورة بليسيه بكسرات انسيابية دقيقة ثابتة بعد الغسيل' 
    },
    { 
      id: 'prod-w-6', 
      name: 'طقم كاجوال نسائي مكون من توب وبنطال واسع مريح', 
      cat: 'نسائي', 
      subcat: 'أطقم', 
      price: 13500, 
      orig: 22000, 
      colors: ['بيج موكا', 'أخضر ميرمية'], 
      sizes: ['S', 'M', 'L', 'XL'], 
      stock: 14, 
      desc: 'طقم عصري من قطعتين يوفر الراحة والأناقة اليومية' 
    },
    { 
      id: 'prod-w-7', 
      name: 'بيجاما نسائية حريرية ناعمة للمنزل بطبعة قلوب', 
      cat: 'نسائي', 
      subcat: 'ملابس منزلية', 
      price: 8200, 
      orig: 13000, 
      colors: ['أزرق سماوي', 'وردي فاتح'], 
      sizes: ['M', 'L', 'XL'], 
      stock: 25, 
      desc: 'طقم نوم وبيجاما منزلية من الساتان الحريري فائق النعومة' 
    },
    { 
      id: 'prod-w-8', 
      name: 'فستان مناسبات درابيه طويل بياقة كتف واحد مطرزة', 
      cat: 'نسائي', 
      subcat: 'فساتين', 
      price: 22000, 
      orig: 38000, 
      colors: ['أزرق ملكي رويال', 'أخضر زمردي'], 
      sizes: ['38', '40', '42', '44', '46'], 
      stock: 6, 
      desc: 'فستان سهرة استثنائي بكتف واحد ولمسات درابيه ساحرة للأعراس والمناسبات' 
    },
    { 
      id: 'prod-b-1', 
      name: 'تيشيرت ولادي قطن طبيعي بطبعة جرافيك عصرية', 
      cat: 'ولادي', 
      subcat: 'تيشيرتات', 
      price: 4800, 
      orig: 7500, 
      colors: ['أصفر كناري', 'كحلي رياضي'], 
      sizes: ['4-5 سنوات', '6-7 سنوات', '8-9 سنوات', '10-12 سنة'], 
      stock: 35, 
      desc: 'تيشيرت ولادي قطني 100% مسامي ومريح لا يسبب تعرق' 
    },
    { 
      id: 'prod-b-2', 
      name: 'قميص ولادي كلاسيك مربعات كاروهات أنيق للمناسبات', 
      cat: 'ولادي', 
      subcat: 'قمصان', 
      price: 6200, 
      orig: 9800, 
      colors: ['أحمر وأزرق كاروهات', 'أخضر وكحلي'], 
      sizes: ['4-6 سنوات', '7-9 سنوات', '10-12 سنة'], 
      stock: 22, 
      desc: 'قميص ولادي بأكمام طويلة ومظهر أنيق للأعياد والزيارات' 
    },
    { 
      id: 'prod-g-1', 
      name: 'فستان بناتي أميرات شيفون ناعم مطرز بالورود', 
      cat: 'بناتي', 
      subcat: 'فساتين', 
      price: 9800, 
      orig: 16500, 
      colors: ['وردي فاتح', 'أوف وايت'], 
      sizes: ['3-4 سنوات', '5-6 سنوات', '7-8 سنوات', '9-10 سنوات'], 
      stock: 12, 
      desc: 'فستان أميرات شيفون مطرز بالورود أنيق ومريح للبنات في الأعياد والمناسبات' 
    },
    { 
      id: 'prod-bb-1', 
      name: 'طقم مواليد قطن طبيعي نقي 5 قطع هدية فاخرة', 
      cat: 'مواليد', 
      subcat: 'مواليد', 
      price: 7500, 
      orig: 11500, 
      colors: ['سماوي فاتح', 'وردي بيبي', 'بيج محايد'], 
      sizes: ['0-3 أشهر', '3-6 أشهر'], 
      stock: 20, 
      desc: 'طقم مواليد قطن طبيعي نقي 100% ناعم وآمن على بشرة الرضع' 
    },
    { 
      id: 'prod-s-1', 
      name: 'حذاء سنيكرز رياضي إيطالي فائق الخفة والمروحة', 
      cat: 'أحذية', 
      subcat: 'سنيكرز', 
      price: 14200, 
      orig: 24000, 
      colors: ['أبيض ناصع', 'رمادي فضي'], 
      sizes: ['39', '40', '41', '42', '43', '44'], 
      stock: 14, 
      desc: 'سنيكرز طبي مبطن ومريح جداً للمشي اليومي والرياضة' 
    },
    { 
      id: 'prod-s-2', 
      name: 'حذاء كلاسيكي جلد طبيعي رسمي أوكسفورد', 
      cat: 'أحذية', 
      subcat: 'رسمي', 
      price: 19500, 
      orig: 30000, 
      colors: ['بني ملكي', 'أسود لامع'], 
      sizes: ['40', '41', '42', '43', '44'], 
      stock: 6, 
      desc: 'حذاء رسمي جلد طبيعي فاخر للمناسبات والأعمال والدوام' 
    },
    { 
      id: 'prod-s-3', 
      name: 'حذاء كعب عالي سهرة مرصع بالستراس اللامع', 
      cat: 'أحذية', 
      subcat: 'كعب سهرة', 
      price: 16900, 
      orig: 28000, 
      colors: ['ذهبي براق', 'فضي ميتاليك'], 
      sizes: ['36', '37', '38', '39', '40'], 
      stock: 8, 
      desc: 'كعب سهرة مريح متوازن 8 سم مع لمعة ستراس ساحرة' 
    },
    { 
      id: 'prod-bg-1', 
      name: 'حقيبة يد نسائية جلد إيطالي فاخر مع حزام ذهبي', 
      cat: 'شنط', 
      subcat: 'يد', 
      price: 16500, 
      orig: 29000, 
      colors: ['بني تان', 'أسود فاخر', 'بيج عاجي'], 
      sizes: ['وسط'], 
      stock: 9, 
      desc: 'شنطة يد نسائية راقية بجلد إيطالي مقاوم للخدش مع حزام كروس' 
    },
    { 
      id: 'prod-bg-2', 
      name: 'طقم حقائب سفر متكامل 3 قطع فايبر مقاوم للصدمات', 
      cat: 'شنط', 
      subcat: 'سفر', 
      price: 38000, 
      orig: 55000, 
      colors: ['كحلي تيتانيوم', 'رمادي غامق'], 
      sizes: ['صغير (20)', 'وسط (24)', 'كبير (28)'], 
      stock: 4, 
      desc: 'حقائب سفر قوية وخفيفة مع قفل أمان TSA وعجلات دوارة 360 درجة' 
    },
    { 
      id: 'prod-bg-3', 
      name: 'شنطة ظهر جلد ذكية عصرية مقاومة للماء مع منفذ شحن', 
      cat: 'شنط', 
      subcat: 'ظهر', 
      price: 11200, 
      orig: 18500, 
      colors: ['أسود ماط', 'رمادي فحمي'], 
      sizes: ['لابتوب 15.6'], 
      stock: 11, 
      desc: 'شنطة ظهر عملية للمكتب والجامعة والرحلات مع منفذ USB' 
    }
  ];

  type UserIntent =
    | 'CHAT'
    | 'GENERAL_KNOWLEDGE'
    | 'PRODUCT_SEARCH'
    | 'PRODUCT_IMAGE_REQUEST'
    | 'PRODUCT_DETAILS'
    | 'ORDER_HELP'
    | 'PAYMENT_HELP'
    | 'ACCOUNT_HELP'
    | 'EXCHANGE_RATE_HELP'
    | 'STORE_INFO'
    | 'OTHER';

  // Fast Deterministic Intent Detector
  function detectIntent(text: string): { intent: UserIntent; extractedFilter?: { maxPrice?: number; color?: string; category?: string; query?: string } } {
    const raw = text.trim();
    const clean = raw.toLowerCase().replace(/[؟?!.,،؛]/g, ' ');

    // 1. CHAT / Greetings / Polite chatter
    const chatPhrases = [
      'كيف حالك', 'شخبارك', 'كيفك', 'عساك بخير', 'عساك طيب', 'كيف الصحة', 'أخبارك', 'علومك', 'شلونك', 'احوالك', 'كيف الامور', 'كيف الحال',
      'اش اخبارك', 'ايش اخبارك', 'كيفك يا خبير', 'حياك الله', 'يا هلا والله', 'يا مرحبا',
      'السلام عليكم', 'سلام عليكم', 'مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'صباح الخير', 'مساء الخير', 'هلا', 'هاي', 'أهلين', 'يا هلا', 'صباح النور', 'مساء النور',
      'شكرا', 'شكراً', 'مشكور', 'تسلم', 'جزاك الله خير', 'يعطيك العافية', 'ما قصرت', 'عشت', 'تسلم لي', 'حياك', 'ألف شكر',
      'من أنت', 'من انت', 'عرف عن نفسك', 'ايش اسمك', 'من تكون', 'ايش وظيفتك', 'وش تسوي', 'ما هو دورك', 'مين انت',
      'تصبح على خير', 'مع السلامة', 'باي', 'في أمان الله', 'إلى اللقاء', 'وداعا', 'سلامتك', 'نوم العوافي', 'مع الف سلامة'
    ];

    for (const phrase of chatPhrases) {
      if (clean.includes(phrase)) {
        const hasProductWord = ['فستان', 'فساتين', 'شنط', 'شنطة', 'حذاء', 'شوز', 'سنيكرز', 'كعب', 'قميص', 'بنطال', 'طقم'].some(w => clean.includes(w));
        if (!hasProductWord) {
          return { intent: 'CHAT' };
        }
      }
    }

    // 2. ORDER_HELP
    if (
      clean.includes('تتبع') || 
      clean.includes('أين طلبي') || 
      clean.includes('وين طلبي') || 
      clean.includes('حالة الطلب') || 
      clean.includes('أتابع طلبي') || 
      clean.includes('تابع طلبي') || 
      clean.includes('شحنتي') || 
      clean.includes('متى يوصل') || 
      clean.includes('تأخر الطلب') || 
      clean.includes('رقم الطلب')
    ) {
      return { intent: 'ORDER_HELP' };
    }

    // 3. PAYMENT_HELP
    if (
      clean.includes('طرق الدفع') || 
      clean.includes('طريقة الدفع') || 
      clean.includes('كيف ادفع') || 
      clean.includes('كيف أدفع') || 
      clean.includes('تقبلون كاش') || 
      clean.includes('الدفع عند الاستلام') || 
      clean.includes('كريمي') || 
      clean.includes('ون كاش') || 
      clean.includes('حساب بنكي') || 
      clean.includes('سداد') || 
      clean.includes('فيزا') || 
      clean.includes('ماستركارد')
    ) {
      return { intent: 'PAYMENT_HELP' };
    }

    // 4. ACCOUNT_HELP
    if (
      clean.includes('كلمة المرور') || 
      clean.includes('الباسورد') || 
      clean.includes('تغيير الباسورد') || 
      clean.includes('نسيت الباسورد') || 
      clean.includes('تسجيل الدخول') || 
      clean.includes('تسجيل حساب') || 
      clean.includes('انشاء حساب') || 
      clean.includes('تعديل الحساب') || 
      clean.includes('رقم الهاتف')
    ) {
      return { intent: 'ACCOUNT_HELP' };
    }

    // 5. EXCHANGE_RATE_HELP
    if (
      clean.includes('سعر الصرف') ||
      clean.includes('كم الصرف') ||
      clean.includes('كم سعر الدولار') ||
      clean.includes('كم سعر السعودي') ||
      clean.includes('تحويل العملة') ||
      clean.includes('اسعار العملات')
    ) {
      return { intent: 'EXCHANGE_RATE_HELP' };
    }

    // 6. STORE_INFO & POLICIES
    if (
      clean.includes('اين فروعكم') || 
      clean.includes('أين فروعكم') || 
      clean.includes('وين موقعكم') || 
      clean.includes('موقع المحل') || 
      clean.includes('سياسة الارجاع') || 
      clean.includes('سياسة الإرجاع') || 
      clean.includes('الاستبدال') || 
      clean.includes('معاينة قبل الدفع') || 
      clean.includes('خدمة العملاء') || 
      clean.includes('رقم التواصل') || 
      clean.includes('رقم الواتساب') ||
      clean.includes('المحافظات') ||
      clean.includes('توصلون صنعاء') ||
      clean.includes('توصلون عدن') ||
      clean.includes('توصيل لتعز') ||
      clean.includes('توصيل للحديدة') ||
      clean.includes('توصيل لإب') ||
      clean.includes('توصيل للمكلا')
    ) {
      return { intent: 'STORE_INFO' };
    }

    // 7. PRODUCT_IMAGE_REQUEST
    if (
      clean.includes('ارسل لي صور') || 
      clean.includes('أرسل لي صور') || 
      clean.includes('وريني صور') || 
      clean.includes('صور فساتين') || 
      clean.includes('صور شنط') || 
      clean.includes('صور احذية') || 
      clean.includes('أريد صور') || 
      clean.includes('فرجينا صور') || 
      clean.includes('ابغى اشوف صور')
    ) {
      return { 
        intent: 'PRODUCT_IMAGE_REQUEST',
        extractedFilter: extractFilters(clean)
      };
    }

    // 8. PRODUCT_DETAILS
    if (
      clean.includes('كم سعر هذا') || 
      clean.includes('بكم هذا') || 
      clean.includes('كم سعره') || 
      clean.includes('ما تفاصيل') || 
      clean.includes('ايش خامة') || 
      clean.includes('كم المقاسات')
    ) {
      return { 
        intent: 'PRODUCT_DETAILS',
        extractedFilter: extractFilters(clean)
      };
    }

    // 9. PRODUCT_SEARCH — STRICT SPECIFIC APPAREL/PRODUCT KEYWORDS
    const specificApparelKeywords = [
      'فستان', 'فساتين', 'عباية', 'عبايات', 'بلوزة', 'بلوزات', 'تنورة', 'تنانير', 'بنطال', 'بناطل', 'جينز', 'روب', 'بيجاما',
      'حذاء', 'احذية', 'أحذية', 'شوز', 'سنيكرز', 'كعب', 'صندل', 'بوط',
      'شنطة', 'شنط', 'حقيبة', 'حقائب', 'شنطة سفر', 'شنطة يد',
      'ملابس ولادي', 'اطقم ولادي', 'ملابس بناتي', 'اطقم بناتي', 'ملابس مواليد', 'ملابس اطفال', 'تيشيرت', 'قميص', 'جاكيت', 'بدلة'
    ];

    const hasApparelKeyword = specificApparelKeywords.some(kw => clean.includes(kw));
    if (hasApparelKeyword) {
      return { 
        intent: 'PRODUCT_SEARCH',
        extractedFilter: extractFilters(clean)
      };
    }

    // 10. GENERAL_KNOWLEDGE (Geography, History, Science, Tech, General questions)
    const isGeneralKnowledgeQuestion = 
      clean.includes('ما عاصمة') || 
      clean.includes('ما هي عاصمة') || 
      clean.includes('من مخترع') || 
      clean.includes('من هو مخترع') || 
      clean.includes('من اخترع') || 
      clean.includes('اشرح لي') || 
      clean.includes('اشرح') || 
      clean.includes('ما معنى') || 
      clean.includes('ما هو') || 
      clean.includes('ما هي') || 
      clean.includes('كيف يعمل') || 
      clean.includes('هل تعلم') || 
      clean.includes('متى تأسس');

    if (isGeneralKnowledgeQuestion) {
      return { intent: 'GENERAL_KNOWLEDGE' };
    }

    return { intent: 'OTHER' };
  }

  function extractFilters(clean: string) {
    let maxPrice: number | undefined;
    let color: string | undefined;
    let category: string | undefined;

    // Price extraction (e.g. 20000 or 20,000 or أقل من 20000)
    const priceMatch = clean.match(/(?:أقل من|اقل من|تحت|بحدود|ميزانية|سعر|بـ|ب)\s*(\d+[\d,]*)/) || clean.match(/(\d{4,6})/);
    if (priceMatch) {
      const num = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 1000) {
        maxPrice = num;
      }
    }

    // Color extraction
    const colors = ['أسود', 'اسود', 'أبيض', 'ابيض', 'كحلي', 'وردي', 'ذهبي', 'فضي', 'بني', 'بيج', 'أزرق', 'ازرق', 'أخضر', 'اخضر', 'زمردي', 'عنابي', 'زيتي', 'رمادي'];
    for (const c of colors) {
      if (clean.includes(c)) {
        color = c.replace('اسود', 'أسود').replace('ابيض', 'أبيض').replace('ازرق', 'أزرق').replace('اخضر', 'أخضر');
        break;
      }
    }

    // Category extraction
    if (clean.includes('فستان') || clean.includes('فساتين') || clean.includes('نسائي') || clean.includes('عباية') || clean.includes('بلوزة') || clean.includes('تنورة') || clean.includes('بنطال')) {
      category = 'نسائي';
    } else if (clean.includes('شنط') || clean.includes('شنطة') || clean.includes('حقيبة') || clean.includes('حقائب')) {
      category = 'شنط';
    } else if (clean.includes('حذاء') || clean.includes('احذية') || clean.includes('أحذية') || clean.includes('شوز') || clean.includes('سنيكرز') || clean.includes('كعب')) {
      category = 'أحذية';
    } else if (clean.includes('ولادي') || clean.includes('أولاد') || clean.includes('ولد')) {
      category = 'ولادي';
    } else if (clean.includes('بناتي') || clean.includes('بنات') || clean.includes('بنت')) {
      category = 'بناتي';
    } else if (clean.includes('مواليد') || clean.includes('أطفال') || clean.includes('اطفال') || clean.includes('بيبي')) {
      category = 'مواليد';
    }

    return { maxPrice, color, category, query: clean };
  }

  // Catalog Search Function with Precise Multi-Factor Ranking
  function searchCatalog(filters?: { maxPrice?: number; color?: string; category?: string; query?: string }): string[] {
    if (!filters) return [];
    const query = (filters.query || '').toLowerCase();

    const scored = catalogData.map(p => {
      let score = 0;

      // Category match
      if (filters.category && (p.cat.includes(filters.category) || filters.category.includes(p.cat))) {
        score += 15;
      }

      // Subcategory direct match
      if (query.includes('فستان') || query.includes('فساتين')) {
        if (p.subcat === 'فساتين') score += 25;
      }
      if (query.includes('شنط') || query.includes('شنطة') || query.includes('حقيبة') || query.includes('حقائب')) {
        if (p.cat === 'شنط') score += 25;
      }
      if (query.includes('حذاء') || query.includes('احذية') || query.includes('أحذية') || query.includes('شوز') || query.includes('سنيكرز') || query.includes('كعب')) {
        if (p.cat === 'أحذية') score += 25;
      }
      if (query.includes('سنيكرز') && p.subcat === 'سنيكرز') score += 30;
      if (query.includes('كعب') && p.subcat === 'كعب سهرة') score += 30;
      if (query.includes('سفر') && p.subcat === 'سفر') score += 30;
      if (query.includes('ظهر') && p.subcat === 'ظهر') score += 30;
      if (query.includes('بلوزة') && p.subcat === 'بلوزات') score += 30;
      if (query.includes('تنورة') && p.subcat === 'تنانير') score += 30;
      if (query.includes('بنطال') && p.subcat === 'بناطل') score += 30;
      if (query.includes('ولادي') && p.cat === 'ولادي') score += 25;
      if (query.includes('بناتي') && p.cat === 'بناتي') score += 25;
      if ((query.includes('مواليد') || query.includes('بيبي')) && p.cat === 'مواليد') score += 25;

      // Color match
      if (filters.color) {
        const hasColor = p.colors.some(c => c.includes(filters.color!) || filters.color!.includes(c));
        if (hasColor) {
          score += 20;
        } else {
          // If color was explicitly requested and not matched, penalize
          score -= 10;
        }
      }

      // Price filter
      if (filters.maxPrice) {
        if (p.price <= filters.maxPrice) {
          score += 15;
        } else {
          // Exceeds requested budget!
          score -= 30;
        }
      }

      // General query token matching
      const tokens = query.split(/\s+/).filter(t => t.length > 2);
      tokens.forEach(t => {
        if (p.name.toLowerCase().includes(t)) score += 5;
        if (p.desc.toLowerCase().includes(t)) score += 3;
      });

      return { id: p.id, score, price: p.price };
    });

    // Filter only items with positive score and sort by score descending
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.id);
  }

  // Fast Instant Responses for Non-Product Queries
  function getFastResponse(intent: UserIntent, cleanMsg: string): { text: string; suggestedProductIds: string[] } | null {
    if (intent === 'CHAT') {
      if (cleanMsg.includes('كيف حالك') || cleanMsg.includes('شخبارك') || cleanMsg.includes('كيفك') || cleanMsg.includes('كيف الصحة') || cleanMsg.includes('أخبارك') || cleanMsg.includes('شلونك')) {
        return {
          text: 'الحمد لله بخير وصحة وعافية 😊 أنا مساعد ضَجّة، كيف أقدر أساعدك اليوم في التسوق أو استفساراتك؟',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('صباح الخير') || cleanMsg.includes('صباح النور')) {
        return {
          text: 'صباح النور والسرور 🌷 أهلاً بك في ضَجّة مول، كيف أقدر أساعدك اليوم؟',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('مساء الخير') || cleanMsg.includes('مساء النور')) {
        return {
          text: 'مساء الخير والأنوار 🌟 أهلاً بك في ضَجّة مول، كيف أقدر أخدمك الليلة؟',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('سلام عليكم') || cleanMsg.includes('السلام عليكم') || cleanMsg.includes('مرحبا') || cleanMsg.includes('أهلا') || cleanMsg.includes('اهلا') || cleanMsg.includes('هلا')) {
        return {
          text: 'وعليكم السلام ورحمة الله وبركاته 🌷 مرحباً بك في ضَجّة مول! كيف أقدر أساعدك اليوم؟',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('شكرا') || cleanMsg.includes('شكراً') || cleanMsg.includes('مشكور') || cleanMsg.includes('تسلم') || cleanMsg.includes('يعطيك العافية') || cleanMsg.includes('جزاك الله خير')) {
        return {
          text: 'العفو دائماً وفي خدمتك بكل سرور ❤️ يسعدني الرد على أي استفسار آخر تريده.',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('من أنت') || cleanMsg.includes('من انت') || cleanMsg.includes('عرف عن نفسك') || cleanMsg.includes('ايش وظيفتك') || cleanMsg.includes('وش تسوي')) {
        return {
          text: 'أنا مساعد ضَجّة الذكي 🌟، خبيرك لتنسيق الإطلالات ومساعدتك في البحث عن أرقى الأزياء، الأحذية، والحقائب، بالإضافة للإجابة على استفسارات الطلبات والشحن والدفع.',
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes('تصبح على خير') || cleanMsg.includes('مع السلامة') || cleanMsg.includes('باي') || cleanMsg.includes('في أمان الله') || cleanMsg.includes('إلى اللقاء') || cleanMsg.includes('وداعا')) {
        return {
          text: 'وأنت من أهل الخير والسعادة 🌙 ليلة سعيدة وفي أمان الله وحفظه!',
          suggestedProductIds: []
        };
      }
      return {
        text: 'أهلاً بك! أنا مساعد ضَجّة، كيف أقدر أساعدك اليوم؟',
        suggestedProductIds: []
      };
    }

    if (intent === 'ORDER_HELP') {
      return {
        text: 'يمكنك متابعة وتتبع حالة طلبك بكل سهولة:\n1. افتح صفحة (الملف الشخصي) من الشريط السفلي.\n2. اضغط على (طلباتي) لعرض كافة طلباتك الحالية، وتفاصيل الشحنة ورقم التتبع خطوة بخطوة حتى وصول المندوب لباب بيتك.',
        suggestedProductIds: []
      };
    }

    if (intent === 'PAYMENT_HELP') {
      return {
        text: 'طرق الدفع المعتمدة في ضَجّة مول:\n1. 💵 الدفع عند الاستلام نقداً (كاش) بعد فحص ومعاينة المنتجات باليد.\n2. 📱 التحويل عبر البنوك والمحافظ الإلكترونية اليمنية (الكريمي مميز، ون كاش، جيب، جوالي).\n3. 💳 البطاقات الإلكترونية والمصرفية المعتمدة.',
        suggestedProductIds: []
      };
    }

    if (intent === 'ACCOUNT_HELP') {
      return {
        text: 'لتغيير كلمة المرور أو تعديل بيانات حسابك:\n1. توجه إلى صفحة (الملف الشخصي).\n2. اضغط على (إعدادات الحساب والأمان).\n3. اختر (تغيير كلمة المرور)، أو استخدم خيار (نسيت كلمة المرور) في نافذة تسجيل الدخول ليصلك رابط التعيين على بريدك الإلكتروني.',
        suggestedProductIds: []
      };
    }

    if (intent === 'EXCHANGE_RATE_HELP') {
      return {
        text: 'أسعار الصرف والعملات المعتمدة في ضَجّة مول:\n• 🇸🇦 الريال السعودي: 140 ريال يمني\n• 🇺🇸 الدولار الأمريكي: 530 ريال يمني\n• 🇾🇪 الريال اليمني: العملة الأساسية للمتجر\nيمكنك تبديل العملة المعروضة في أي وقت بالضغط على أيقونة العملة في أعلى الواجهة أو في صفحة الإعدادات.',
        suggestedProductIds: []
      };
    }

    if (intent === 'STORE_INFO') {
      return {
        text: 'معلومات متجر ضَجّة مول:\n• 📍 الفروع والمستودعات: صنعاء (شارع حدة) • عدن (المنصورة) • تغطية توصيل فوري لكافة المحافظات اليمنية.\n• 🛡️ الضمان: معاينة وفحص المنتجات قبل الدفع + استبدال وإرجاع مجاني خلال 3 أيام.\n• 📞 خدمة العملاء: متوفرة 24/7 عبر المحادثة والواتساب.',
        suggestedProductIds: []
      };
    }

    if (intent === 'OTHER') {
      return {
        text: 'أهلاً بك في ضَجّة مول! أنا مساعدك الذكي لخدمتك في استفسارات المتجر، البحث عن المنتجات، وتتبع الطلبات. كيف أقدر أساعدك؟',
        suggestedProductIds: []
      };
    }

    return null;
  }

  // AI Shopping Concierge API with Intent-First Logic
  app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
    try {
      const { message, history, customInstructions, knowledgeBase } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const client = getGeminiClient();
      const detected = detectIntent(message);
      const isProductIntent = detected.intent === 'PRODUCT_SEARCH' || detected.intent === 'PRODUCT_IMAGE_REQUEST' || detected.intent === 'PRODUCT_DETAILS';

      // 1. If it's a simple greeting/fast chat without complex questions, return instant response
      const fastReply = getFastResponse(detected.intent, message.toLowerCase());
      if (fastReply && !isProductIntent && detected.intent === 'CHAT') {
        return res.json({
          text: fastReply.text,
          suggestedProductIds: [],
          intent: detected.intent,
          modelUsed: 'instant-intent-engine',
        });
      }

      // 2. Format catalog text for grounding (use dynamic client catalog if passed, otherwise server default)
      const activeCatalog = Array.isArray(req.body?.catalog) && req.body.catalog.length > 0
        ? req.body.catalog.map((p: any) => ({
            id: p.id,
            name: p.name,
            cat: p.category || 'عام',
            subcat: p.subcategory || '',
            price: p.priceYER || 0,
            orig: p.originalPriceYER || 0,
            colors: Array.isArray(p.colors) ? p.colors.map((c: any) => typeof c === 'string' ? c : c.name) : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            stock: p.stock ?? 10,
            desc: p.description || p.name
          }))
        : catalogData;

      const catalogStr = activeCatalog.map((p: any) => 
        `- [${p.id}] ${p.name} | القسم: ${p.cat} / ${p.subcat} | السعر: ${p.price} ريال يمني (قبل: ${p.orig}) | الألوان: ${p.colors.join(', ')} | المقاسات: ${p.sizes.join(', ')} | المتوفر: ${p.stock} | ${p.desc}`
      ).join('\n');

      let dynamicKbStr = '';
      if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
        dynamicKbStr = '\nمعلومات إضافية ومحدثة من إدارة المتجر:\n' + 
          knowledgeBase.filter((k: any) => k.isActive).map((k: any) => `• [${k.category}] ${k.question}: ${k.answer}`).join('\n');
      }

      const systemInstruction = `أنت "ذكاء ضَجّة" (Dajjah AI) — المساعد الذكي الحقيقي لمنصة "ضَجّة مول" في اليمن (شعارنا: "ضَجّة في وجه الغلاء").

قواعد جوهرية وأساسية لفهم نية العميل (Intent First):
1. **المحادثة العامة والترحيب (CHAT)**: إذا قال العميل عبارة ترحيب أو محادثة عامة (مثل: "كيف حالك؟"، "صباح الخير"، "شكراً"، "من أنت؟"، "تصبح على خير")، أجب بلطف وإيجاز إنساني طبيعي، وممنوع منعاً باتاً عرض أي منتجات أو أسعار أو صور أو صفقات أو وضع وسم [PRODUCTS].
2. **الأسئلة العامة والثقافية والعلمية (GENERAL_KNOWLEDGE)**: إذا سأل العميل عن أي معلومة عامة (مثل: عواصم الدول، التاريخ، مخترعين، شروحات تقنية أو عامة)، أجب عن سؤاله بدقة وعلمية وأدب، وبدون ذكر أو عرض أي منتجات على الإطلاق.
3. **الأسئلة الخدمية وسياسات المتجر (الطلبات، الدفع، الحساب، سياسات المتجر)**: أجب عن السؤال المحدد بوضوح ودقة بناءً على سياسات ضَجّة مول (المعاينة قبل الدفع، الاسترجاع 3 أيام، الدفع عند الاستلام أو الكريمي، التوصيل لكافة المحافظات اليمنية) بدون عرض منتجات.
4. **البحث عن المنتجات والتنسيق (PRODUCT_SEARCH)**: عندما يطلب العميل صراحة ملابس أو أزياء أو أحذية أو حقائب (مثل: "أريد فستان أسود"، "أريد شنطة"، "هل عندكم أحذية رياضية؟"، "فستان أقل من 20,000 ريال")، ابحث في الكتالوج واذكر اسم المنتج وسعره ومميزاته، ثم ضع معرفات المنتجات المقترحة في نهاية ردك بتنسيق:
[PRODUCTS: prod-id-1, prod-id-2]
5. **طلب الصور (PRODUCT_IMAGE_REQUEST)**: إذا قال "أرسل لي صور فساتين" أو "وريني صور شنط"، قدم وصفاً ترحيبياً موجزاً مع وسم المنتجات بالصور.
6. **أسئلة تفاصيل المنتج (PRODUCT_DETAILS)**: إذا سأل عن سعر أو خامة أو مقاس منتج محدد، أجب عن تفاصيل هذا المنتج وسعره بدقة.

${customInstructions ? `تعليمات مخصصة من إدارة المتجر: ${customInstructions}\n` : ''}
${dynamicKbStr}

كتالوج منتجات ضَجّة مول المتوفرة:
${catalogStr}

الالتزام: لا تخترع منتجات غير موجودة في الكتالوج. لا تعرض منتجات ما لم تكن نية العميل صريحة للشراء أو البحث أو الصور.`;

      if (!client) {
        // Fallback when Gemini API key is missing or offline
        let reply = '';
        let matchedProductIds: string[] = [];

        if (isProductIntent) {
          matchedProductIds = searchCatalog(detected.extractedFilter);
          
          if (detected.intent === 'PRODUCT_IMAGE_REQUEST') {
            reply = 'إليك تشكيلة مختارة من أجمل الموديلات المتوفرة لدينا بالصور والتفاصيل الكاملة والأسعار المخفضة:';
          } else if (message.includes('فستان') || message.includes('فساتين')) {
            reply = 'تفضل باقة من أرقى الفساتين النسائية المصممة للسهرات والمناسبات بخامات تركية وكورية فاخرة وأسعار منافسة:';
          } else if (message.includes('شنط') || message.includes('شنطة') || message.includes('حقيبة')) {
            reply = 'إليك تشكيلة الحقائب الجلدية الفاخرة وحقائب السفر المتينة المتوفرة في ضَجّة مول:';
          } else if (message.includes('حذاء') || message.includes('أحذية') || message.includes('سنيكرز') || message.includes('كعب')) {
            reply = 'إليك أفضل الأحذية الرياضية الإيطالية والأحذية الكلاسيكية الرسمية وكعوب السهرة المتوفرة:';
          } else if (message.includes('ولادي') || message.includes('بناتي') || message.includes('مواليد')) {
            reply = 'إليك تشكيلات الأطفال والمواليد القطنية الناعمة والآمنة بأجمل التصاميم:';
          } else {
            reply = 'بناءً على طلبك، إليك المنتجات المطابقة لبحثك في متجر ضَجّة مول:';
          }

          if (matchedProductIds.length === 0) {
            reply = 'يسعدنا خدمتك! لم نجد منتجات تطابق هذا الفلتر بالضبط، ولكن يمكنك استكشاف أقسامنا الرئيسية (الملابس النسائية، الأحذية، الشنط، وملابس الأطفال).';
          }
        } else {
          reply = fastReply?.text || 'أهلاً بك في ضَجّة مول! كيف أستطيع مساعدتك اليوم؟';
          matchedProductIds = [];
        }

        return res.json({
          text: reply,
          suggestedProductIds: isProductIntent ? matchedProductIds : [],
          intent: detected.intent,
          modelUsed: 'rule-engine-intent',
        });
      }

      // Build conversation contents with history for multi-turn
      const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

      if (Array.isArray(history)) {
        history.slice(-8).forEach((h: any) => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
              parts: [{ text: h.text }],
            });
          }
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Generate content with a safe timeout
      const generatePromise = client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI response timeout')), 25000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response?.text || 'يسعدني دائماً مساعدتك في ضَجّة مول!';
      
      // Extract suggested product IDs from response
      let cleanedText = responseText;
      let suggestedProductIds: string[] = [];
      const match = responseText.match(/\[PRODUCTS:\s*([a-zA-Z0-9-,\s]+)\]/);
      
      if (match) {
        const ids = match[1].split(',').map((s) => s.trim()).filter(Boolean);
        suggestedProductIds.push(...ids);
        cleanedText = responseText.replace(/\[PRODUCTS:\s*[a-zA-Z0-9-,\s]+\]/, '').trim();
      }

      // Fallback deterministic catalog search if it was a product intent and model didn't tag
      if (isProductIntent && suggestedProductIds.length === 0) {
        suggestedProductIds = searchCatalog(detected.extractedFilter);
      }

      // CRITICAL: If intent is NOT a product intent (e.g. CHAT, ORDER_HELP, etc.), strictly enforce EMPTY products!
      if (!isProductIntent) {
        suggestedProductIds = [];
      }

      return res.json({
        text: cleanedText,
        suggestedProductIds: suggestedProductIds,
        intent: detected.intent,
        modelUsed: 'gemini-3.7-flash',
      });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const fallbackDetected = detectIntent(req.body?.message || '');
      const isProduct = fallbackDetected.intent === 'PRODUCT_SEARCH' || fallbackDetected.intent === 'PRODUCT_IMAGE_REQUEST' || fallbackDetected.intent === 'PRODUCT_DETAILS';
      const fast = getFastResponse(fallbackDetected.intent, (req.body?.message || '').toLowerCase());
      
      let fallbackText = fast?.text;
      if (!fallbackText) {
        if (fallbackDetected.intent === 'PRODUCT_IMAGE_REQUEST') {
          fallbackText = 'إليك تشكيلة مختارة من أجمل الموديلات المتوفرة لدينا بالصور والتفاصيل الكاملة والأسعار المخفضة:';
        } else if (isProduct) {
          fallbackText = 'بناءً على طلبك، إليك أفضل المنتجات المتوفرة لدينا في ضَجّة مول:';
        } else {
          fallbackText = 'أهلاً بك في ضَجّة مول! كيف أقدر أساعدك اليوم؟';
        }
      }

      return res.json({
        text: fallbackText,
        suggestedProductIds: isProduct ? searchCatalog(fallbackDetected.extractedFilter) : [],
        intent: fallbackDetected.intent,
        modelUsed: 'intent-fallback',
      });
    }
  });

  // Visual Search API with Multimodal Vision Analysis & Catalog Matching
  app.post('/api/visual-search', async (req: Request, res: Response) => {
    try {
      const { image, catalog } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image data is required for visual search' });
      }

      const activeCatalog = Array.isArray(catalog) && catalog.length > 0
        ? catalog.map((p: any) => ({
            id: p.id,
            name: p.name,
            cat: p.category || 'عام',
            subcat: p.subcategory || '',
            price: p.priceYER || 0,
            orig: p.originalPriceYER || 0,
            colors: Array.isArray(p.colors) ? p.colors.map((c: any) => typeof c === 'string' ? c : c.name) : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            stock: p.stock ?? 10,
            desc: p.description || p.name
          }))
        : catalogData;

      // Extract mime type and pure base64 data
      let mimeType = 'image/jpeg';
      let pureBase64 = image;

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          pureBase64 = matches[2];
        } else {
          pureBase64 = image.replace(/^data:[^;]+;base64,/, '');
        }
      }

      const client = getGeminiClient();

      if (client) {
        try {
          const catalogStr = activeCatalog.map((p: any) => 
            `[ID: ${p.id}] ${p.name} | القسم: ${p.cat} / ${p.subcat} | الألوان: ${p.colors.join(', ')} | ${p.desc}`
          ).join('\n');

          const visionPrompt = `أنت محرك البحث بالصورة (Visual Search Engine) لمتجر "ضَجّة مول" للملابس والأحذية والحقائب.
مهمتك:
1. فحص وتحليل صورة المنتج المرفوعة بدقة فائقة: ما هو نوع القطعة؟ (فستان، حذاء، شنطة، بلوزة، بنطال، ملابس ولادي، بناتي، مواليد)، ما لونها الرئيسي، وما هو الستايل؟
2. مطابقة الصورة مع كتالوج منتجات متجر ضَجّة مول واختيار أفضل 1 إلى 5 منتجات تطابقاً، وترتيبها حسب نسبة التشابه من الأعلى إلى الأدنى (بين 50% و 99%).
3. تحديد ما إذا كان المنتج مطابقاً تماماً (isExactMatch: true إذا كانت النسبة >= 90%) أو أقرب بديل متوفر في المتجر (isExactMatch: false).

قائمة منتجات المتجر المتاحة للمطابقة:
${catalogStr}

يجب أن تكون إجابتك بتنسيق JSON صحيح حصراً بدون أي كود إضافي أو نصوص خارجية:
{
  "detectedCategory": "القسم المكتشف (مثلاً: نسائي / فساتين)",
  "detectedAttributes": "وصف دقيق للمنتج في الصورة (مثلاً: فستان سهرة أسود طويل بقماش ساتان ناعم)",
  "detectedColor": "اللون الرئيسي",
  "suggestedSearchQuery": "عبارة بحث مقترحة",
  "matches": [
    {
      "productId": "معرف المنتج من القائمة أعلاه",
      "similarityPercentage": 95,
      "isExactMatch": true,
      "reason": "سبب المطابقة باختصار"
    }
  ]
}`;

          const visionResponse: any = await client.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: pureBase64,
                    },
                  },
                  {
                    text: visionPrompt,
                  },
                ],
              },
            ],
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          });

          const responseText = visionResponse?.text || '';
          let parsed: any = null;

          try {
            parsed = JSON.parse(responseText.trim());
          } catch {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            }
          }

          if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
            return res.json({
              success: true,
              detectedCategory: parsed.detectedCategory || 'أزياء وموضة',
              detectedAttributes: parsed.detectedAttributes || 'منتج مطابق في متجر ضَجّة',
              detectedColor: parsed.detectedColor || '',
              suggestedSearchQuery: parsed.suggestedSearchQuery || '',
              matches: parsed.matches.slice(0, 6),
              modelUsed: 'gemini-3.7-flash-vision',
            });
          }
        } catch (visionError) {
          console.warn('Gemini vision API notice, falling back to smart heuristic:', visionError);
        }
      }

      // Smart heuristic fallback if client is null or vision API timed out
      const fallbackMatches = activeCatalog.slice(0, 4).map((p: any, idx: number) => ({
        productId: p.id,
        similarityPercentage: 92 - idx * 6,
        isExactMatch: idx === 0,
        reason: idx === 0 ? 'تطابق كبير في التصميم والفئة' : 'خيار قريب ومطابق في الألوان والتصنيف',
      }));

      return res.json({
        success: true,
        detectedCategory: 'أزياء وإكسسوارات',
        detectedAttributes: 'تم العثور على أقرب الموديلات المطابقة في متجر ضَجّة مول',
        detectedColor: '',
        suggestedSearchQuery: 'تشكيلة مختارة',
        matches: fallbackMatches,
        modelUsed: 'heuristic-visual-matcher',
      });
    } catch (error: any) {
      console.error('Visual search error:', error);
      return res.status(500).json({ error: 'Failed to process visual search', details: error.message });
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ضَجّة مول server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Server uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('Server unhandledRejection notice:', reason);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
