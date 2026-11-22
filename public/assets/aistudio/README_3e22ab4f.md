# ضَجّة مول

تطبيق تسوق إلكتروني لسوق اليمن، يعمل كموقع ويب وكتطبيق أندرويد (Capacitor).

## التقنيات

- واجهة: React 19 وTypeScript وTailwind CSS وVite
- خادم: Node.js وExpress
- بيانات ومصادقة وتخزين: Firebase (Auth, Firestore, Storage)
- المساعد الذكي والبحث بالصورة: Gemini API عبر الخادم
- تطبيق الجوال: Capacitor 8 (أندرويد)

## التشغيل محلياً

```bash
npm install
cp .env.example .env     # ثم أضف GEMINI_API_KEY
npm run dev
```

يعمل التطبيق على http://localhost:3000

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | تشغيل التطوير |
| `npm run build` | بناء الواجهة والخادم للإنتاج |
| `npm start` | تشغيل نسخة الإنتاج |
| `npm run lint` | فحص أنواع TypeScript |
| `npm run cap:build` | بناء الواجهة ومزامنتها مع مشروع أندرويد |

## المتغيرات

| المتغير | الاستخدام |
| --- | --- |
| `GEMINI_API_KEY` | مفتاح الخدمة، على الخادم فقط |
| `PORT` | منفذ الخادم |
| `ALLOWED_ORIGINS` | مواقع إضافية مسموحة (اختياري) |
| `VITE_API_BASE_URL` | رابط الخادم عند بناء تطبيق الأندرويد |

## هيكل المشروع

```
src/            الواجهة (مكونات، سياق التطبيق، خدمات Firebase، أدوات)
public/         صفحة الخصوصية وصفحة حذف الحساب
server.ts       الخادم وواجهات المساعد والبحث بالصورة
android/        مشروع أندرويد (Capacitor)
scripts/        سكربتات التحقق وتوليد الأيقونات
firestore.rules قواعد الأمان لقاعدة البيانات
```

## النشر

- الخادم: ابنِ بـ `npm run build` ثم شغّل `npm start` على أي استضافة تدعم Node.js (مثل Cloud Run) مع ضبط `GEMINI_API_KEY`.
- قواعد قاعدة البيانات: `firebase deploy --only firestore`
- تطبيق الأندرويد: راجع `ANDROID_BUILD_GUIDE.md`
