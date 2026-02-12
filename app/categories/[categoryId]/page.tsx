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
    title: `${categoryName} | انواع الرخام المصري`,
    description: `تصفح ${categoryName} مع مقارنة الرخام والجرانيت والكوارتز واختيار افضل خامة للمطبخ والارضيات.`,
    keywords: [
      categoryName,
      "انواع الرخام المصري",
      "الفرق بين الرخام والجرانيت",
      "افضل رخام للمطبخ",
      "افضل جرانيت للارضيات",
      "انواع الكوارتز الصناعي",
      "مميزات الرخام الطبيعي",
      "عيوب الرخام الصناعي",
      "best marble for kitchen countertops",
      "granite vs marble durability",
      "quartz vs granite comparison",
      "types of marble stone",
    ],
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