import CategoriesPage from "@/pages/CategoriesPage/CategoriesPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";
import { buildBreadcrumbJsonLd } from "@/utils/seo";

export const metadata = generateSEO({
  title: "الفئات",
  description: "تصفح فئات الرخام والجرانيت والكوارتز من مصانع ومعارض شق الثعبان في مصر.",
  keywords: ["فئات الرخام", "فئات الجرانيت", "فئات الكوارتز", "رخام", "جرانيت", "كوارتز"],
  url: "/categories",
});

export default function Categories() {
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الفئات", url: "/categories" },
  ]);

  return (
    <>
      <div className={style.container}>
        <CategoriesPage />
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