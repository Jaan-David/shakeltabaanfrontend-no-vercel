import HomePage from "@/_pages/HomePage/HomePage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "منصة بيع رخام اونلاين مصر | سوق الرخام المصري",
  description:
    "منصة بيع رخام اونلاين مصر وسوق الرخام المصري لشراء رخام وجرانيت وكوارتز للمطابخ والمشاريع بجودة عالية.",
  keywords: [
    "منصة بيع رخام اونلاين مصر",
    "سوق الرخام المصري",
    "منصة موردين الرخام",
    "دليل مصانع شق التعبان",
    "شراء رخام في مصر",
    "رخام للبيع في القاهرة",
    "رخام شق التعبان للبيع",
    "جرانيت مطابخ للبيع",
    "شراء كوارتز للمطابخ",
    "stone marketplace egypt",
    "marble trading platform",
    "buy marble online egypt",
    "marble slabs for sale egypt",
    "granite suppliers egypt",
    "quartz countertop supplier egypt",
  ],
});

export default function Home() {
  return (
    <div className={style.container}>
      <HomePage />
    </div>
  );
}
