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
  title: "رخام في مصر وجرانيت في مصر | شق التعبان",
  description:
    "اكتشف أفضل رخام في مصر وجرانيت في مصر وكوارتز للمطابخ من منصة شق التعبان مع أسعار محدثة وتوريد موثوق ومقارنات واضحة.",
  keywords: [
    "شق التعبان",
    "شقت التعبان",
    "شقه التعبان",
    "رخام",
    "جرانيت",
    "كوارتز",
    "توريد رخام في مصر",
    "رخام في مصر",
    "جرانيت في مصر",
    "رخام شق التعبان",
    "جرانيت شق التعبان",
    "رخام مصر",
    "جرانيت مصر",
    "marble Egypt",
    "granite Egypt",
    "رخام المطبخ",
    "رخام أبيض طبيعي",
    "جرانيت أسود",
    "رخام أرضيات",
    "جرانيت مطابخ",
    "أسعار الرخام في مصر",
    "سعر الرخام",
    "سعر الرخامه",
    "رخامه سلم",
    "رخامه مطبخ",
    "الفرق بين الرخام والجرانيت",
    "أنواع الرخام",
  ],
  image: seoConfig.images.logo,
  url: "/",
});

export default function Home() {
  const homeUrl = `${getSiteUrl()}/`;
  const homeJsonLd = stripUndefined({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "منصة شق التعبان",
    headline: "رخام في مصر وجرانيت في مصر | شق التعبان",
    description:
      "منصة شق التعبان للرخام والجرانيت الطبيعي في مصر مع أسعار محدثة وتوريد موثوق واختيارات واسعة للمطابخ والأرضيات.",
    url: homeUrl,
    inLanguage: "ar",
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
