"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPrimaryMedia } from "@/utils/media";
import Card from "@/components/UI/Card/Card";
import CategoriesGrid from "@/pages/CategoriesPage/CategoriesGrid";
import { Category as CategoryType } from '@/services/product/categories';
import PartnersSection from "@/pages/HomePage/PartnersSection";
import { productService } from '@/services/api/products';

// Prevent static prerendering which causes auth context errors
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
    
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const response = await fetch(`${apiBaseUrl}/users/user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (isMounted.current && data?.data?.name) {
              setUserName(`مرحباً ${data.data.name}`);
            }
          }
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
    return () => { isMounted.current = false; };
  }, []);

  const handleCategoryClick = async (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    setShowProducts(true);
    try {
      // Debug: log filters and response
      const filters = { category: categoryName, limit: 50 };
      const productsData = await productService.getProducts(filters);
      console.log('Fetching products with filters:', filters);
      console.log('API response:', productsData);
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
      {/* Slider */}
      <section className="relative w-full -mt-2 sm:-mt-4 mb-16 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-b-3xl overflow-hidden shadow-2xl border-b border-blue-200">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10"></div>
        <div className="relative w-full h-[240px] sm:h-[380px] md:h-[520px]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Text Overlay Box */}
          <div
            className="group absolute top-1/2 left-1/2 z-10 w-11/12 max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/20 bg-white/20 p-6 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)] ring-1 ring-white/10 backdrop-blur-3xl transition-transform duration-200 hover:-translate-y-[52%] sm:p-10 md:p-12"
            dir="rtl"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-white/10 to-blue-100/20"></div>
            <div className="pointer-events-none absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 sm:gap-6">
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
                منصة شق التعبان
              </h1>
              <p className="text-base text-slate-700 sm:text-lg md:text-xl">
                أفضل أنواع الرخام والجرانيت بأسعار منافسة
              </p>
            </div>
            <div className="relative mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:gap-5 md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap">
              <Link
                href="/marble-info"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-600/60 bg-white/70 px-6 py-3 text-base font-semibold text-blue-800 transition-all duration-200 hover:border-blue-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.97] md:order-1 md:w-[45%] lg:order-none lg:w-auto"
                aria-label="ازاي اختار نوع رخامتي"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6h7M12 12h7M12 18h7M5 6h.01M5 12h.01M5 18h.01" />
                </svg>
                <span>ازاي اختار نوع رخامتي</span>
              </Link>
              <Link
                href="/products"
                className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 px-7 py-4 text-lg font-bold text-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.9)] transition-all duration-200 hover:scale-105 hover:shadow-[0_22px_45px_-16px_rgba(37,99,235,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 active:scale-[0.97] md:order-3 md:w-full md:max-w-sm md:self-center lg:order-none lg:w-auto lg:-translate-y-1"
                aria-label="ابحث عن منتجك"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M16.7 10.8a5.9 5.9 0 1 1-11.8 0 5.9 5.9 0 0 1 11.8 0Z" />
                </svg>
                <span>ابحث عن منتجك</span>
              </Link>
              <Link
                href="/inquiries"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white/80 px-6 py-3 text-base font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.97] md:order-2 md:w-[45%] lg:order-none lg:w-auto"
                aria-label="طلبيتك علي مزاجك"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <span>طلبيتك علي مزاجك</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Custom Inquiries Hero */}
      <section className="px-4 pt-10 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-lg sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" dir="rtl">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                  اعمل طلبك على مزاجك
                </h1>
                <p className="text-base text-slate-600 md:text-lg">
                  اكتب مواصفات الرخام أو الجرانيت اللي محتاجه، وارفق صور أو تصميمات، وخلي مصانع ومعارض شق التعبان تنافسك بأفضل سعر.
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                    عروض أسعار من أكتر من مورد
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                    توفير وقت ومجهود البحث
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">✓</span>
                    تواصل مباشر مع المصنع أو المعرض
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-start gap-4">
                <Link
                  href="/inquiries"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-200/60 transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  إنشئ طلبك الخاص
                  <span aria-hidden="true">→</span>
                </Link>
                <p className="text-xs text-slate-500">جاهز تبدأ؟ أرسل الطلب واستلم العروض خلال ساعات.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Categories */}
      {!showProducts ? (
        <section className="py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 drop-shadow-lg">
              التصنيفات
            </h2>
            <p className="text-lg text-slate-600">
              اختر نوع الرخام أو الجرانيت المناسب لك
            </p>
            <p className="text-sm text-slate-500 mt-2">
              ابدأ التصفح حسب نوع الحجر لتسهيل عملية البحث
            </p>
          </div>
          <CategoriesGrid
            categories={categories}
            onCategoryClick={handleCategoryClick}
            isLoading={categoriesLoading}
          />
        </section>
      ) : (
        /* Products Section */
        <section className="py-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة للتصنيفات
            </button>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 drop-shadow-lg">
                منتجاتنا
              </h2>
              <p className="text-lg text-slate-600">
                {selectedCategory ? `تصنيف: ${selectedCategory}` : 'جميع المنتجات'}
              </p>
            </div>
            <div></div> {/* Spacer for flex layout */}
          </div>
          <div className="mb-8">
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full md:w-1/2 bg-white border-2 border-blue-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <Card
                  key={product._id || product.id || index}
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
              ))}
            </div>
          )}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
              <p className="text-slate-600">لم نتمكن من العثور على منتجات مطابقة</p>
            </div>
          )}
        </section>
      )}
      {/* Partners */}
      {!showProducts && <PartnersSection />}
    </div>
  );
}

