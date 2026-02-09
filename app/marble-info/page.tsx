"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";
const ALT_API_BASE_URL = API_BASE_URL.replace("/app/v1", "/api/v1");
const MARBLE_API_BASES = [
  `${API_BASE_URL}/info/marble`,
  `${ALT_API_BASE_URL}/info/marble`,
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

const formatPriceRange = (range?: MarbleCategory["moneyRange"] | MarbleTypeDetail["moneyRange"]) => {
  if (!range) return null;
  return `${range.min.toLocaleString("ar-EG")} - ${range.max.toLocaleString("ar-EG")} ${range.currency}`;
};

const renderLimitedList = (items?: string[], limit = 3) => {
  if (!items || items.length === 0) return null;
  return items.slice(0, limit);
};

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
  const [expandedTypeKeys, setExpandedTypeKeys] = useState<Record<string, boolean>>({});

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

  const toggleTypeExpansion = (key: string) => {
    setExpandedTypeKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">
            معلومات عن الرخام والجرانيت
          </h1>
          <p className="text-xl text-[#475569]">
            دليلك الشامل لاختيار أفضل أنواع الرخام والجرانيت
          </p>
        </div>

        {/* Content Sections */}
        {!mounted ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-[#475569] mt-4">جاري تحميل...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Categories & Types */}
            <div className="bg-white rounded-2xl p-8 border border-[#cbd5f5] transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-6 flex items-center gap-3">
                <span className="text-4xl">✨</span>
                تصنيفات الرخام والجرانيت
              </h2>

              {showCategories ? (
                loadingCategories ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-[#475569] mt-4">جاري تحميل التصنيفات...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                        className={`text-right bg-white rounded-xl p-6 border border-[#cbd5f5] transition-all hover:border-[#3b82f6] hover:shadow-[0_10px_24px_rgba(59,130,246,0.15)] hover:-translate-y-1 ${
                          selectedCategory?.key === category.key ? "ring-2 ring-blue-500/60" : ""
                        }`}
                      >
                        {category.imageList && category.imageList.length > 0 ? (
                          <div className="mb-4 overflow-hidden rounded-lg border border-[#cbd5f5]">
                            <img
                              src={category.imageList[0]}
                              alt={category.title}
                              className="w-full h-40 object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                        <h3 className="text-xl font-bold text-[#1e293b] mb-2">{category.title}</h3>
                        <p className="text-[#475569] mb-4 text-sm line-clamp-2">{category.summary || ""}</p>
                        <div className="flex flex-wrap gap-2 text-xs mb-4">
                          {formatPriceRange(category.moneyRange) && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {formatPriceRange(category.moneyRange)}
                            </span>
                          )}
                          {typeof category.types?.length === "number" && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                              الأنواع: {category.types.length}
                            </span>
                          )}
                        </div>
                        {renderLimitedList(category.advantages, 2) && (
                          <div className="text-sm text-[#475569]">
                            <p className="font-semibold text-[#1e293b] mb-1">مميزات</p>
                            <ul className="list-disc list-inside space-y-1">
                              {renderLimitedList(category.advantages, 2)?.map((adv) => (
                                <li key={adv}>{adv}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToCategories}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      الرجوع للتصنيفات
                    </button>
                    <h3 className="text-2xl font-bold text-[#0f172a]">
                      {selectedCategory?.title || "الأنواع"}
                    </h3>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                    <div className="flex-1">
                      <label className="block text-[#0f172a] mb-2">فلتر باسم النوع</label>
                      <input
                        value={typeQuery}
                        onChange={(e) => setTypeQuery(e.target.value)}
                        placeholder="مثال: Galala"
                        className="w-full bg-white border border-[#cbd5f5] rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[#0f172a] mb-2">فلتر بالاستخدام</label>
                      <input
                        value={useQuery}
                        onChange={(e) => setUseQuery(e.target.value)}
                        placeholder="مثال: flooring,walls"
                        className="w-full bg-white border border-[#cbd5f5] rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-white text-[#0f172a] rounded-xl font-semibold transition-all duration-300 border border-[#cbd5f5] hover:border-[#3b82f6] hover:shadow-[0_10px_24px_rgba(59,130,246,0.15)] hover:-translate-y-0.5"
                        disabled={loadingDetails}
                      >
                        مسح
                      </button>
                    </div>
                  </div>

                  {loadingDetails ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="text-[#475569] mt-4">جاري تحميل الأنواع...</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(selectedCategory?.types || []).map((type, index) => {
                        const typeKey = `${selectedCategory?.key || "category"}-${type.name}-${index}`;
                        const isExpanded = !!expandedTypeKeys[typeKey];
                        return (
                        <div
                          key={typeKey}
                          className="bg-white rounded-xl p-6 border border-[#cbd5f5] transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
                        >
                          {type.imageList && type.imageList.length > 0 ? (
                            <div className="mb-4 overflow-hidden rounded-lg border border-[#cbd5f5]">
                              <img
                                src={type.imageList[0]}
                                alt={type.name}
                                className="w-full h-40 object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : null}
                          <h4 className="text-lg font-bold text-[#1e293b] mb-2">{type.name}</h4>
                          <p className={`text-[#475569] text-sm mb-3 ${isExpanded ? "" : "line-clamp-3"}`}>
                            {type.description || ""}
                          </p>
                          <div className="space-y-3 mb-3">
                            {type.colors && type.colors.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#1e293b] mb-1">الألوان</p>
                                <div className="flex flex-wrap gap-2">
                                  {(isExpanded ? type.colors : type.colors.slice(0, 4)).map((color, colorIndex) => (
                                    <span key={`${color}-${colorIndex}`} className="px-2.5 py-1 text-xs rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {type.idealUses && type.idealUses.length > 0 ? (
                              <div>
                                <p className="text-xs font-semibold text-[#1e293b] mb-1">الاستخدامات</p>
                                <div className="flex flex-wrap gap-2">
                                  {(isExpanded ? type.idealUses : type.idealUses.slice(0, 4)).map((use) => (
                                    <span key={use} className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      {use}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          {isExpanded && (
                            <>
                              <div className="grid grid-cols-1 gap-3 text-sm text-[#475569]">
                                {renderLimitedList(type.advantages, type.advantages?.length || 0) && (
                                  <div>
                                    <p className="font-semibold text-[#1e293b] mb-1">مميزات</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {renderLimitedList(type.advantages, type.advantages?.length || 0)?.map((adv) => (
                                        <li key={adv}>{adv}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {renderLimitedList(type.disadvantages, type.disadvantages?.length || 0) && (
                                  <div>
                                    <p className="font-semibold text-[#1e293b] mb-1">عيوب</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {renderLimitedList(type.disadvantages, type.disadvantages?.length || 0)?.map((dis) => (
                                        <li key={dis}>{dis}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              {renderLimitedList(type.howToCheck, type.howToCheck?.length || 0) && (
                                <div className="mt-3 text-sm text-[#475569]">
                                  <p className="font-semibold text-[#1e293b] mb-1">كيف تتحقق؟</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {renderLimitedList(type.howToCheck, type.howToCheck?.length || 0)?.map((check) => (
                                      <li key={check}>{check}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {type.care && (
                                <p className="mt-3 text-sm text-[#475569]">
                                  <span className="font-semibold text-[#1e293b]">العناية:</span> {type.care}
                                </p>
                              )}
                            </>
                          )}
                          {type.moneyRange ? (
                            <p className="text-emerald-600 text-sm font-semibold mt-3">
                              {formatPriceRange(type.moneyRange)}
                            </p>
                          ) : null}
                          {(type.description || type.colors?.length || type.idealUses?.length || type.advantages?.length || type.disadvantages?.length || type.howToCheck?.length || type.care) && (
                            <button
                              onClick={() => toggleTypeExpansion(typeKey)}
                              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                            >
                              {isExpanded ? "عرض أقل" : "عرض المزيد"}
                            </button>
                          )}
                        </div>
                      );
                      })}
                      {(selectedCategory?.types || []).length === 0 && (
                        <div className="col-span-full text-center py-10">
                          <p className="text-[#475569]">لا توجد أنواع مطابقة للفلاتر الحالية</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 1 */}
            <div className="bg-[#eff6ff] rounded-2xl p-8 border border-[#3b82f6] transition-all">
              <h2 className="text-3xl font-semibold text-[#1e40af] mb-4 flex items-center gap-3">
                <span className="text-4xl">💎</span>
                ما هو الرخام؟
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed">
                الرخام هو صخر كلسي متحول، يتكون من الحجر الجيري الذي تعرض لدرجات حرارة وضغط عاليين. 
                يتميز الرخام بجماله الطبيعي وألوانه المتنوعة، مما يجعله خياراً مثالياً للديكور الداخلي والخارجي.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#cbd5f5] transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-4 flex items-center gap-3">
                <span className="text-4xl">🏔️</span>
                الفرق بين الرخام والجرانيت
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-[#475569] text-lg">
                <div className="bg-white rounded-xl p-6 border border-[#cbd5f5]">
                  <h3 className="text-2xl font-bold text-[#1e293b] mb-3">الرخام</h3>
                  <ul className="space-y-2">
                    <li>• صخر كلسي متحول</li>
                    <li>• ألوان فاتحة وعروق واضحة</li>
                    <li>• أقل صلابة من الجرانيت</li>
                    <li>• مثالي للديكور الداخلي</li>
                    <li>• يحتاج عناية منتظمة</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#cbd5f5]">
                  <h3 className="text-2xl font-bold text-[#1e293b] mb-3">الجرانيت</h3>
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
            <div className="bg-white rounded-2xl p-8 border border-[#cbd5f5] transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-4 flex items-center gap-3">
                <span className="text-4xl">🛠️</span>
                نصائح للعناية بالرخام
              </h2>
              <ul className="space-y-3 text-[#475569] text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>نظف السطح بقطعة قماش ناعمة ومنظف خاص بالرخام</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>تجنب استخدام المنظفات الحمضية (الخل، الليمون)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>استخدم حماية (سيلر) كل 6-12 شهر</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>امسح السوائل المنسكبة فوراً لتجنب البقع</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>استخدم قواعد تحت الأكواب والأطباق الساخنة</span>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-2xl p-8 border border-[#cbd5f5] text-center transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-4">
                جاهز لاختيار الرخام المثالي؟
              </h2>
              <p className="text-[#475569] text-lg mb-6">
                تصفح مجموعتنا الواسعة من الرخام والجرانيت عالي الجودة
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
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
