"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/UI/Card/Card";
import { getPrimaryMedia } from "@/utils/media";
import {
  productService,
  type Product as ApiProduct,
  type ProductFilters,
} from "@/services/api/products";
import ProductsHeader from "./components/ProductsHeader";
import FilterSidebar from "./components/FilterSidebar";
import MobileFilterDrawer from "./components/MobileFilterDrawer";

const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";
const DEFAULT_LIMIT = 200;

type RatingOption = 0 | 3 | 4 | 4.5;
type SortOption = "relevance" | "price_asc" | "price_desc" | "rating_desc" | "newest";

const getPrimaryImage = (product: ApiProduct): string => {
  const first = getPrimaryMedia(
    [
      ...(Array.isArray(product.imageList) ? product.imageList : []),
      ...(Array.isArray(product.images) ? product.images : []),
      product.image,
    ],
    PLACEHOLDER_SRC
  );

  if (first.startsWith("http")) return first.replace("http://", "https://");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return `${baseUrl}${first.startsWith("/") ? "" : "/"}${first}`;
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

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [ratingMin, setRatingMin] = useState<RatingOption>(0);
  const [hasOffer, setHasOffer] = useState(false);
  const [withInstallation, setWithInstallation] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

    isInitializedRef.current = true;
  }, [searchParams]);

  const fetchProducts = useCallback(async (filters: ProductFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getProducts(filters);
      setProducts(response?.data || []);
    } catch {
      setError("تعذر تحميل المنتجات حالياً");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({ limit: DEFAULT_LIMIT });
  }, [fetchProducts]);

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


  const updateQueryParams = useCallback(
    () => {
      if (!isInitializedRef.current) return;

      const params = new URLSearchParams();

      if (search.trim()) params.set("q", search.trim());
      if (category !== "all") params.set("category", category);
      if (organization !== "all") params.set("organization", organization);
      if (ratingMin !== 0) params.set("rating", String(ratingMin));
      if (hasOffer) params.set("offer", "1");
      if (withInstallation) params.set("installation", "1");
      if (sortBy !== "relevance") params.set("sort", sortBy);

      const queryString = params.toString();
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
      search,
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
    search,
    sortBy,
    updateQueryParams,
  ]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = product.name || "";
      const description = product.description || "";
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);

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
    <div className="min-h-screen bg-white font-beiruti">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-4">
        <ProductsHeader
          title="كل المنتجات"
          subtitle="ابحث وفلتر بين منتجات الرخام والجرانيت والكوارتز بسهولة."
          search={search}
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
            <div className="sticky top-[110px] z-10 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-slate-600">
                  عدد النتائج: {sortedProducts.length}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">
                    ترتيب حسب
                  </label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="relevance">الأكثر صلة</option>
                    <option value="rating_desc">الأعلى تقييماً</option>
                    <option value="newest">الأحدث</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 min-h-[44px]"
                >
                  فلتر البحث
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-3 text-slate-600">جاري تحميل المنتجات...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                {error}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                لا توجد منتجات مطابقة للبحث الحالي.
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product, index) => (
                  <Card
                    key={product._id || product.id || index}
                    productId={String(product._id || product.id || index)}
                    productImg={getPrimaryImage(product)}
                    productName={product.name || "منتج"}
                    productCategory={product.category || "غير محدد"}
                    productPrice={String(product.price || 0)}
                    hasOffer={getOfferStatus(product)}
                    IsKG={product.IsKG}
                    IsTON={product.IsTON}
                    IsLITER={product.IsLITER}
                    IsCUBIC_METER={product.IsCUBIC_METER}
                    pricePerSquareMeter={product.pricePerSquareMeter}
                    pricePerLinearMeter={product.pricePerLinearMeter}
                    pricePerCubicMeter={product.pricePerCubicMeter}
                    offerPrice={product.offerPrice}
                    offerSquarePrice={product.offerSquarePrice}
                    offerLinearPrice={product.offerLinearPrice}
                    offerCubicPrice={product.offerCubicPrice}
                    minPrice={product.minPrice}
                    maxPrice={product.maxPrice}
                    priceOnRequest={product.priceOnRequest}
                    customPriceLabel={product.customPriceLabel}
                    color={product.color}
                    qualityGrade={product.qualityGrade}
                    isOffer={product.isOffer}
                    organizationName={product.organizationName}
                    organizationId={product.organizationId}
                    withInstallation={product.withInstallation}
                    showOrganizationInline
                    showQualityGrade={false}
                    showMinimalMarbleInfo
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
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden min-h-[44px]"
      >
        فلتر البحث
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
