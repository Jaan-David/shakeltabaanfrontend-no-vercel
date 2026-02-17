"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import CategoryCard from "@/components/UI/CategoryCard/CategoryCard";
import { marbleUseCategories } from "@/app/marble-uses/data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";
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

const formatPriceRange = (
  range?: MarbleCategory["moneyRange"] | MarbleTypeDetail["moneyRange"]
) => {
  if (!range) return null;
  return `${range.min.toLocaleString("ar-EG")} - ${range.max.toLocaleString(
    "ar-EG"
  )} ${range.currency}`;
};

const renderLimitedList = (items?: string[], limit = 3) => {
  if (!items || items.length === 0) return null;
  return items.slice(0, limit);
};

interface ExpandableCategoryCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  expanded: boolean;
  onToggle: () => void;
  onDetailsClick: () => void;
  onOrderClick: () => void;
}

function ExpandableCategoryCard({
  id,
  title,
  description,
  image,
  badge,
  expanded,
  onToggle,
  onDetailsClick,
  onOrderClick,
}: ExpandableCategoryCardProps) {
  const contentId = `${id}-content`;
  const cardRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const descriptionSegments = useMemo(() => {
    const rawSegments = description
      .split(/[,،.!؟؛]\s*/)
      .map((segment) => segment.trim())
      .filter(Boolean);
    return rawSegments.length > 0 ? rawSegments : [description];
  }, [description]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  const handleDetailsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDetailsClick();
  };

  const handleOrderClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOrderClick();
  };

  const handleChevronClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  useEffect(() => {
    if (!contentRef.current) return;
    setContentHeight(contentRef.current.scrollHeight);
  }, [descriptionSegments, expanded]);

  const handleToggle = () => {
    const nextExpanded = !expanded;
    onToggle();

    if (nextExpanded && typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (isMobile) {
        requestAnimationFrame(() => {
          cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  };

  return (
    <article
      ref={cardRef}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl ${
        expanded ? "shadow-xl ring-1 ring-blue-100" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls={contentId}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className={`object-cover transition-transform duration-300 ${
            expanded ? "scale-[0.98]" : "group-hover:scale-[1.03]"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {badge}
            </span>
            <button
              type="button"
              onClick={handleChevronClick}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-transform duration-300 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
              aria-label={expanded ? "إغلاق التفاصيل" : "عرض التفاصيل"}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.27a.75.75 0 0 1-.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {!expanded && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        <div
          id={contentId}
          className={`transition-all duration-300 ${
            expanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ maxHeight: expanded ? contentHeight : 0, overflow: "hidden" }}
        >
          <div ref={contentRef} className="pt-2">
            <div className="space-y-2">
              {descriptionSegments.map((segment, index) => (
                <span
                  key={`${segment}-${index}`}
                  className={`block text-sm text-slate-600 leading-relaxed transition-all duration-300 ${
                    expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  {segment}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`mt-4 grid gap-3 transition-all duration-300 ${
            expanded
              ? "max-h-32 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={handleDetailsClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            تفاصيل أكثر
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            onClick={handleOrderClick}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            اطلب الآن
          </button>
        </div>
      </div>
    </article>
  );
}

function MarbleInfoContent() {
  const router = useRouter();
  const curatedUseCategories = useMemo<MarbleCategory[]>(
    () =>
      marbleUseCategories.map((item) => ({
        _id: item.id,
        key: item.slug,
        title: item.title,
        summary: item.description,
        imageList: [item.heroImage],
        isActive: true,
      })),
    []
  );

  const [categories, setCategories] = useState<MarbleCategory[]>(curatedUseCategories);
  const [selectedCategory, setSelectedCategory] =
    useState<MarbleCategory | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [useQuery, setUseQuery] = useState("");
  const [showCategories, setShowCategories] = useState(true);
  const [activeType, setActiveType] = useState<MarbleTypeDetail | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [expandedCategoryKey, setExpandedCategoryKey] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchCategories = async () => {
      let loadedFromApi = false;

      try {
        const data = await fetchFromBases("/categories");
        const listFromCategories = extractArray(data);
        if (listFromCategories.length > 0) {
          setCategories(listFromCategories);
          loadedFromApi = true;
          return;
        }

        const fallback = await fetchFromBases("");
        const listFromFallback = extractArray(fallback);
        if (listFromFallback.length > 0) {
          setCategories(listFromFallback);
          loadedFromApi = true;
        }
      } catch (error) {
        console.error("Error fetching marble categories:", error);
      } finally {
        if (!loadedFromApi) {
          setCategories(curatedUseCategories);
        }
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [mounted, curatedUseCategories]);

  const fetchCategoryDetails = async (
    categoryKey: string,
    type?: string,
    use?: string
  ) => {
    try {
      setLoadingDetails(true);
      const params = new URLSearchParams();
      params.set("category", categoryKey);
      if (type) params.set("type", type);
      if (use) params.set("use", use);

      const data = await fetchFromBases(`?${params.toString()}`);
      if (data?.status === "success" && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          setSelectedCategory(data.data[0]);
        } else {
          setSelectedCategory({
            key: categoryKey,
            title: categoryKey,
            _id: categoryKey,
            types: [],
          });
        }
      } else {
        setSelectedCategory({
          key: categoryKey,
          title: categoryKey,
          _id: categoryKey,
          types: [],
        });
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

  const openTypeDetails = (type: MarbleTypeDetail) => {
    setActiveType(type);
    setActiveImageIndex(0);
    setIsModalLoading(true);
    setIsModalOpen(true);
  };

  const closeTypeDetails = () => {
    setIsModalOpen(false);
    setActiveType(null);
    setActiveImageIndex(0);
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

  useEffect(() => {
    if (!isModalOpen) return;
    const timeout = setTimeout(() => setIsModalLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTypeDetails();
        return;
      }
      if (event.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const getCategoryDisplay = (category: MarbleCategory) => {
    const match = marbleUseCategories.find(
      (item) =>
        item.slug === category.key ||
        item.title === category.title ||
        item.id === category._id
    );

    const normalize = (value?: string) => (value || "").trim().toLowerCase().replace(/ى/g, 'ي');

    const rawDescription =
      category.summary ||
      match?.description ||
      match?.highlights?.[0] ||
      "تعرف على تفاصيل كل فئة واستخداماتها.";

    const description =
      rawDescription.length > 120
        ? `${rawDescription.slice(0, 117)}...`
        : rawDescription;

    const slug = match?.slug || category.key || "";
    const title = category.title || match?.title || "";
    const normalizedTitle = normalize(title);

    // Category Images Mapping with multiple variations
    const categoryImages: Record<string, string> = {
      "جرانيت مستورد": "/categories/جرانيت مستورد.jpeg",
      "جرانيت مصرى": "/categories/جرانيت مصري.jpeg",
      "جرانيت مصري": "/categories/جرانيت مصري.jpeg",
      "رخام مستورد": "/categories/رخام مستورد.jpeg",
      "رخام مصرى": "/categories/رخام مصري.jpeg",
      "رخام مصري": "/categories/رخام مصري.jpeg",
      "كوارتز": "/categories/كوارتز.jpeg",
      "رخام مصنع": "/categories/رخام صناعي.jpeg",
      "رخام صناعي": "/categories/رخام صناعي.jpeg",
      "اعمال النحت": "/categories/اعمال نحت.jpeg",
      "اعمال نحت": "/categories/اعمال نحت.jpeg",
    };

    // Try exact match first
    let image = categoryImages[title];
    
    // If no exact match, try normalized matching
    if (!image) {
      for (const [key, value] of Object.entries(categoryImages)) {
        if (normalize(key) === normalizedTitle) {
          image = value;
          break;
        }
      }
    }
    
    // If still no match, try partial matching based on keywords
    if (!image) {
      if (normalizedTitle.includes('جرانيت') && normalizedTitle.includes('مستورد')) {
        image = "/categories/جرانيت مستورد.jpeg";
      } else if (normalizedTitle.includes('جرانيت') && (normalizedTitle.includes('مصري') || normalizedTitle.includes('مصري'))) {
        image = "/categories/جرانيت مصري.jpeg";
      } else if (normalizedTitle.includes('رخام') && normalizedTitle.includes('مستورد')) {
        image = "/categories/رخام مستورد.jpeg";
      } else if (normalizedTitle.includes('رخام') && (normalizedTitle.includes('مصري') || normalizedTitle.includes('مصري'))) {
        image = "/categories/رخام مصري.jpeg";
      } else if (normalizedTitle.includes('كوارتز')) {
        image = "/categories/كوارتز.jpeg";
      } else if (normalizedTitle.includes('رخام') && (normalizedTitle.includes('صناعي') || normalizedTitle.includes('مصنع'))) {
        image = "/categories/رخام صناعي.jpeg";
      } else if (normalizedTitle.includes('نحت')) {
        image = "/categories/اعمال نحت.jpeg";
      }
    }
    
    // Fallback to other sources
    if (!image) {
      image = category.imageList?.[0] || match?.heroImage || "/acessts/placeholder.svg";
    }

    // Get proper category type for badge
    let categoryType = "رخام";
    if (normalizedTitle.includes('جرانيت')) {
      categoryType = "جرانيت";
    } else if (normalizedTitle.includes('كوارتز')) {
      categoryType = "كوارتز";
    } else if (normalizedTitle.includes('نحت')) {
      categoryType = "نحت";
    }

    return { title, description, image, slug, categoryType };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 shadow-sm md:px-10 md:py-16">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50"
            aria-hidden="true"
          />
          <div
            className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative text-center">
            <p className="text-sm font-semibold text-blue-700">
              دليل شق التعبان للرخام
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              دليلك الشامل لاختيار أنسب أنواع الرخام والجرانيت
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              معلومات عن الرخام والجرانيت
            </p>
          </div>
        </section>

        {/* Content Sections */}
        {!mounted ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-600">جاري تحميل...</p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-20">
            {/* How to Choose Guide Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 sm:p-8 md:p-10">
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                  كيفية اختيار الفئة المناسبة
                </h2>
                <p className="mt-3 text-base text-slate-600 sm:text-lg">
                  اتبع هذه الخطوات البسيطة لاختيار نوع الرخام الذي يناسب احتياجاتك
                </p>
              </div>

              <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 lg:before:absolute lg:before:inset-x-6 lg:before:top-8 lg:before:h-px lg:before:bg-slate-200">
                {/* Step 1 */}
                <div className="relative z-10 flex h-full flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    1
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    حدد المكان
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    هل تريد رخاماً للأرضيات، المطبخ، الحمام، أم السلالم؟
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex h-full flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    2
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    اختر النوع
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    طبيعي أم صناعي؟ كل نوع له مميزاته وأسعاره
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex h-full flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    3
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    حدد اللون
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    فاتح يعطي اتساعاً، غامق يعكس فخامة وقوة
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex h-full flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    4
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    قارن الأسعار
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    أسعار متنوعة لتناسب جميع الميزانيات
                  </p>
                </div>

                {/* Step 5 */}
                <div className="relative z-10 flex h-full flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    5
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    اطلب الآن
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    تواصل معنا للحصول على أفضل الخدمات
                  </p>
                </div>
              </div>
            </section>

            {/* Marble Uses Categories Grid */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 sm:p-8 md:p-10">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
                <span className="text-3xl" aria-hidden="true">
                  🏢
                </span>
                تصنيفات استخدام الرخام
              </h2>
              
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {marbleUseCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.title}
                    description={category.description}
                    image={category.heroImage}
                    href={`/marble-uses/${category.slug}`}
                    marbleType={category.title}
                    onOrderClick={() => router.push(`/inquiries?marbleType=${encodeURIComponent(category.title)}`)}
                  />
                ))}
              </div>
            </section>

            {/* Comprehensive Comparison Table */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 sm:p-8 md:p-10">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
                <span className="text-3xl" aria-hidden="true">
                  📊
                </span>
                مقارنة شاملة بين أنواع الرخام والجرانيت
              </h2>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                مقارنة تفصيلية لمساعدتك على اختيار النوع المناسب حسب الاستخدام والميزانية
              </p>

              {/* Table */}
              <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[720px] border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        النوع
                      </th>
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        المتانة
                      </th>
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        مقاومة البقع
                      </th>
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        مقاومة الحرارة
                      </th>
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        الصيانة
                      </th>
                      <th className="sticky top-0 z-10 border border-blue-500/30 bg-blue-600 p-3 text-right font-bold sm:p-4">
                        الاستخدامات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Quartzite */}
                    <tr className="bg-emerald-50/60 transition-colors hover:bg-emerald-100/70">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">كوارتز (صناعي)</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐ ممتازة</td>
                      <td className="border border-slate-200 p-3 font-bold text-emerald-700 sm:p-4">✓ ممتازة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-emerald-700 sm:p-4">سهلة جداً</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ مطابخ✓ حمامات✓</td>
                    </tr>

                    {/* Granite Egyptian */}
                    <tr className="odd:bg-slate-50 transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">جرانيت مصري</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐ ممتازة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ وسيط</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-orange-700 sm:p-4">معالجة دورية</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ مطابخ✓ سلالم✓</td>
                    </tr>

                    {/* Granite Imported */}
                    <tr className="even:bg-white transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">جرانيت مستورد</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐ ممتازة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐ ممتازة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-orange-700 sm:p-4">معالجة دورية</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ مطابخ✓ سلالم✓</td>
                    </tr>

                    {/* Marble Natural Egyptian */}
                    <tr className="odd:bg-slate-50 transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">رخام طبيعي مصري</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐ جيدة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐ ضعيفة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-red-700 sm:p-4">صيانة مكثفة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ حمامات✓</td>
                    </tr>

                    {/* Marble Natural Imported */}
                    <tr className="even:bg-white transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">رخام طبيعي مستورد</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ قوية</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐ ضعيفة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-red-700 sm:p-4">صيانة مكثفة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ حمامات✓</td>
                    </tr>

                    {/* Artificial Marble */}
                    <tr className="odd:bg-slate-50 transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">رخام صناعي</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ قوية</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ جيدة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-emerald-700 sm:p-4">سهلة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ مطابخ✓ حمامات✓</td>
                    </tr>

                    {/* Terrazzo */}
                    <tr className="even:bg-white transition-colors hover:bg-blue-50/60">
                      <td className="border border-slate-200 p-3 font-bold text-slate-900 sm:p-4">تيرازو (صناعي)</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ قوية</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐ جيدة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">⭐⭐⭐⭐</td>
                      <td className="border border-slate-200 p-3 text-emerald-700 sm:p-4">سهلة</td>
                      <td className="border border-slate-200 p-3 sm:p-4">أرضيات✓ مطابخ✓ حمامات✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Key Insights */}
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="flex gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-emerald-900">
                  <span
                    className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">أفضل الخيارات</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-emerald-800">
                      <li>• <strong>للمطابخ:</strong> الكوارتز (أفضل مقاومة وأقل صيانة)</li>
                      <li>• <strong>للأرضيات:</strong> الجرانيت الطبيعي (متانة + سعر جيد)</li>
                      <li>• <strong>للحمامات:</strong> الكوارتز أو الكوارتز (مقاومة للرطوبة)</li>
                      <li>• <strong>للسلالم:</strong> الجرانيت (متانة عالية جداً)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-orange-200 bg-orange-50/70 p-6 text-orange-900">
                  <span
                    className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">ملاحظات مهمة</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-orange-800">
                      <li>• الرخام الطبيعي يحتاج صيانة دورية (معالجة بالسيلر)</li>
                      <li>• الأنواع الفاتحة أكثر عرضة للتبقع من الداكنة</li>
                      <li>• الكوارتز غير مسامي لا يمتص السوائل</li>
                      <li>• الأسعار تختلف حسب الجودة والمصدر</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

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
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                      const meta = getCategoryDisplay(category);
                      const cardKey = category._id || category.key || category.title;
                      const isExpanded = expandedCategoryKey === cardKey;
                      return (
                        <ExpandableCategoryCard
                          key={cardKey}
                          id={cardKey}
                          title={meta.title}
                          description={meta.description}
                          image={meta.image}
                          badge={meta.categoryType || meta.title}
                          expanded={isExpanded}
                          onToggle={() =>
                            setExpandedCategoryKey((prev) =>
                              prev === cardKey ? null : cardKey
                            )
                          }
                          onDetailsClick={() => handleCategoryClick(category)}
                          onOrderClick={() =>
                            router.push(
                              `/products?category=${encodeURIComponent(meta.title)}`
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToCategories}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      الرجوع للتصنيفات
                    </button>
                    <h3 className="text-2xl font-bold text-[#0f172a]">
                      {selectedCategory?.title || "الأنواع"}
                    </h3>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                    <div className="flex-1">
                      <label className="block text-[#0f172a] mb-2">
                        فلتر باسم النوع
                      </label>
                      <input
                        value={typeQuery}
                        onChange={(e) => setTypeQuery(e.target.value)}
                        placeholder="مثال: Galala"
                        className="w-full bg-white border border-[#cbd5f5] rounded-xl px-4 py-3 text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[#0f172a] mb-2">
                        فلتر بالاستخدام
                      </label>
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
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {(selectedCategory?.types || []).map((type, index) => {
                          const typeKey = `${selectedCategory?.key || "category"}-${type.name}-${index}`;
                          return (
                            <article
                              key={typeKey}
                              className="group flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                            >
                              {type.imageList && type.imageList.length > 0 ? (
                                <div className="relative h-44 w-full overflow-hidden border-b border-slate-200">
                                  <Image
                                    src={type.imageList[0]}
                                    alt={`صورة ${type.name} من شق التعبان`}
                                    width={800}
                                    height={520}
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    unoptimized
                                  />
                                </div>
                              ) : null}

                              <div className="flex flex-1 flex-col p-6">
                                <div>
                                  <h4 className="text-lg font-semibold text-slate-900">
                                    {type.name}
                                  </h4>
                                  <p className="mt-2 line-clamp-1 text-sm text-slate-600">
                                    {type.description || ""}
                                  </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {(type.colors || []).slice(0, 1).map((color, colorIndex) => (
                                    <span
                                      key={`${color}-${colorIndex}`}
                                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                                    >
                                      {color}
                                    </span>
                                  ))}
                                  {(type.idealUses || []).slice(0, 2).map((use) => (
                                    <span
                                      key={use}
                                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                                    >
                                      {use}
                                    </span>
                                  ))}
                                </div>

                                <div className="mt-auto pt-5">
                                  <button
                                    onClick={() => openTypeDetails(type)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                  >
                                    عرض التفاصيل
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                        {(selectedCategory?.types || []).length === 0 && (
                          <div className="col-span-full text-center py-10">
                            <p className="text-[#475569]">
                              لا توجد أنواع مطابقة للفلاتر الحالية
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className={`fixed inset-0 z-50 ${
                          isModalOpen ? "pointer-events-auto" : "pointer-events-none"
                        }`}
                        aria-hidden={!isModalOpen}
                      >
                        <button
                          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                            isModalOpen ? "opacity-100" : "opacity-0"
                          }`}
                          onClick={closeTypeDetails}
                          aria-label="إغلاق التفاصيل"
                        />
                        <div
                          className={`relative flex h-full items-end justify-center px-4 pb-4 pt-16 transition-all duration-300 sm:items-start sm:pb-10 sm:pt-10 ${
                            isModalOpen ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <div
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            className={`w-full transform rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] transition-all duration-300 sm:mx-auto sm:max-h-[90vh] sm:w-[min(80vw,1100px)] ${
                              isModalOpen
                                ? "translate-y-0 scale-100 sm:translate-y-0 sm:scale-100"
                                : "translate-y-full scale-100 sm:-translate-y-10 sm:scale-95"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                              <div>
                                <p className="text-xs font-semibold text-blue-600">تفاصيل النوع</p>
                                <h4 className="mt-1 text-xl font-semibold text-slate-900">
                                  {activeType?.name || ""}
                                </h4>
                              </div>
                              <button
                                ref={closeButtonRef}
                                onClick={closeTypeDetails}
                                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                aria-label="إغلاق"
                              >
                                <svg
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="max-h-[80vh] overflow-y-auto px-6 pb-6 pt-5 sm:max-h-[75vh]">
                              {isModalLoading ? (
                                <div className="space-y-6">
                                  <div className="h-60 w-full animate-pulse rounded-2xl bg-slate-100" />
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                                    <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                                  </div>
                                  <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {activeType?.imageList && activeType.imageList.length > 0 && (
                                    <div>
                                      <Image
                                        src={activeType.imageList[activeImageIndex]}
                                        alt={`صورة ${activeType.name} من شق التعبان`}
                                        width={1200}
                                        height={720}
                                        sizes="(max-width: 768px) 100vw, 1200px"
                                        className="h-60 w-full rounded-2xl object-cover transition-all duration-300"
                                        unoptimized
                                      />
                                      {activeType.imageList.length > 1 && (
                                        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                                          {activeType.imageList.slice(0, 6).map((img, imgIndex) => (
                                            <button
                                              key={`${img}-${imgIndex}`}
                                              onClick={() => setActiveImageIndex(imgIndex)}
                                              className={`overflow-hidden rounded-xl border transition ${
                                                imgIndex === activeImageIndex
                                                  ? "border-blue-500 ring-2 ring-blue-200"
                                                  : "border-slate-200 hover:border-blue-200"
                                              }`}
                                              aria-label={`عرض الصورة ${imgIndex + 1}`}
                                            >
                                              <Image
                                                src={img}
                                                alt={`${activeType.name} صورة ${imgIndex + 1}`}
                                                width={160}
                                                height={160}
                                                sizes="160px"
                                                className="h-16 w-full object-cover"
                                                unoptimized
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="grid gap-6 lg:grid-cols-2">
                                    {activeType?.description && (
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                        <p className="text-sm font-semibold text-slate-900">الوصف</p>
                                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                          {activeType.description}
                                        </p>
                                      </div>
                                    )}
                                    {activeType?.care && (
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                        <p className="text-sm font-semibold text-slate-900">العناية</p>
                                        <p className="mt-2 text-sm text-slate-600">
                                          {activeType.care}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid gap-6 lg:grid-cols-2">
                                    {activeType?.advantages && activeType.advantages.length > 0 && (
                                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                                        <p className="text-sm font-semibold text-emerald-900">المميزات</p>
                                        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-emerald-800">
                                          {activeType.advantages.map((adv) => (
                                            <li key={adv}>{adv}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {activeType?.disadvantages && activeType.disadvantages.length > 0 && (
                                      <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5">
                                        <p className="text-sm font-semibold text-orange-900">العيوب</p>
                                        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-orange-800">
                                          {activeType.disadvantages.map((dis) => (
                                            <li key={dis}>{dis}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  {activeType?.howToCheck && activeType.howToCheck.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                      <p className="text-sm font-semibold text-slate-900">كيف تتحقق؟</p>
                                      <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600">
                                        {activeType.howToCheck.map((check) => (
                                          <li key={check}>{check}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {activeType?.moneyRange && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                                      <p className="text-sm font-semibold text-emerald-700">
                                        {formatPriceRange(activeType.moneyRange)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CTA Section */
            /* Sections "What is Marble", "Difference between Marble and Granite", "Care Tips", "Detailed Guide" removed */ }
            <div className="bg-white rounded-2xl p-8 border border-[#cbd5f5] text-center transition-all hover:border-[#3b82f6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
              <h2 className="text-3xl font-semibold text-[#0f172a] mb-4">
                جاهز لاختيار الرخام المثالي؟
              </h2>
              <p className="text-[#475569] text-lg mb-6">
                تصفح مجموعتنا الواسعة من الرخام والجرانيت عالي الجودة
              </p>
              <button
                onClick={() => router.push("/")}
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

export default function MarbleInfoClient() {
  return <MarbleInfoContent />;
}
