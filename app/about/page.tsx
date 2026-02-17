import Script from "next/script";
import AboutPage from "@/_pages/AboutPage/Aboutpage";

import { canonicalBaseUrl, generateSEO, seoConfig } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "مصانع الرخام في مصر | شق التعبان",
  description:
    "تعرف على شق التعبان كمركز توريد رخام وجرانيت وكوارتز في مصر للمشاريع السكنية والتجارية مع موردين موثوقين وخبرة سوق واسعة.",
  keywords: [
    "افضل مصانع الرخام في مصر",
    "تقييم مصانع شق التعبان",
    "افضل مورد جرانيت مصري",
    "جودة الرخام المصري",
    "شركات رخام موثوقة مصر",
    "تجارب شراء رخام من شق التعبان",
    "رخام عالي الجودة مصر",
    "best marble suppliers egypt",
    "trusted granite supplier egypt",
    "top stone exporters egypt",
  ],
  url: "/about",
});

export default function Page() {
  const pageUrl = `${canonicalBaseUrl}/about`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "مصانع الرخام في مصر | شق التعبان",
    description:
      "تعرف على شق التعبان كمركز توريد رخام وجرانيت وكوارتز في مصر مع موردين موثوقين وخدمات للمشاريع.",
    url: pageUrl,
    inLanguage: "ar",
    publisher: {
      "@type": "Organization",
      name: seoConfig.siteName,
      url: canonicalBaseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${canonicalBaseUrl}${seoConfig.images.logo}`,
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-transparent">
      <Script
        id="about-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="w-full max-w-[380px] sm:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1360px] min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <AboutPage />
      </div>
    </div>
  );
}
