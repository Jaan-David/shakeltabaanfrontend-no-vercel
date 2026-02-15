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
  title: "أفضل أنواع الرخام والجرانيت في مصر | منصة شق التعبان",
  description:
    "منصة شق التعبان تقدم أفضل أنواع الرخام والجرانيت الطبيعي في مصر. تصفح الرخام الأبيض والأسود وجرانيت المطابخ وأسعار الرخام في مصر.",
  keywords: [
    "شق التعبان",
    "شقت التعبان",
    "شقه التعبان",
    "رخام",
    "جرانيت",
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
    "كوارتز",
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
    headline: "رخام وجرانيت شق التعبان",
    description:
      "منصة شق التعبان للرخام والجرانيت الطبيعي في مصر مع أفضل الأسعار والتشكيلات.",
    url: homeUrl,
    inLanguage: "ar",
  });

  return (
    <div className={style.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePage />
    </div>
  );
}
