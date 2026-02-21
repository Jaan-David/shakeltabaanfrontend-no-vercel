"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { ArrowLeft, HelpCircle, Star, Zap, Users } from "lucide-react";
import { getPrimaryMedia } from "@/utils/media";
import Card from "@/components/UI/Card/Card";
import CategoriesGrid from "@/_pages/CategoriesPage/CategoriesGrid";
import { Category as CategoryType } from '@/services/product/categories';
import { productService } from '@/services/api/products';
import { ProfileService } from '@/services/profile/profile';
import { isUserAuthenticated } from '@/services/auth/login';

const PartnersSection = dynamicImport(
  () => import("@/_pages/HomePage/PartnersSection"),
  { ssr: false }
);

export const dynamic = 'force-dynamic';

export default function HomeContent() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";
  const imageBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || apiBaseUrl).replace(
    /\/app\/v1\/?$/,
    ""
  );

  const heroImage = {
    src: "/slider/1.jpg",
    alt: "صورة الرخام الرئيسية",
  };

  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [userName, setUserName] = useState<string>('منصة شق الثعبان');
  const [productSearch, setProductSearch] = useState('');
  const [hasHydrated, setHasHydrated] = useState(false);
  const isMounted = useRef(false);

  const fixedCategories: CategoryType[] = [
    { id: "جرانيت مستورد", name: "جرانيت مستورد" },
    { id: "جرانيت مصرى", name: "جرانيت مصرى" },
    { id: "رخام مستورد", name: "رخام مستورد" },
    { id: "رخام مصرى", name: "رخام مصرى" },
    { id: "كوارتز", name: "كوارتز" },
    { id: "رخام مصنع", name: "رخام مصنع" },
    { id: "اعمال النحت", name: "اعمال النحت" },
  ];

  const normalizeProductImage = (src?: string) => {
    if (!src) return "/acessts/NoImage.jpg";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;
    return `${imageBaseUrl}/${src.replace(/^\//, "")}`;
  };

  const getOfferStatus = (product: any): boolean => {
    if (product?.isOffer) return true;
    if (product?.offerLinearPrice && Number(product.offerLinearPrice) > 0) return true;
    if (product?.offerCubicPrice && Number(product.offerCubicPrice) > 0) return true;
    return false;
  };

  useEffect(() => {
    isMounted.current = true;
    setHasHydrated(true);

    const fetchUserProfile = async () => {
      // Only fetch profile if user is authenticated
      if (!isUserAuthenticated()) {
        return;
      }

      try {
        const response = await ProfileService.getProfile();
        const profileData = response?.data?.user;

        if (isMounted.current && profileData?.firstName) {
          const lastName = profileData.lastName ? ` ${profileData.lastName}` : '';
          setUserName(`مرحباً ${profileData.firstName}${lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
    
    if (isMounted.current) {
      setCategories(fixedCategories);
      setCategoriesLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCategoryClick = async (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    setShowProducts(true);
    
    try {
      const filters = { category: categoryName, limit: 50 };
      const productsData = await productService.getProducts(filters);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setShowProducts(false);
    setSelectedCategory('');
    setProducts([]);
    setProductSearch('');
  };

  const filteredProducts = showProducts
    ? products.filter((product) => {
        const name = String(product?.name || product?.nameAr || '').toLowerCase();
        const desc = String(product?.description || product?.descriptionAr || '').toLowerCase();
        const query = productSearch.trim().toLowerCase();
        if (!query) return true;
        return name.includes(query) || desc.includes(query);
      })
    : products;

  if (!hasHydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO SECTION ============ */}
      <HeroSection heroImage={heroImage} userName={userName} />

      {/* ============ CTA REQUEST SECTION ============ */}
      <CTARequestSection />

      {/* ============ CATEGORIES OR PRODUCTS ============ */}
      {!showProducts ? (
        <CategoriesSection
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCategoryClick={handleCategoryClick}
        />
      ) : (
        <ProductsSection
          selectedCategory={selectedCategory}
          filteredProducts={filteredProducts}
          loading={loading}
          productSearch={productSearch}
          onSearchChange={setProductSearch}
          onBack={handleBackToCategories}
          normalizeProductImage={normalizeProductImage}
          getOfferStatus={getOfferStatus}
        />
      )}

      {/* ============ PARTNERS SECTION ============ */}
      {!showProducts && <PartnersSection />}
    </div>
  );
}

// ============ HERO SECTION COMPONENT ============
function HeroSection({
  heroImage,
  userName,
}: {
  heroImage: { src: string; alt: string };
  userName: string;
}) {
  return (
    <section
      className="relative w-full mb-8 sm:mb-12 md:mb-16 overflow-hidden bg-gradient-to-b from-blue-600 to-blue-500"
      aria-labelledby="hero-title"
    >
      {/* Background Image with Overlay */}
      <div className="relative w-full min-h-[56svh] max-h-[85svh] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          quality={85}
        />

        {/* Dark Gradient Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-bl from-black/80 via-black/55 to-black/35" />

        {/* Content Card */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 py-6"
          dir="rtl"
        >
          <div className="w-full max-w-sm sm:max-w-2xl space-y-3 sm:space-y-5 text-center">
            <div className="rounded-2xl bg-white/8 backdrop-blur-md px-4 py-5 sm:px-7 sm:py-7 shadow-lg border border-white/15 motion-safe:animate-fade-in">
            <h1
              id="hero-title"
              className="text-4xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-snug"
            >
              {userName || "منصة شق الثعبان"}
            </h1>

            <p className="mt-2 text-sm sm:text-lg text-white/85 drop-shadow-md max-w-sm sm:max-w-xl mx-auto">
              أفضل أنواع الرخام والجرانيت والكوارتز بأسعار منافسة وجودة عالية
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center">
              {(() => {
                const baseButtonClass =
                  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 w-full sm:w-auto min-h-[50px] px-5 sm:px-8 py-3 sm:py-4 whitespace-nowrap sm:min-w-[190px] active:scale-[0.98]";
                const primaryClass =
                  `${baseButtonClass} bg-blue-600 hover:bg-blue-700 !text-white hover:!text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5`;
                const secondaryClass =
                  `${baseButtonClass} bg-white/10 hover:bg-white/15 !text-white hover:!text-white border border-white/50 shadow-sm hover:shadow-md text-sm sm:text-base`;
                const guidanceClass =
                  "inline-flex items-center justify-center gap-2 !text-white/95 hover:!text-white underline-offset-4 hover:underline transition-all duration-200 text-base sm:text-base px-2 py-1 active:scale-[0.98] mt-1 sm:mt-0";

                return (
                  <>
                    <Link href="/products" className={primaryClass}>
                      <Zap size={18} />
                      تصفح المنتجات
                    </Link>
                    <Link href="/inquiries" className={secondaryClass}>
                      <Star size={18} />
                      طلب خاص
                    </Link>
                    <Link href="/marble-info" className={guidanceClass}>
                      ازاي تختار نوع رخامتك؟
                      <HelpCircle size={16} />
                    </Link>
                  </>
                );
              })()}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CTA REQUEST SECTION ============
function CTARequestSection() {
  return (
    <section className="px-4 py-12 sm:py-16 md:py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 items-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-12 shadow-lg overflow-hidden">
          {/* Content */}
          <div className="flex flex-col gap-6" dir="rtl">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                هل لديك احتياجات خاصة؟
              </h2>
              <p className="text-lg text-slate-600">
                أرسل احتياجاتك بدقة، واحصل على عروض وأسعار تنافسية من شبكة موردينا المتخصصة.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start gap-3">
                <Users size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">موردين موثوقين</p>
                  <p className="text-xs text-slate-500">مختارين بعناية</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">استجابة سريعة</p>
                  <p className="text-xs text-slate-500">خلال 24 ساعة</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col gap-4">
            <Link
              href="/inquiries"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 !text-white hover:!text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl w-full min-h-[52px] text-lg"
            >
              أرسل طلبك الآن
              <ArrowLeft size={20} />
            </Link>
            <p className="text-xs text-slate-500 text-center">
              بدون أي التزامات • رد خلال 24 ساعة
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CATEGORIES SECTION ============
function CategoriesSection({
  categories,
  categoriesLoading,
  onCategoryClick,
}: {
  categories: CategoryType[];
  categoriesLoading: boolean;
  onCategoryClick: (id: string, name: string) => void;
}) {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4" aria-labelledby="categories-title">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 sm:mb-12 md:mb-16 text-center space-y-2 sm:space-y-3">
          <h2 id="categories-title" className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            التصنيفات
          </h2>
          <p className="text-lg sm:text-xl text-slate-600">
            اختر نوع الحجر الذي تبحث عنه
          </p>
          <p className="text-sm sm:text-base text-slate-500">
            ابدأ التصفح حسب الفئة لتسهيل عملية البحث والاختيار
          </p>
        </div>

        {/* Grid */}
        <CategoriesGrid
          categories={categories}
          onCategoryClick={onCategoryClick}
          isLoading={categoriesLoading}
        />
      </div>
    </section>
  );
}

// ============ PRODUCTS SECTION ============
function ProductsSection({
  selectedCategory,
  filteredProducts,
  loading,
  productSearch,
  onSearchChange,
  onBack,
  normalizeProductImage,
  getOfferStatus,
}: {
  selectedCategory: string;
  filteredProducts: any[];
  loading: boolean;
  productSearch: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  normalizeProductImage: (src?: string) => string;
  getOfferStatus: (product: any) => boolean;
}) {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4" aria-labelledby="products-title">
      <div className="mx-auto max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
            aria-label="العودة للتصنيفات"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            العودة للتصنيفات
          </button>

          <div className="text-center space-y-3">
            <h2 id="products-title" className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
              منتجاتنا
            </h2>
            <p className="text-lg sm:text-xl text-slate-600">
              {selectedCategory}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 sm:mb-10">
          <input
            type="search"
            value={productSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 sm:py-4 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="بحث المنتجات"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
            <p className="text-slate-600">لم نتمكن من العثور على منتجات مطابقة</p>
          </div>
        ) : (
          // Products Grid
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div key={product._id || product.id || index} className="h-full">
                <Card
                  productId={String(product._id || product.id || index)}
                  productImg={normalizeProductImage(
                    getPrimaryMedia(
                      [product.imageList?.[0] || null, product.image || null],
                      "/acessts/NoImage.jpg"
                    )
                  )}
                  productName={product.name || "منتج"}
                  productCategory={product.category || "غير محدد"}
                  productPrice={String(product.price || 0)}
                  hasOffer={getOfferStatus(product)}
                  IsKG={product.IsKG}
                  IsTON={product.IsTON}
                  IsLITER={product.IsLITER}
                  IsCUBIC_METER={product.IsCUBIC_METER}
                  pricePerLinearMeter={product.pricePerLinearMeter}
                  pricePerCubicMeter={product.pricePerCubicMeter}
                  offerLinearPrice={product.offerLinearPrice}
                  offerCubicPrice={product.offerCubicPrice}
                  color={product.color}
                  qualityGrade={product.qualityGrade}
                  isOffer={product.isOffer}
                  organizationName={product.organizationName}
                  organizationId={product.organizationId}
                  showOrganizationInline
                  showQualityGrade={false}
                  showMinimalMarbleInfo
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}