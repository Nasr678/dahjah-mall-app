# بناء تطبيق الأندرويد

## قبل البدء

1. انشر الخادم على رابط https ثابت (مثال: Cloud Run).
2. في مستودع GitHub: Settings ← Secrets and variables ← Actions ← Variables، أضف المتغير `API_BASE_URL` بقيمة رابط الخادم (بدون `/` في النهاية).
3. افتح `public/privacy.html` و`public/delete-account.html` واستبدل `{{CONTACT_EMAIL}}` ببريد التواصل الحقيقي.

## نسخة تجريبية (APK)

من تبويب Actions شغّل `Build Dajjah Mall APK`، ثم نزّل الملف من Artifacts.

## نسخة النشر في Google Play (AAB موقّع)

1. أنشئ مفتاح التوقيع مرة واحدة واحتفظ به في مكان آمن (فقدانه يمنع تحديث التطبيق):

```bash
keytool -genkeypair -v -keystore dajjah-release.jks -alias dajjah \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 dajjah-release.jks
```

2. أضف في Settings ← Secrets and variables ← Actions ← Secrets:

| السر | القيمة |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | ناتج أمر base64 |
| `ANDROID_KEYSTORE_PASSWORD` | كلمة مرور الملف |
| `ANDROID_KEY_ALIAS` | `dajjah` |
| `ANDROID_KEY_PASSWORD` | كلمة مرور المفتاح |

3. من Actions شغّل `Build Dajjah Mall Release (AAB)`.
4. نزّل `app-release.aab` وارفعه في Google Play Console.

رقم الإصدار (`versionCode`) يزيد تلقائياً مع كل تشغيل.

## البناء محلياً

```bash
npm install
VITE_API_BASE_URL=https://your-server npm run cap:build
npm run cap:open
```

## ملاحظات

- مجلد `android/app/src/main/assets/public` يُولَّد تلقائياً ولا يُرفع إلى Git.
- تسجيل الدخول بحساب Google غير متاح داخل التطبيق، والدخول بالبريد وكلمة المرور متاح.
