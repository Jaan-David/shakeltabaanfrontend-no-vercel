import CategoriesPage from "@/pages/CategoriesPage/CategoriesPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "الفئات",
  description: "تصفح فئات المنتجات الكيميائية",
  keywords: ["كيماويات", "فئات", "منتجات"],
});

export default function Categories() {
  return (
    <div className={style.container}>
      <CategoriesPage />
    </div>
  );
}