"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPrimaryMedia, getProductMediaList } from "@/utils/media";
import useApiQuery from "@/hooks/useApiQuery";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
  productService,
  type Product as ApiProduct,
} from "@/services/api/products";
import ProductsHeader from "./components/ProductsHeader";
import FilterSidebar from "./components/FilterSidebar";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import MarketplaceProductCard from "./components/MarketplaceProductCard";
import styles from "./ProductsPage.module.css";

const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";
const DEFAULT_LIMIT = 200;
const DEFAULT_POPULAR_KEYWORDS = [
  "رخام",
  "جرانيت",
  "كوارتز",
  "عواميد",
  "سلالم",
  "مطابخ",
  "حمامات",
  "ديكور",
  "ارضيات",
  "حوائط",
];

type RatingOption = 0 | 3 | 4 | 4.5;
type SortOption = "relevance" | "price_asc" | "price_desc" | "rating_desc" | "newest";

const getPrimaryImage = (product: ApiProduct): string => {
  const first = getPrimaryMedia(getProductMediaList(product), PLACEHOLDER_SRC);

  if (first.startsWith("http")) return first.replace("http://", "https://");
  return first;
};

const getOfferStatus = (product: ApiProduct): boolean => {
  if (product.isOffer) return true;
  if (product.offerPrice && Number(product.offerPrice) > 0) return true;
  if (product.offerSquarePrice && Number(product.offerSquarePrice) > 0) return true;
  if (product.offerLinearPrice && Number(product.offerLinearPrice) > 0) return true;
  if (product.offerCubicPrice && Number(product.offerCubicPrice) > 0) return true;
  return false;
};

const getSafeNumber = (value: number | undefined | null): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return value;
};



const getSafeRating = (value: string | null): RatingOption => {
  const parsed = Number(value);
  if (parsed === 3 || parsed === 4 || parsed === 4.5) return parsed;
  return 0;
};

const getSafeSort = (value: string | null): SortOption => {
  if (
    value === "price_asc" ||
    value === "price_desc" ||
    value === "rating_desc" ||
    value === "newest"
  ) {
    return value;
  }
  return "relevance";
};



export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInitializedRef = useRef(false);
  const lastQueryStringRef = useRef("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [ratingMin, setRatingMin] = useState<RatingOption>(0);
  const [hasOffer, setHasOffer] = useState(false);
  const [withInstallation, setWithInstallation] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 350);

  const {
    data: productsResponse,
    error: productsError,
    isLoading,
  } = useApiQuery(`products:list:${DEFAULT_LIMIT}`, {
    fetcher: async () => productService.getProducts({ limit: DEFAULT_LIMIT }),
    swr: {
      dedupingInterval: 5 * 60 * 1000,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    },
  });

  const products = productsResponse?.data || [];
  const hasProductsError =
    Boolean(productsError) || productsResponse?.status === "error";

  useEffect(() => {
    if (isInitializedRef.current) return;
    const params = searchParams ?? new URLSearchParams();

    setSearch(params.get("q") || "");
    setCategory(params.get("category") || "all");
    setOrganization(params.get("organization") || "all");
    setRatingMin(getSafeRating(params.get("rating")));
    setHasOffer(params.get("offer") === "1");
    setWithInstallation(params.get("installation") === "1");
    setSortBy(getSafeSort(params.get("sort")));
    lastQueryStringRef.current = params.toString();

    isInitializedRef.current = true;
  }, [searchParams]);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter((value): value is string => Boolean(value && value.trim()));
    return Array.from(new Set(values));
  }, [products]);

  const organizations = useMemo(() => {
    const values = products
      .map((product) => product.organizationName || product.organizationId)
      .filter((value): value is string => Boolean(value && value.trim()));
    return Array.from(new Set(values));
  }, [products]);

  const popularKeywords = useMemo(() => {
    const collected = new Set<string>(DEFAULT_POPULAR_KEYWORDS);

    products.forEach((product) => {
      const rawUses = product.usesList;
      if (!Array.isArray(rawUses)) return;

      rawUses.forEach((item) => {
        if (typeof item !== "string") return;
        const normalized = item.trim();
        if (!normalized) return;
        collected.add(normalized);
      });
    });

    return Array.from(collected);
  }, [products]);


  const updateQueryParams = useCallback(
    () => {
      if (!isInitializedRef.current) return;

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
      if (category !== "all") params.set("category", category);
      if (organization !== "all") params.set("organization", organization);
      if (ratingMin !== 0) params.set("rating", String(ratingMin));
      if (hasOffer) params.set("offer", "1");
      if (withInstallation) params.set("installation", "1");
      if (sortBy !== "relevance") params.set("sort", sortBy);

      const queryString = params.toString();
      if (queryString === lastQueryStringRef.current) return;

      lastQueryStringRef.current = queryString;
      router.replace(queryString ? `/products?${queryString}` : "/products", {
        scroll: false,
      });
    },
    [
      category,
      hasOffer,
      withInstallation,
      organization,
      ratingMin,
      router,
      debouncedSearch,
      sortBy,
    ]
  );

  useEffect(() => {
    updateQueryParams();
  }, [
    category,
    hasOffer,
    withInstallation,
    organization,
    ratingMin,
    debouncedSearch,
    sortBy,
    updateQueryParams,
  ]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = product.name || "";
      const description = product.description || "";
      const categoryValue = product.category || "";
      const colorValue = product.color || "";
      const brandValue = product.brand || "";
      const organizationValue = product.organizationName || product.organizationId || "";
      const uses = Array.isArray(product.usesList)
        ? product.usesList
            .filter((item): item is string => typeof item === "string")
            .join(" ")
        : "";
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        categoryValue.toLowerCase().includes(query) ||
        colorValue.toLowerCase().includes(query) ||
        brandValue.toLowerCase().includes(query) ||
        organizationValue.toLowerCase().includes(query) ||
        uses.toLowerCase().includes(query);

      const matchesCategory = category === "all" || product.category === category;
      const orgValue = product.organizationName || product.organizationId || "";
      const matchesOrganization = organization === "all" || orgValue === organization;

      const ratingValue = getSafeNumber(product.averageRate);
      const matchesRating = ratingMin === 0 || ratingValue >= ratingMin;

      const matchesOffer = !hasOffer || getOfferStatus(product);
      const matchesInstallation = !withInstallation || product.withInstallation === true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesOrganization &&
        matchesRating &&
        matchesOffer &&
        matchesInstallation
      );
    });
  }, [
    products,
    search,
    category,
    organization,
    ratingMin,
    hasOffer,
    withInstallation,
  ]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price_asc") {
      return list.sort((a, b) => getSafeNumber(a.price) - getSafeNumber(b.price));
    }
    if (sortBy === "price_desc") {
      return list.sort((a, b) => getSafeNumber(b.price) - getSafeNumber(a.price));
    }
    if (sortBy === "rating_desc") {
      return list.sort(
        (a, b) => getSafeNumber(b.averageRate) - getSafeNumber(a.averageRate)
      );
    }
    if (sortBy === "newest") {
      return list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    return list;
  }, [filteredProducts, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setOrganization("all");
    setRatingMin(0);
    setHasOffer(false);
    setWithInstallation(false);
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen bg-[#f3f0ea] font-beiruti">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-4">
        <ProductsHeader
          title="كل المنتجات"
          subtitle="ابحث وفلتر بين منتجات الرخام والجرانيت والكوارتز بسهولة."
          search={search}
          popularKeywords={popularKeywords}
          resultCount={sortedProducts.length}
          hasOffer={hasOffer}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onClearSearch={() => setSearch("")}
          onHasOfferChange={setHasOffer}
          onSortChange={setSortBy}
        />

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-[110px]">
            <FilterSidebar
              search={search}
              category={category}
              organization={organization}
              ratingMin={ratingMin}
              hasOffer={hasOffer}
              withInstallation={withInstallation}
              categories={categories}
              organizations={organizations}
              resultCount={sortedProducts.length}
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onOrganizationChange={setOrganization}
              onRatingChange={setRatingMin}
              onHasOfferChange={setHasOffer}
              onWithInstallationChange={setWithInstallation}
              onReset={resetFilters}
            />
          </aside>

          <div className="space-y-4">
            <div className="sticky top-[110px] z-10 rounded-2xl bg-[#f8f6f2]/95 px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  عدد النتائج: {sortedProducts.length}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">
                    ترتيب حسب
                  </label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="rounded-full border border-transparent bg-white px-3 py-2 text-xs text-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.08)] focus:border-slate-300 focus:outline-none"
                  >
                    <option value="relevance">الأكثر صلة</option>
                    <option value="rating_desc">الأعلى تقييماً</option>
                    <option value="newest">الأحدث</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-100/60 px-3 py-2 text-center sm:px-4 sm:py-3">
              <p className="text-xs text-slate-600 sm:text-sm">
                 يتم إضافة منتجات جديدة يوميًا ..... و في حاله عدم توفر منتج غير  متوفر يرجي الطلب من الطلبات الخاصه او الاستفسار عبر الواتساب
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-3 text-slate-600">جاري تحميل المنتجات...</p>
              </div>
            ) : hasProductsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                تعذر تحميل المنتجات حالياً
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                لا توجد منتجات مطابقة للبحث الحالي.
              </div>
            ) : (
              <div className={styles.resultsGrid}>
                {sortedProducts.map((product, index) => (
                  <MarketplaceProductCard
                    key={product._id || product.id || index}
                    product={product}
                    imageSrc={getPrimaryImage(product)}
                    hasOffer={getOfferStatus(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileFiltersOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex min-h-[42px] items-center rounded-full bg-slate-800/95 px-4 py-2 text-xs font-medium text-slate-50 shadow-[0_12px_24px_rgba(15,23,42,0.28)] lg:hidden"
      >
        تصفية
      </button>

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <FilterSidebar
          search={search}
          category={category}
          organization={organization}
          ratingMin={ratingMin}
          hasOffer={hasOffer}
          withInstallation={withInstallation}
          categories={categories}
          organizations={organizations}
          resultCount={sortedProducts.length}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onOrganizationChange={setOrganization}
          onRatingChange={setRatingMin}
          onHasOfferChange={setHasOffer}
          onWithInstallationChange={setWithInstallation}
          onReset={resetFilters}
        />
      </MobileFilterDrawer>
    </div>
  );
}
