import Script from "next/script";
import HomePage from "@/_pages/HomePage/HomePage";

import style from "./page.module.css";
import { canonicalBaseUrl, generateSEO, seoConfig } from "@/config/seo.config";

export const dynamic = "force-dynamic";

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
    : canonicalBaseUrl;

const stripUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const metadata = generateSEO({
  title: "منصة شق التعبان | رخام وجرانيت في مصر | أفضل الأسعار والتوريد",
  description:
    "منصة شق التعبان - أول وأكبر منصة للرخام والجرانيت في مصر. اكتشف أفضل أسعار الرخام والجرانيت والكوارتز مع خدمة توريد وتركيب موثوقة لجميع المشاريع.",
  keywords: [
    // Brand keywords
    "شق التعبان",
    "منصة شق التعبان",
    "شقت التعبان",
    "شقه التعبان",
    "شق الثعبان",
    // Core product keywords
    "رخام",
    "جرانيت",
    "كوارتز",
    // Commercial intent keywords
    "رخام في مصر",
    "جرانيت في مصر",
    "كوارتز مطابخ",
    "اسعار الرخام",
    "اسعار الجرانيت",
    "سعر الرخام في مصر",
    "سعر الجرانيت في مصر",
    "أسعار الرخام في مصر",
    "سعر الرخام",
    "سعر الرخامه",
    // Service keywords
    "توريد رخام",
    "تركيب رخام",
    "توريد وتركيب رخام",
    "توريد رخام في مصر",
    "موردين رخام في مصر",
    "موردين جرانيت في مصر",
    "رخام بالجملة",
    // Product-specific keywords
    "رخام شق التعبان",
    "جرانيت شق التعبان",
    "رخام مصر",
    "جرانيت مصر",
    "رخام المطبخ",
    "رخامه مطبخ",
    "رخام أبيض طبيعي",
    "جرانيت أسود",
    "رخام أرضيات",
    "جرانيت مطابخ",
    "رخامه سلم",
    // Informational keywords
    "الفرق بين الرخام والجرانيت",
    "أنواع الرخام",
    "أنواع الجرانيت",
    // English keywords
    "marble Egypt",
    "granite Egypt",
    "marble suppliers egypt",
    "granite suppliers egypt",
  ],
  image: seoConfig.images.logo,
  url: "/",
});

export default function Home() {
  const homeUrl = `${getSiteUrl()}/`;
  const homeJsonLd = stripUndefined({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "منصة شق التعبان - أول وأكبر منصة للرخام والجرانيت في مصر",
    headline: "منصة شق التعبان | رخام وجرانيت في مصر | أفضل الأسعار والتوريد",
    description:
      "منصة شق التعبان الرائدة في مصر لتوريد وتركيب الرخام والجرانيت والكوارتز بأفضل الأسعار. خدمة موثوقة لجميع المشاريع السكنية والتجارية.",
    url: homeUrl,
    inLanguage: "ar",
    about: {
      "@type": "Thing",
      name: "رخام وجرانيت في مصر",
      description: "منصة متخصصة في توريد وتركيب الرخام والجرانيت والكوارتز في مصر",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${homeUrl}products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

  return (
    <div className={style.container}>
      <Script
        id="home-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePage />
    </div>
  );
}
