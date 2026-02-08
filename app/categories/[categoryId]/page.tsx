import CategoryProductsPage from "@/pages/CategoryProductsPage/CategoryProductsPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";
import { buildBreadcrumbJsonLd, buildCategoryKeywords } from "@/utils/seo";

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

const categoryNames: Record<string, string> = {
  marble: 'رخام',
  granite: 'جرانيت',
  quartz: 'كوارتز',
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const categoryName = categoryNames[categoryId] || decodeURIComponent(categoryId);

  return generateSEO({
    title: categoryName,
    description: `تصفح منتجات ${categoryName} من الرخام والجرانيت والكوارتز في منصة شق الثعبان بمصر.`,
    keywords: buildCategoryKeywords(categoryName),
    url: `/categories/${encodeURIComponent(categoryId)}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const categoryName = categoryNames[categoryId] || decodeURIComponent(categoryId);
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "الفئات", url: "/categories" },
    { name: categoryName, url: `/categories/${encodeURIComponent(categoryId)}` },
  ]);

  return (
    <>
      <div className={style.container}>
        <CategoryProductsPage categoryId={categoryId} categoryName={categoryName} />
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