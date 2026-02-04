"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const MARBLE_API_BASES = [
  "https://shk2t-t3ban.fly.dev/app/v1/info/marble",
  "https://shk2t-t3ban.fly.dev/api/v1/info/marble",
];

const fetchFromBases = async (path: string) => {
  for (const base of MARBLE_API_BASES) {
    try {
      const response = await fetch(`${base}${path}`);
      if (!response.ok) continue;
      const data = await response.json();
      if (data?.status === "success") return data;
    } catch {
      // try next base
    }
  }
  return null;
};

const extractArray = (data: any) => {
  const candidates = [
    data?.data,
    data?.data?.data,
    data?.data?.categories,
    data?.categories,
  ];
  return candidates.find((item) => Array.isArray(item)) || [];
};

interface MarbleTypeDetail {
  name: string;
  description?: string;
  colors?: string[];
  idealUses?: string[];
  advantages?: string[];
  disadvantages?: string[];
  howToCheck?: string[];
  care?: string;
  imageList?: string[];
  moneyRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface MarbleCategory {
  _id: string;
  key: string;
  title: string;
  summary?: string;
  advantages?: string[];
  disadvantages?: string[];
  howToCheck?: string[];
  imageList?: string[];
  moneyRange?: {
    min: number;
    max: number;
    currency: string;
  };
  isActive?: boolean;
  types?: MarbleTypeDetail[];
}

function MarbleInfoContent() {
  const router = useRouter();
  const [categories, setCategories] = useState<MarbleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MarbleCategory | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [useQuery, setUseQuery] = useState("");
  const [showCategories, setShowCategories] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchCategories = async () => {
      try {
        const data = await fetchFromBases("/categories");
        const listFromCategories = extractArray(data);
        if (listFromCategories.length > 0) {
          setCategories(listFromCategories);
          return;
        }

        const fallback = await fetchFromBases("");
        const listFromFallback = extractArray(fallback);
        if (listFromFallback.length > 0) {
          setCategories(listFromFallback);
        }
      } catch (error) {
        console.error('Error fetching marble categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [mounted]);

  const fetchCategoryDetails = async (categoryKey: string, type?: string, use?: string) => {
    try {
      setLoadingDetails(true);
      const params = new URLSearchParams();
      params.set("category", categoryKey);
      if (type) params.set("type", type);
      if (use) params.set("use", use);

        const data = await fetchFromBases(`?${params.toString()}`);
        if (data?.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
          setSelectedCategory(data.data[0]);
      } else {
        setSelectedCategory({ key: categoryKey, title: categoryKey, _id: categoryKey, types: [] });
      }
    } catch (error) {
      console.error("Error fetching marble category details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCategoryClick = (category: MarbleCategory) => {
    setSelectedCategory(category);
    setTypeQuery("");
    setUseQuery("");
    setShowCategories(false);
    fetchCategoryDetails(category.key);
  };

  const handleClearFilters = () => {
    if (!selectedCategory) return;
    setTypeQuery("");
    setUseQuery("");
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    setSelectedCategory(null);
    setTypeQuery("");
    setUseQuery("");
  };

  useEffect(() => {
    if (!selectedCategory) return;
    const hasFilters = typeQuery.trim().length > 0 || useQuery.trim().length > 0;
    if (!hasFilters) return;

    const handle = setTimeout(() => {
      fetchCategoryDetails(
        selectedCategory.key,
        typeQuery.trim() || undefined,
        useQuery.trim() || undefined
      );
    }, 400);

    return () => clearTimeout(handle);
  }, [selectedCategory, typeQuery, useQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            معلومات عن الرخام والجرانيت
          </h1>
          <p className="text-xl text-gray-300">
            دليلك الشامل لاختيار أفضل أنواع الرخام والجرانيت
          </p>
        </div>

        {/* Content Sections */}
        {!mounted ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">جاري تحميل...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Categories & Types */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition-all">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">✨</span>
                تصنيفات الرخام والجرانيت
              </h2>

              {showCategories ? (
                loadingCategories ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-400 mt-4">جاري تحميل التصنيفات...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                        className={`text-right bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 transform hover:scale-105 ${
                          selectedCategory?.key === category.key ? "ring-2 ring-blue-500/60" : ""
                        }`}
                      >
                        <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                        <p className="text-gray-400 mb-4 text-sm">{category.summary || ""}</p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToCategories}
                      className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      الرجوع للتصنيفات
                    </button>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedCategory?.title || "الأنواع"}
                    </h3>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                    <div className="flex-1">
                      <label className="block text-gray-300 mb-2">فلتر باسم النوع</label>
                      <input
                        value={typeQuery}
                        onChange={(e) => setTypeQuery(e.target.value)}
                        placeholder="مثال: Galala"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-300 mb-2">فلتر بالاستخدام</label>
                      <input
                        value={useQuery}
                        onChange={(e) => setUseQuery(e.target.value)}
                        placeholder="مثال: flooring,walls"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 border border-white/20"
                        disabled={loadingDetails}
                      >
                        مسح
                      </button>
                    </div>
                  </div>

                  {loadingDetails ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="text-gray-400 mt-4">جاري تحميل الأنواع...</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(selectedCategory?.types || []).map((type) => (
                        <div
                          key={type.name}
                          className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all"
                        >
                          <h4 className="text-lg font-bold text-white mb-2">{type.name}</h4>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{type.description || ""}</p>
                          {type.idealUses && type.idealUses.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {type.idealUses.map((use) => (
                                <span
                                  key={use}
                                  className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/40"
                                >
                                  {use}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {type.moneyRange ? (
                            <p className="text-green-300 text-sm font-semibold">
                              {type.moneyRange.min.toLocaleString("ar-EG")} - {type.moneyRange.max.toLocaleString("ar-EG")} {type.moneyRange.currency}
                            </p>
                          ) : null}
                        </div>
                      ))}
                      {(selectedCategory?.types || []).length === 0 && (
                        <div className="col-span-full text-center py-10">
                          <p className="text-gray-400">لا توجد أنواع مطابقة للفلاتر الحالية</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 1 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-4xl">💎</span>
                ما هو الرخام؟
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                الرخام هو صخر كلسي متحول، يتكون من الحجر الجيري الذي تعرض لدرجات حرارة وضغط عاليين. 
                يتميز الرخام بجماله الطبيعي وألوانه المتنوعة، مما يجعله خياراً مثالياً للديكور الداخلي والخارجي.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-4xl">🏔️</span>
                الفرق بين الرخام والجرانيت
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300 text-lg">
                <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-2xl font-bold text-blue-400 mb-3">الرخام</h3>
                  <ul className="space-y-2">
                    <li>• صخر كلسي متحول</li>
                    <li>• ألوان فاتحة وعروق واضحة</li>
                    <li>• أقل صلابة من الجرانيت</li>
                    <li>• مثالي للديكور الداخلي</li>
                    <li>• يحتاج عناية منتظمة</li>
                  </ul>
                </div>
                <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-2xl font-bold text-purple-400 mb-3">الجرانيت</h3>
                  <ul className="space-y-2">
                    <li>• صخر ناري بلوري</li>
                    <li>• ألوان متنوعة ونقاط بلورية</li>
                    <li>• أكثر صلابة ومتانة</li>
                    <li>• مقاوم للخدش والحرارة</li>
                    <li>• مناسب للمطابخ والأرضيات</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-4xl">🛠️</span>
                نصائح للعناية بالرخام
              </h2>
              <ul className="space-y-3 text-gray-300 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>نظف السطح بقطعة قماش ناعمة ومنظف خاص بالرخام</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>تجنب استخدام المنظفات الحمضية (الخل، الليمون)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>استخدم حماية (سيلر) كل 6-12 شهر</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>امسح السوائل المنسكبة فوراً لتجنب البقع</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>استخدم قواعد تحت الأكواب والأطباق الساخنة</span>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-500/30 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                جاهز لاختيار الرخام المثالي؟
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                تصفح مجموعتنا الواسعة من الرخام والجرانيت عالي الجودة
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarbleInfoPage() {
  return <MarbleInfoContent />;
}
