import CategoryProductsPage from "@/pages/CategoryProductsPage/CategoryProductsPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

const categoryNames: Record<string, string> = {
  'كيميائيات مبيدات': 'كيميائيات مبيدات',
  'كيميائيات الخضراء': 'كيميائيات الخضراء'
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const categoryName = categoryNames[categoryId] || 'فئة غير معروفة';

  return generateSEO({
    title: categoryName,
    description: `تصفح ${categoryName} في منصة شق الثعبان`,
    keywords: [categoryName, "كيماويات", "منتجات"],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const categoryName = categoryNames[categoryId] || 'فئة غير معروفة';

  return (
    <div className={style.container}>
      <CategoryProductsPage categoryId={categoryId} categoryName={categoryName} />
    </div>
  );
}