import CategoriesPage from "@/_pages/CategoriesPage/CategoriesPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "انواع الرخام المصري بالصور | افضل رخام للمطابخ",
  description:
    "تصفح انواع الرخام والجرانيت والكوارتز مع مقارنة الرخام والجرانيت واختيار افضل خامة كونترتوب للمطبخ.",
  keywords: [
    "انواع الرخام المصري بالصور",
    "الفرق بين الرخام والجرانيت",
    "الفرق بين الجرانيت والكوارتز",
    "افضل رخام للمطابخ في مصر",
    "افضل جرانيت للمطبخ",
    "افضل كوارتز للمطبخ",
    "مقارنة الرخام والكوارتز",
    "افضل خامة كونترتوب مطبخ",
    "quartz vs granite countertops",
    "marble vs quartz kitchen",
    "types of marble egypt",
    "natural vs engineered quartz",
  ],
});

export default function Categories() {
  return (
    <div className={style.container}>
      <CategoriesPage />
    </div>
  );
}