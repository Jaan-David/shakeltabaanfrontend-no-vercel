import Link from "next/link";
import CategoriesPage from "@/_pages/CategoriesPage/CategoriesPage";

import style from "./page.module.css";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "رخام في مصر وجرانيت في مصر | شق التعبان",
  description:
    "تصفح أنواع الرخام والجرانيت والكوارتز للمطابخ في مصر من شق التعبان مع مقارنة الجودة والاستخدامات لاختيار الأنسب للمشاريع بثقة.",
  keywords: [
    "رخام في مصر",
    "جرانيت في مصر",
    "كوارتز للمطابخ",
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
  url: "/categories",
});

export default function Categories() {
  return (
    <div className={style.container}>
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          دليل تصنيفات الرخام والجرانيت والكوارتز في مصر
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          تجمع شق التعبان أفضل خيارات الرخام والجرانيت والكوارتز في مصر مع تنوع واسع في الألوان والخامات والأسعار.
          ستجد هنا خامات تناسب المطابخ والأرضيات والواجهات والمشاريع التجارية، مع معلومات تساعدك على فهم فروق الجودة
          بين الرخام الطبيعي والكوارتز الصناعي والجرانيت حسب المتانة وسهولة الصيانة. هدفنا تسهيل اختيار الخامة المناسبة
          عبر مقارنة الاستخدامات الشائعة وتوضيح ما يؤثر على السعر مثل المصدر، السمك، وطريقة التشطيب، وحتى تكلفة التركيب.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          إذا كنت تبحث عن كوارتز للمطابخ أو رخام للأرضيات أو جرانيت للواجهات، فستجد تصنيفات واضحة وروابط سريعة لأهم
          الأدلة والصفحات المتخصصة، مع إمكانية الوصول مباشرة لأفضل المنتجات المتاحة في مصر وتقييم الموردين الأكثر ثقة.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-blue-700">
          <Link href="/marble-info" className="hover:text-blue-600">
            تعرف على أنواع الرخام والجرانيت
          </Link>
          <Link href="/marble-uses" className="hover:text-blue-600">
            استكشف استخدامات الرخام المختلفة
          </Link>
          <Link href="/products" className="hover:text-blue-600">
            تصفح منتجات الرخام والجرانيت
          </Link>
        </div>
      </section>
      <CategoriesPage />
    </div>
  );
}