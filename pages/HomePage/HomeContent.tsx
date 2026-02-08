"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CategoriesGrid from "@/pages/CategoriesPage/CategoriesGrid";
import { fetchCategories, Category as CategoryType } from '@/services/product/categories';
import PartnersSection from "@/pages/HomePage/PartnersSection";
import { productService } from '@/services/api/products';


export default function HomeContent() {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/app/v1";
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

  const normalizeProductImage = (src?: string) => {
    if (!src) return "/acessts/NoImage.jpg";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;
    return `${imageBaseUrl}/${src.replace(/^\//, "")}`;
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

    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const catNames = await fetchCategories();
        if (isMounted.current) {
          setCategories(catNames.map((name: string) => ({ id: name, name })));
        }
      } catch (err) {
        if (isMounted.current) setCategories([]);
      } finally {
        if (isMounted.current) setCategoriesLoading(false);
      }
    };

    fetchUserProfile();
    loadCategories();
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

  const handleProductClick = (productId: string) => {
    router.push(`/product/${encodeURIComponent(productId)}`);
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
      <section className="relative w-full mb-16 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-b-3xl overflow-hidden shadow-2xl border-b border-blue-200">
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-11/12 max-w-3xl backdrop-blur-sm bg-white/85 p-8 rounded-2xl border-2 border-blue-300 shadow-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 drop-shadow-2xl leading-tight">
            {userName}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 drop-shadow-lg leading-relaxed">
              أفضل أنواع الرخام والجرانيت بأسعار منافسة
            </p>
            <div className="flex justify-center items-center">
              <button 
                onClick={() => router.push('/marble-info')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-blue-600/40 transform hover:scale-105 w-full sm:w-auto"
              >
                لمعرفة المزيد عن الرخام
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Custom Order CTA */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto mb-16">
          <div className="rounded-2xl border border-blue-100 inquiries-cta-bg p-8 sm:p-10 shadow-sm">
            <div className="flex flex-col justify-between min-h-[180px]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-right">
                طلبك دلوقتي
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/inquiries')}
                  aria-label="إنشئ طلبك الخاص"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-white text-base sm:text-lg font-semibold transition-colors hover:bg-secondary"
                >
                  إنشئ طلبك الخاص
                </button>
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
              اختر نوع الرخام أو الجرانيت
            </p>
          </div>
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <CategoriesGrid categories={categories} onCategoryClick={handleCategoryClick} />
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="group marble-card p-6 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2 cursor-pointer relative"
                >
                  {/* Offer Badge */}
                  {(product.isOffer || (product.offerLinearPrice !== null && product.offerLinearPrice !== undefined && Number(product.offerLinearPrice) > 0) || (product.offerCubicPrice !== null && product.offerCubicPrice !== undefined && Number(product.offerCubicPrice) > 0)) && (
                    <div className="absolute top-2 left-2 z-10 bg-red-600 text-black text-xs font-extrabold px-3 py-1 rounded-md border-2 border-red-700 shadow-lg">
                      عرض خاص
                    </div>
                  )}
                  
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <Image
                      src={normalizeProductImage(product.imageList?.[0] || product.image)}
                      alt={product.name || "صورة المنتج"}
                      width={420}
                      height={240}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="space-y-3">
                    {/* Organization Name and ID */}
                    {(product.organizationName || product.organizationId) && (
                      <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <span className="text-xs font-semibold text-blue-700">
                          {product.organizationName || product.organizationId}
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-slate-900 font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-slate-700 text-sm">
                          {typeof product.averageRate === 'number' ? product.averageRate : 4.5}
                        </span>
                        <span className="text-slate-600 text-sm">
                          ({Array.isArray(product.productReview) ? product.productReview.length : 0})
                        </span>
                      </div>
                    </div>
                    
                    {/* Price Display - Marble/Granite Fields */}
                    {(product.pricePerCubicMeter || product.pricePerLinearMeter) ? (
                      <div className="flex flex-col gap-2 text-right">
                        {product.pricePerLinearMeter && (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-600">المتر الطولي:</span>
                            {product.offerLinearPrice !== null && product.offerLinearPrice !== undefined && Number(product.offerLinearPrice) > 0 ? (
                              <>
                                <span className="text-sm text-slate-500 line-through">{Number(product.pricePerLinearMeter).toLocaleString()} ج.م</span>
                                <span className="text-xl font-bold text-red-600">{Number(product.offerLinearPrice).toLocaleString()} ج.م</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-green-400">{Number(product.pricePerLinearMeter).toLocaleString()} ج.م</span>
                            )}
                          </div>
                        )}
                        {product.pricePerCubicMeter && (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-600">المتر مربع:</span>
                            {product.offerCubicPrice !== null && product.offerCubicPrice !== undefined && Number(product.offerCubicPrice) > 0 ? (
                              <>
                                <span className="text-sm text-slate-500 line-through">{Number(product.pricePerCubicMeter).toLocaleString()} ج.م</span>
                                <span className="text-xl font-bold text-red-600">{Number(product.offerCubicPrice).toLocaleString()} ج.م</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-green-400">{Number(product.pricePerCubicMeter).toLocaleString()} ج.م</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          {product.price} ج.م
                        </p>
                        {typeof product.PurchasePrice === 'number' && product.PurchasePrice < product.price ? (
                          <p className="text-sm text-slate-500 line-through">
                            {product.PurchasePrice} ج.م
                          </p>
                        ) : null}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleProductClick(product._id || product.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
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

