"use client";

import { useRouter } from "next/navigation";
import CategoryCard from "@/components/UI/CategoryCard/CategoryCard";
import { marbleUseCategories } from "./data";

export default function MarbleUsesPage() {
  const router = useRouter();

  const handleOrderClick = (marbleType: string) => {
    router.push(`/inquiries?marbleType=${encodeURIComponent(marbleType)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative isolate py-16 px-4 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            استخدامات الرخام
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            اكتشف الطرق المختلفة لاستخدام الرخام في تزيين منزلك وتحسين جودة الحياة
          </p>
          <p className="text-sm sm:text-base text-slate-500">
            من الأرضيات إلى المطابخ والحمامات، الرخام يضيف الفخامة والجمال لأي مكان
          </p>
        </div>
      </section>

      {/* How to Choose Guide Section */}
      <section className="bg-white border-y border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              كيفية اختيار الفئة المناسبة
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              اتبع هذه الخطوات البسيطة لاختيار نوع الرخام الذي يناسب احتياجاتك
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                حدد المكان
              </h3>
              <p className="text-sm text-slate-600">
                هل تريد رخاماً للأرضيات، المطبخ، الحمام، أم السلالم؟
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                اختر النوع
              </h3>
              <p className="text-sm text-slate-600">
                طبيعي أم صناعي؟ كل نوع له مميزاته وأسعاره
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                حدد اللون
              </h3>
              <p className="text-sm text-slate-600">
                فاتح يعطي اتساعاً، غامق يعكس فخامة وقوة
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                قارن الأسعار
              </h3>
              <p className="text-sm text-slate-600">
                أسعار متنوعة لتناسب جميع الميزانيات
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                5
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                اطلب الآن
              </h3>
              <p className="text-sm text-slate-600">
                تواصل معنا للحصول على أفضل الخدمات
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 pb-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {marbleUseCategories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              description={category.description}
              image={category.heroImage}
              href={`/marble-uses/${category.slug}`}
              marbleType={category.title}
              onOrderClick={() => handleOrderClick(category.title)}
            />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                جودة عالية
              </h3>
              <p className="text-slate-600 text-sm">
                نختار أفضل أنواع الرخام الطبيعي لضمان جودة عالية وديمومة طويلة
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                تصاميم متنوعة
              </h3>
              <p className="text-slate-600 text-sm">
                ألوان وتصاميم متعددة تناسب جميع أذواق الديكور والتفضيلات
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                تركيب احترافي
              </h3>
              <p className="text-slate-600 text-sm">
                فريق متخصص يضمن تركيب صحيح وآمن لجميع أعمالك
              </p>
            </div>
          </div>

          {/* Browse Products Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <span>تصفح المنتجات</span>
              <svg 
                className="w-5 h-5 rtl:rotate-180" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
