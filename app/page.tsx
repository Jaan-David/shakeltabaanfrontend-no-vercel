import HomePage from "@/pages/HomePage/HomePage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "الصفحة الرئيسية",
  description: "منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت",
  keywords: ["كيماويات", "تجارة"],
});

export default function Home() {
  return (
    <div className={style.container}>
      <HomePage />
    </div>
  );
}
