import HomePage from "@/pages/HomePage/HomePage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";
import { buildBreadcrumbJsonLd, buildKeywordSet } from "@/utils/seo";

export const metadata = generateSEO({
  title: "شق الثعبان | رخام وجرانيت وكوارتز في مصر",
  description: "اكتشف مصانع ومعارض الرخام والجرانيت والكوارتز في شق الثعبان مع مقارنة أسعار اليوم وتواصل مباشر في مصر.",
  keywords: buildKeywordSet({
    baseKeywords: [
      "رخام شق الثعبان",
      "اسعار الرخام",
      "مصانع رخام",
      "معرض رخام",
      "جرانيت مطابخ",
      "كوارتز مطابخ",
    ],
    intents: ["buy", "price", "supplier", "export"],
  }),
});

export default function Home() {
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
  ]);

  return (
    <>
      <div className={style.container}>
        <HomePage />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
