import Script from "next/script";
import { canonicalBaseUrl, organizationSchema, seoConfig } from "@/config/seo.config";
import MarbleInfoClient from "./MarbleInfoClient";

const marbleInfoTitle = "أنواع الرخام في مصر والفرق بين الرخام والجرانيت | شق التعبان";
const marbleInfoDescription =
  "تعرف على أنواع الرخام في مصر والفرق بين الرخام والجرانيت ومميزات الكوارتز مع نصائح رخام المطابخ والأسعار من شق التعبان.";
const pageUrl = `${canonicalBaseUrl}/marble-info`;
const ogImage = `${canonicalBaseUrl}${seoConfig.images.ogImage.startsWith("/") ? seoConfig.images.ogImage : `/${seoConfig.images.ogImage}`}`;
const twitterImage = `${canonicalBaseUrl}${seoConfig.images.twitterImage.startsWith("/") ? seoConfig.images.twitterImage : `/${seoConfig.images.twitterImage}`}`;

export const metadata = {
  title: marbleInfoTitle,
  description: marbleInfoDescription,
  keywords: [
    "أنواع الرخام في مصر",
    "الفرق بين الرخام والجرانيت",
    "نصائح اختيار الرخام",
    "رخام",
    "جرانيت",
    "شق التعبان",
    "رخام المطبخ",
    "رخام الأرضيات",
    "كوارتز",
    "marble in Egypt",
    "granite in Egypt",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "article",
    locale: "ar_EG",
    url: pageUrl,
    title: marbleInfoTitle,
    description: marbleInfoDescription,
    siteName: seoConfig.siteName,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: marbleInfoTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: marbleInfoTitle,
    description: marbleInfoDescription,
    images: [twitterImage],
  },
};

const faqItems = [
  {
    question: "ما الفرق بين الرخام والجرانيت في مصر؟",
    answer:
      "الرخام أكثر نعومة ولمعاناً لكنه يحتاج صيانة دورية، بينما الجرانيت أصلب وأقل امتصاصاً للبقع، لذلك يناسب المطابخ والأرضيات عالية الاستخدام.",
  },
  {
    question: "ما أفضل رخام للمطبخ في مصر؟",
    answer:
      "للمطابخ ننصح بالكوارتز الصناعي أو الجرانيت المصري لقوة التحمل ومقاومة البقع، مع مراعاة ميزانيتك وطبيعة الاستخدام اليومي.",
  },
  {
    question: "كيف أختار نوع الرخام المناسب للأرضيات؟",
    answer:
      "حدد مستوى الحركة في المكان، واللون المناسب للديكور، ثم قارن بين الرخام الطبيعي والجرانيت والكوارتز من حيث المتانة والصيانة والسعر.",
  },
  {
    question: "هل الرخام المصري جيد للمشاريع السكنية؟",
    answer:
      "نعم، الرخام المصري يقدم قيمة ممتازة مقابل السعر مع تنوع كبير في الألوان، وهو خيار مناسب للشقق والفيلات عند اختيار النوع المناسب للاستخدام.",
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: marbleInfoTitle,
  description: marbleInfoDescription,
  url: pageUrl,
  inLanguage: "ar",
  publisher: {
    "@type": "Organization",
    name: seoConfig.siteName,
    url: canonicalBaseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${canonicalBaseUrl}${seoConfig.images.logo.startsWith("/") ? seoConfig.images.logo : `/${seoConfig.images.logo}`}`,
    },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function MarbleInfoPage() {
  return (
    <>
      <Script
        id="marble-info-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Script
        id="marble-info-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="marble-info-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarbleInfoClient />
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                نصائح اختيار الرخام في مصر
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600 sm:text-base">
                <li>حدد الاستخدام اليومي لتوازن المتانة مع التكلفة.</li>
                <li>اختر الألوان الفاتحة للمساحات الصغيرة والغامقة للفخامة.</li>
                <li>قارن بين الرخام الطبيعي والكوارتز والجرانيت من حيث الصيانة.</li>
                <li>اطلب عينة وشاهدها تحت إضاءة المكان قبل القرار النهائي.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                فوائد الرخام حسب الاستخدام
              </h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600 sm:text-base">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">الأرضيات</h3>
                  <p>مظهر فاخر مع خيارات ألوان واسعة تناسب الطابع المودرن والكلاسيك.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">المطابخ</h3>
                  <p>أسطح متينة مع إمكانية اختيار خامات أقل امتصاصاً للبقع.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">الحمامات</h3>
                  <p>خامة أنيقة تمنح إحساساً بالفخامة وتتحمل الرطوبة مع العناية الدورية.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              أسئلة شائعة عن الرخام والجرانيت في مصر
            </h2>
            <div className="mt-6 space-y-5">
              {faqItems.map((item) => (
                <div key={item.question} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
