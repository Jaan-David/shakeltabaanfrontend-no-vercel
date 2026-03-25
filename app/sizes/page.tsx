import type { Metadata } from "next";
import { canonicalBaseUrl, seoConfig } from "@/config/seo.config";
import Image from "next/image";

const pageTitle = "كيفية حساب كمية الرخام المطلوبة للأرضيات";
const pageDescription =
  "دليل احترافي لحساب كمية الرخام المطلوبة بالمتر المربع: القياس، حساب المساحة، التعامل مع المساحات غير المنتظمة، وإضافة نسبة الهالك.";
const pageUrl = `${canonicalBaseUrl}/sizes`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "article",
    locale: "ar_EG",
    url: pageUrl,
    title: pageTitle,
    description: pageDescription,
    siteName: seoConfig.siteName,
  },
};

const section2Images = [
  {
    src: "/مقاسات/١ م² (1).png",
    alt: "توضيح بصري للمتر المربع",
  },
  {
    src: "/مقاسات/5 م (1).jpg.jpeg",
    alt: "مثال حساب مساحة منتظمة 5 في 4",
  },
];

const section3Images = [
  {
    src: "/مقاسات/5 م (2).jpg.jpeg",
    alt: "شكل مساحة منتظمة مع ناتج المساحة",
  },
  {
    src: "/مقاسات/5 م (3).jpg.jpeg",
    alt: "بداية تقسيم شكل L إلى أجزاء",
  },
  {
    src: "/مقاسات/5 م (4).jpg.jpeg",
    alt: "استكمال قياسات الجزء الثاني",
  },
  {
    src: "/مقاسات/5 م (5).jpg.jpeg",
    alt: "استكمال التقسيم إلى ثلاثة أجزاء",
  },
  {
    src: "/مقاسات/5 م (6).jpg.jpeg",
    alt: "جمع مساحات الأجزاء للوصول للإجمالي",
  },
];

function GuideImageCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#f5f5f5] p-3 shadow-sm">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={900}
        className="h-full w-full object-contain"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

export default function MarbleSizesGuidePage() {
  return (
    <main className="min-h-screen bg-[#f3f0ea] font-beiruti">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
        <header className="rounded-3xl bg-[#f8f6f2] px-4 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] md:px-6">
          <span className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600">
            دليل القياسات
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base leading-7">
            قبل شراء الرخام، من الضروري حساب المساحة بدقة لمعرفة الكمية المناسبة وتجنب الهدر أو
            النقص أثناء التركيب.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">أولًا: قياس أبعاد المساحة</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            لحساب كمية الرخام تحتاج إلى معرفة طول المساحة بالمتر وعرضها بالمتر قبل أي خطوة أخرى.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="order-1 rounded-2xl border border-slate-200 bg-[#f8f6f2] p-4 lg:order-2">
              <ul className="list-disc space-y-1 pr-5 text-sm text-slate-700 md:text-base leading-8">
                <li>طول المساحة بالمتر</li>
                <li>عرض المساحة بالمتر</li>
              </ul>
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <p className="text-sm font-semibold">⚠️ تأكد من القياس بالمتر</p>
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <GuideImageCard src="/مقاسات/١ م².png" alt="شرح المتر المربع عبر الطول والعرض" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">ثانيًا: حساب المساحة بالمتر المربع</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            بعد معرفة الطول والعرض استخدم المعادلة الأساسية.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="order-1 space-y-3 lg:order-2">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-center">
                <p className="text-xs font-semibold text-sky-700">المعادلة</p>
                <p className="mt-2 text-xl font-bold text-slate-800 md:text-2xl">المساحة = الطول × العرض</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-xs font-semibold text-emerald-700">مثال</p>
                <p className="mt-2 text-lg font-bold text-slate-800 md:text-xl">5 × 4 = 20 م²</p>
                <p className="mt-2 text-base font-semibold text-emerald-800 md:text-lg">الناتج: 20 م²</p>
              </div>
            </div>

            <div className="order-2 grid grid-cols-1 gap-3 lg:order-1 lg:grid-cols-2">
              {section2Images.map((item) => (
                <GuideImageCard key={item.src} src={item.src} alt={item.alt} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">ماذا لو كانت المساحة غير منتظمة</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            إذا كانت الأرضية على شكل حرف L أو أي شكل مركب اتبع الخطوات:
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="order-1 rounded-2xl border border-slate-200 bg-[#f8f6f2] p-4 lg:order-2">
              <ul className="list-disc space-y-1 pr-5 text-sm text-slate-700 md:text-base leading-8">
                <li>قسّم المساحة إلى مستطيلات</li>
                <li>احسب كل جزء</li>
                <li>اجمع النتائج</li>
              </ul>
            </div>
            <div className="order-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-3">
              {section3Images.map((item) => (
                <GuideImageCard key={item.src} src={item.src} alt={item.alt} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">إضافة نسبة الهالك</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            أضف هامش أمان لتغطية القص والزوايا.
          </p>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm font-semibold md:text-base">5% إلى 10%</p>
            <p className="mt-2 text-sm md:text-base">مثال: 20 → 22 م²</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">نصائح مهمة</h2>
          <ul className="mt-3 list-disc space-y-1 pr-5 text-sm text-slate-700 md:text-base leading-8">
            <li>خذ القياس أكثر من مرة</li>
            <li>احتفظ بهامش إضافي</li>
            <li>راجع مع الفني</li>
            <li>اختر نفس الدفعة</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-cyan-900 md:text-2xl">نصيحة ليك</h2>
          <p className="mt-2 text-sm text-cyan-900 md:text-base">
            صوّر المكان وارفق المقاسات عند طلب عرض السعر.
          </p>
        </section>

        <section className="rounded-3xl bg-primary p-5 text-white shadow-[0_16px_34px_rgba(15,23,42,0.2)] sm:p-6">
          <h2 className="text-xl font-semibold md:text-2xl">لحساب كمية الرخام بسرعة</h2>
          <ol className="mt-3 space-y-2">
            <li className="rounded-2xl bg-white/15 px-3 py-2 text-sm md:text-base">1 قياس</li>
            <li className="rounded-2xl bg-white/15 px-3 py-2 text-sm md:text-base">2 ضرب</li>
            <li className="rounded-2xl bg-white/15 px-3 py-2 text-sm md:text-base">3 إضافة هالك</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
