# 🚀 دليل البدء السريع
## Quick Start Guide

> **للنسخة العربية:** اقرأ الأقسام التي تبدأ بـ 🇸🇦

---

## 📋 الخطوات السريعة | Quick Steps

### الخطوة 1️⃣: فحص الخطوط | Check Fonts
```bash
bash scripts/check-fonts.sh
```
**النتيجة المتوقعة:**
- ✓ ملفات TTF موجودة
- ○ ملفات WOFF2 (اختياري)

---

### الخطوة 2️⃣: تحويل الخطوط (اختياري) | Convert Fonts (Optional)

#### الطريقة 1️⃣: Online - Transfonter.org (الأسهل) ⭐

1. **اذهب إلى:** https://transfonter.org
2. **انسخ من هنا:**
   ```
   /public/fonts/beiruti/static/Beiruti-Regular.ttf
   /public/fonts/beiruti/static/Beiruti-Medium.ttf
   /public/fonts/beiruti/static/Beiruti-SemiBold.ttf
   /public/fonts/beiruti/static/Beiruti-Bold.ttf
   ```

3. **ارفع الملفات** على الموقع
4. **اختر الخيارات:**
   - ☑ WOFF2
   - ☑ Display: SWAP
5. **حمّل** النتيجة
6. **انسخ ملفات WOFF2** إلى نفس المجلد:
   ```
   /public/fonts/beiruti/static/Beiruti-*.woff2
   ```

#### الطريقة 2️⃣: وسيط محول عبر الإنترنت | Online Converter
استخدم: https://cloudconvert.com/ttf-to-woff2

#### الطريقة 3️⃣: بدون تحويل | Skip Conversion
استخدم التطبيق كما هو الآن - سيعمل بـ TTF، لكن تحويل WOFF2 سيحسّن الأداء بـ 30%.

---

### الخطوة 3️⃣: بناء واختبار | Build & Test
```bash
# بناء الإنتاج
npm run build

# اختبار محلي
npm run start
```

ثم افتح: http://localhost:3000

---

### الخطوة 4️⃣: اختبار الأداء | Test Performance

#### باستخدام السكريبت:
```bash
bash scripts/test-performance.sh
```

#### باستخدام Lighthouse:
1. افتح المتصفح في http://localhost:3000
2. اضغط F12 (أدوات المطور)
3. اذهب إلى Lighthouse
4. انقر "Generate report" (Mobile)

**النتائج المتوقعة:**
| المقياس | الهدف | مع TTF | مع WOFF2 |
|--------|------|--------|---------|
| **FCP** | < 2s | ~1.5s | ~1.2s |
| **LCP** | < 4s | ~2.8s | ~2.5s |
| **Mobile Score** | > 70 | ~72 | ~82 |

---

### الخطوة 5️⃣: النشر | Deploy

#### Vercel (الأسهل - ننصح به):
```bash
git add .
git commit -m "optimize: improve Core Web Vitals performance"
git push
```
سيتم النشر تلقائيًا! ✨

#### Fly.io:
```bash
flyctl deploy
```

#### Docker (أو أي منصة):
```bash
# بناء الصورة
docker build -t my-app .

# تشغيل الحاوية
docker run -p 3000:3000 my-app
```

---

## 🔍 التحقق من الخطوات | Verification

### قبل النشر | Before Deployment
```bash
# ✓ البناء يجب أن ينجح بدون أخطاء
npm run build

# ✓ التطبيق يجب أن يعمل محليًا
npm run start

# ✓ الخطوط يجب أن تظهر بشكل صحيح
# (اذهب إلى http://localhost:3000 وتحقق من العناوين العربية)
```

### بعد النشر | After Deployment
```
1. اختبر الموقع في الإنتاج
2. افتح Google PageSpeed Insights
3. أدخل URL موقعك
4. اختر Mobile
5. تحقق من النتائج
```

**الرابط:** https://pagespeed.web.dev

---

## 📊 المقاييس المتوقعة | Expected Metrics

### مع التحسينات الحالية (TTF):
- **FCP:** -30-35% (تحسن ~1 ثانية) 📉
- **LCP:** -15-25% (تحسن ~0.5 ثانية)
- **Mobile Score:** +17-22 نقطة (من 63 إلى ~80) 🎯

### بعد تحويل WOFF2 (اختياري):
- **FCP:** إضافة -500-800ms 📉
- **LCP:** إضافة -200-300ms
- **Mobile Score:** إضافة +3-5 نقاط (إلى ~85) 🎯

---

## 🆘 استكشاف الأخطاء | Troubleshooting

### المشكلة: "Module not found" عند البناء
**الحل:**
```bash
# تأكد من وجود الخطوط
bash scripts/check-fonts.sh

# ثم أعد العناء
npm run build
```

### المشكلة: الخطوط لا تظهر بشكل صحيح
**الحل:**
1. افتح DevTools (F12)
2. اذهب إلى Network
3. ابحث عن "Beiruti" أو "cairo"
4. تحقق من أن الحالة 200 OK
5. إذا كانت 404، تحقق من المسار في `lib/fonts.ts`

### المشكلة: الأداء لم تتحسّن
**الحل:**
1. امسح cache المتصفح (Ctrl+Shift+Del)
2. أغلق المتصفح وافتحه من جديد
3. اختبر في Incognito mode
4. تحقق من أن النسخة المُنتشرة حديثة (F5)

---

## 📚 مراجع صيانة | Maintenance

### إضافة خط جديد:
عدّل `lib/fonts.ts`:
```typescript
export const newFont = localFont({
  src: [
    { path: '../public/fonts/new-font/font-file.ttf', weight: '400' },
  ],
  variable: '--font-new-font',
  display: 'swap',
});
```

### تغيير حجم الصور المستجيبة:
عدّل في `components/UI/Card/Card.tsx`:
```typescript
sizes="(max-width: 475px) 100vw, (max-width: 768px) 50vw, ..."
```

### تحديث رؤوس الأمان:
عدّل في `next.config.ts` - قسم `headers()`

---

## 📞 الدعم | Support

إذا واجهت مشاكل:

1. **اقرأ:** IMPLEMENTATION_STATUS.md
2. **اقرأ:** PERFORMANCE_OPTIMIZATION.md
3. **اختبر:** `bash scripts/check-fonts.sh`
4. **سجل:** خطأ محدد واطلب مساعدة

---

## ✅ قائمة التحقق | Checklist

```
قبل النشر | Before Deployment:
☐ npm run build (بدون أخطاء)
☐ npm run start (يعمل محليًا)
☐ الخطوط تظهر بشكل صحيح
☐ Google Analytics يعمل
☐ جميع الروابط تعمل

بعد النشر | After Deployment:
☐ الموقع يحمّل بسرعة
☐ الخطوط العربية تظهر
☐ Google PageSpeed يُظهر تحسّن
☐ Mobile score > 70
☐ لا توجد أخطاء في Console
```

---

**آخر تحديث | Last Updated:** 
```
تاريخ الإنشاء: 2024
الإصدار: 1.0
```

**تحتاج إلى المزيد من المساعدة؟**
اقرأ الملفات الأخرى:
- 📘 [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)
- 📋 [ACTION_ITEMS.md](./ACTION_ITEMS.md)
- 🚀 [DEPLOY.md](./DEPLOY.md)
- 🔤 [WOFF2_CONVERSION.md](./WOFF2_CONVERSION.md)
