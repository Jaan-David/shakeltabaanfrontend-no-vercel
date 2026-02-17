<<<<<<< HEAD
import { notFound } from "next/navigation";
import { marbleUseCategories } from "../data";
import MarbleUseWrapper from "./MarbleUseWrapper";

interface MarbleUsePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return marbleUseCategories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: MarbleUsePageProps) {
  const { slug } = await params;
  const category = marbleUseCategories.find(
    (item) => item.slug === slug
  );

  if (!category) {
    return {};
  }

  return {
    title: `${category.title} | شق التعبان`,
    description: category.description,
=======
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { canonicalBaseUrl, generateBreadcrumb, seoConfig } from "@/config/seo.config";
import { marbleUseCategories, type MarbleUseCategory } from "../data";

interface MarbleUsePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return marbleUseCategories.map((item) => ({ slug: item.slug }));
}

const toAbsoluteUrl = (value: string) =>
  value.startsWith("http")
    ? value
    : `${canonicalBaseUrl}${value.startsWith("/") ? value : `/${value}`}`;

const normalizeDescription = (value: string) => value.replace(/\s+/g, " ").trim();

const buildMetaTitle = (category: MarbleUseCategory) => {
  const suffix = "في مصر | شق التعبان";
  const base = category.title.trim();
  const maxLength = 60;
  const available = maxLength - suffix.length - 1;
  const trimmedBase = available > 0 && base.length > available
    ? `${base.slice(0, Math.max(0, available - 1)).trim()}…`
    : base;

  return `${trimmedBase} ${suffix}`.trim();
};

const buildMetaDescription = (category: MarbleUseCategory) => {
  const base = normalizeDescription(category.description);
  const suffix =
    "تعرف على أفضل الاستخدامات والنصائح لاختيار الرخام في مصر مع شق التعبان.";
  let description = normalizeDescription(`${base} ${suffix}`);

  if (description.length < 140) {
    description = normalizeDescription(
      `${description} اكتشف البدائل المناسبة للمشاريع السكنية والتجارية.`
    );
  }

  if (description.length > 160) {
    description = `${description.slice(0, 157).trimEnd()}...`;
  }

  return description;
};

export async function generateMetadata({ params }: MarbleUsePageProps) {
  const { slug } = await params;
  const category = marbleUseCategories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "التصنيف غير موجود | شق التعبان",
      description: "هذا التصنيف غير متاح حالياً.",
    };
  }

  const title = buildMetaTitle(category);
  const description = buildMetaDescription(category);
  const pageUrl = `${canonicalBaseUrl}/marble-uses/${category.slug}`;
  const ogImage = toAbsoluteUrl(category.heroImage);

  return {
    title,
    description,
    keywords: [
      category.title,
      "رخام في مصر",
      "استخدامات الرخام",
      "اختيار الرخام",
      "شق التعبان",
      "marble in Egypt",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      locale: "ar_EG",
      url: pageUrl,
      title,
      description,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f
  };
}

export default async function MarbleUsePage({ params }: MarbleUsePageProps) {
  const { slug } = await params;
<<<<<<< HEAD
  const category = marbleUseCategories.find(
    (item) => item.slug === slug
  );
=======
  const category = marbleUseCategories.find((item) => item.slug === slug);
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f

  if (!category) {
    notFound();
  }

<<<<<<< HEAD
  return <MarbleUseWrapper slug={slug} />;
=======
  const contactLink = `/inquiries?marbleType=${encodeURIComponent(category.title)}`;
  const pageUrl = `${canonicalBaseUrl}/marble-uses/${category.slug}`;
  const breadcrumbJsonLd = generateBreadcrumb([
    { name: "الرئيسية", url: "/" },
    { name: "استخدامات الرخام", url: "/marble-uses" },
    { name: category.title, url: `/marble-uses/${category.slug}` },
  ]);
  const faqItems = [
    {
      question: `ما أفضل استخدامات ${category.title} في مصر؟`,
      answer:
        "يُستخدم هذا النوع بكفاءة في المشاريع السكنية والتجارية حسب درجة التحمل، مع مراعاة طبيعة المكان وحركة الاستخدام اليومية.",
    },
    {
      question: `هل ${category.title} مناسب للمطابخ؟`,
      answer:
        "يُنصح بالتحقق من مقاومة البقع والحرارة، ويمكن اختيار خامات بديلة مثل الجرانيت أو الكوارتز إذا كان الاستخدام مرتفعاً.",
    },
    {
      question: "كيف أحافظ على لمعان الرخام؟",
      answer:
        "استخدم منظفات غير حمضية، واهتم بعملية السيلر الدورية، وتجنب الخدش بالأدوات الحادة لضمان لمعان طويل الأمد.",
    },
  ];
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: buildMetaTitle(category),
    description: buildMetaDescription(category),
    url: pageUrl,
    inLanguage: "ar",
    image: [toAbsoluteUrl(category.heroImage)],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
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
  const relatedCategories = marbleUseCategories
    .filter((item) => item.slug !== category.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Script
        id="marble-use-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="marble-use-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="marble-use-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={category.heroImage}
            alt={`صورة ${category.title} في مصر من شق التعبان`}
            width={1600}
            height={900}
            sizes="100vw"
            className="h-full w-full object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-l from-slate-900/85 via-slate-900/65 to-slate-900/30"
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto flex min-h-[48vh] max-w-6xl flex-col justify-center gap-6 px-4 pb-12 pt-20 text-white sm:min-h-[56vh] sm:pb-16 sm:pt-24 md:pt-28 motion-safe:animate-fade-up">
          <Link
            href="/marble-info"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <span aria-hidden="true">←</span>
            الرجوع للاستخدامات
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {category.title}
            </h1>
            <p className="mt-4 text-base text-white/90 sm:text-lg">
              {category.description}
            </p>
            <p className="mt-3 text-sm text-white/80 sm:text-base">
              اقرأ تفاصيل النوع في <Link href="/marble-info" className="font-semibold text-white underline underline-offset-4">دليل أنواع الرخام والجرانيت في مصر</Link> للحصول على مقارنة شاملة.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {category.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm transition hover:bg-white/20"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={contactLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto"
            >
              اطلب طلبك الخاص الآن
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/products?category=${encodeURIComponent(category.title)}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              تصفح منتجات {category.title}
            </Link>
            <Link
              href="/marble-info"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              تصفح أنواع أخرى
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <div className="space-y-12">
          {category.sections.map((section, index) => (
            <article
              key={section.title}
              className={`pb-12 motion-safe:animate-fade-up ${
                index === category.sections.length - 1
                  ? ""
                  : "border-b border-slate-200/70"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {section.title}
                  </h2>
                  <span className="mt-3 block h-px w-full bg-slate-200/70" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-4 text-slate-700">
                  {section.content.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <p className="text-sm font-semibold text-slate-900">أهم النقاط</p>
                    <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
                            ✓
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              {section.images && section.images.length > 0 ? (
                <div className="mt-10">
                  <div className="group relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:h-64 lg:h-80">
                    <Image
                      src={section.images[0]}
                      alt={`صورة ${section.title} ضمن ${category.title}`}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/10"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              فوائد {category.title} حسب الاستخدام
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600 sm:text-base">
              {category.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              نصائح اختيار الرخام في مصر
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600 sm:text-base">
              <li>حدد مكان الاستخدام ومستوى الحركة قبل اختيار الخامة.</li>
              <li>وازن بين الشكل الجمالي والتكلفة والصيانة الدورية.</li>
              <li>اختر الألوان المناسبة للإضاءة والمساحة لتفادي البقع.</li>
              <li>اطلب عينات متعددة للمقارنة قبل التنفيذ.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            أسئلة شائعة عن {category.title} في مصر
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
      </section>

      {relatedCategories.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              استخدامات رخام ذات صلة
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCategories.map((item) => (
                <Link
                  key={item.id}
                  href={`/marble-uses/${item.slug}`}
                  className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-slate-900"
                >
                  <span className="block text-base font-semibold text-slate-900 group-hover:text-blue-700">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-gradient-to-l from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            جاهز تختار الرخام المناسب؟
          </h2>
          <p className="max-w-2xl text-white/80">
            تواصل معنا الآن لمساعدتك في اختيار النوع الأنسب لمشروعك.
          </p>
          <Link
            href={contactLink}
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            اطلب طلبك الخاص الآن
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/marble-info"
            className="text-sm font-semibold text-white/80 underline underline-offset-4 transition hover:text-white"
          >
            استعرض دليل أنواع الرخام والجرانيت في مصر
          </Link>
        </div>
      </section>
    </div>
  );
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f
}
