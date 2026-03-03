import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import ProductPage, { ProductData } from "@/_pages/ProductPage/ProductPage";
import { fetchProductByIdISR } from "@/services/api/products";
import { reviewService } from "@/services/api/reviews";
import {
  buildProductFaqByCategory,
  getCategoryContentById,
  getCategoryRelatedLinks,
} from "@/lib/categoryContentMap";

import { canonicalBaseUrl, generateSEO, seoConfig } from "@/config/seo.config";

const buildProductKeywords = (product: any) => {
  const name = product?.name || product?.nameAr || "";
  const category = product?.category || "";
  const organization = product?.organizationName || "";
  const material = detectMaterialType(product);

  const baseKeywords = [
    name,
    category,
    organization,
    // Core brand keywords
    "شق التعبان",
    "شقه تعبان",
    "شق الثعبان",
    "منصة شق التعبان",
    // Material-specific keywords
    material,
    `${material} في مصر`,
    `سعر ${material}`,
    `سعر المتر ${material}`,
    `اسعار ${material} في مصر`,
    // Product types
    "رخام",
    "جرانيت",
    "كوارتز",
    "رخام في مصر",
    "جرانيت في مصر",
    "كوارتز مطابخ",
    "اسعار الرخام",
    "اسعار الجرانيت",
    // Commercial intent keywords
    "توريد رخام",
    "تركيب رخام",
    "توريد وتركيب رخام",
    "موردين رخام في مصر",
    "موردين جرانيت في مصر",
    "رخام بالجملة",
    // Brand specific
    "رخام شق التعبان",
    "جرانيت شق التعبان",
    "marble egypt",
    "granite egypt",
    "marble suppliers egypt",
    "granite suppliers egypt",
    "egypt stone marketplace",
  ].filter(Boolean);

  return Array.from(new Set([...seoConfig.defaultKeywords, ...baseKeywords]));
};

const buildProductDescription = (product: any) => {
  const name = product?.name || product?.nameAr || "المنتج";
  const category = product?.category ? `من فئة ${product.category}` : "";
  const material = detectMaterialType(product);
  
  return `اشترِ ${name} ${category} بأفضل سعر في مصر من منصة شق التعبان. ${material} عالي الجودة مع خدمة توريد وتركيب موثوقة لجميع المشاريع السكنية والتجارية. احصل على عرض سعر الآن.`.trim();
};

const detectMaterialType = (product: any) => {
  const text = `${product?.name || ""} ${product?.nameAr || ""} ${
    product?.category || ""
  } ${product?.description || ""}`;

  if (text.includes("جرانيت") || text.toLowerCase().includes("granite")) {
    return "جرانيت";
  }
  if (text.includes("كوارتز") || text.toLowerCase().includes("quartz")) {
    return "كوارتز";
  }
  return "رخام";
};

const buildProductMetaTitle = (product: any, fallbackId: string) => {
  const name = product?.name || product?.nameAr || `منتج ${fallbackId}`;
  const material = detectMaterialType(product);
  const title = `سعر ${name} | ${material} في مصر | توريد وتركيب | شق التعبان`;
  return title.length > 60 ? `سعر ${name} في مصر | شق التعبان` : title;
};

const buildProductMetaDescription = (product: any, material: string) => {
  const name = product?.name || product?.nameAr || "المنتج";
  let description = `احصل على أفضل سعر ${name} من ${material} في مصر عبر منصة شق التعبان. توريد وتركيب موثوق لجميع المشاريع. اطلب عرض سعر مجاني الآن.`;

  if (description.length > 160) {
    description = `افضل سعر ${name} من ${material} في مصر | شق التعبان | توريد وتركيب موثوق | اطلب عرض سعر مجاني`.slice(0, 160);
  }

  return description;
};

function getImageList(
  p?: { imageList?: string[]; images?: string[]; image?: string } | null
): string[] {
  const list =
    p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0
      ? p.imageList
      : Array.isArray(p?.images)
      ? p.images
      : [];
  if (list.length > 0) return list;
  if (p?.image) return [p.image];
  return ["/acessts/NoImage.jpg"]; // Fixed placeholder path
}

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
    : canonicalBaseUrl;

const toAbsoluteUrl = (value: string) => {
  if (value.startsWith("http")) return value;
  const baseUrl = getSiteUrl();
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const stripUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const extractApiProduct = (res: any) => {
  if (res?.data?.product) return res.data.product;
  if (res?.data && (res.data._id || res.data.id)) return res.data;
  if (res?.product) return res.product;
  return null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  try {
    const res = await fetchProductByIdISR(decodedId, 300);
    const apiProduct = extractApiProduct(res);
    const material = detectMaterialType(apiProduct);
    const title = buildProductMetaTitle(apiProduct, decodedId);
    const description = buildProductMetaDescription(apiProduct, material);

    return generateSEO({
      title,
      description,
      keywords: buildProductKeywords(apiProduct),
      image: apiProduct?.image || apiProduct?.imageList?.[0],
      url: `/product/${encodeURIComponent(decodedId)}`,
      type: "product",
    });
  } catch {
    const fallbackTitle = `سعر المنتج في مصر | شق التعبان`;
    return generateSEO({
      title: fallbackTitle.length > 60 ? `${fallbackTitle.slice(0, 59)}…` : fallbackTitle,
      description:
        "تعرف على سعر المنتج في مصر من شق التعبان مع خيارات توريد موثوقة ومقارنات تساعدك على اختيار الرخام أو الجرانيت المناسب.",
      url: `/product/${encodeURIComponent(decodedId)}`,
      type: "product",
    });
  }
}

export default async function ProductByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params in Next.js 15
  const decodedId = decodeURIComponent(id);

  try {
    // ✅ Fetch product details
    const res = await fetchProductByIdISR(decodedId, 300);

    // Check if the response indicates an error
    if (res.status === "error") {
      if (res.message?.includes("not found") || res.message?.includes("Product not found")) {
        return notFound();
      }

      if (
        res.message?.includes("Connection timeout") ||
        res.message?.includes("socket hang up")
      ) {
        console.error(
          `🌐 Network error loading product ${decodedId}:`,
          res.message
        );
        throw new Error(
          "Connection timeout. Please check your internet connection and try again."
        );
      }

      if (res.message?.includes("temporarily unavailable")) {
        console.error(`⏱️ Product temporarily unavailable: ${decodedId}`);
        throw new Error(
          "Product temporarily unavailable. Please try again in a few minutes."
        );
      }
    }

    const apiProduct = extractApiProduct(res);

    if (!apiProduct) {
      return notFound();
    }

    // ✅ Fetch reviews for this product
    let reviews: Array<{
      id: string;
      author: string;
      rating: number;
      date: string;
      content: string;
    }> = [];
    try {
      const reviewsRes = await reviewService.getProductReviews(decodedId);
      const apiReviews = (reviewsRes as any)?.data?.reviews || [];
      reviews = apiReviews.map((r: any) => ({
        id: r._id,
        author: `${r.userId?.firstName || "مستخدم"} ${
          r.userId?.lastName || ""
        }`.trim(),
        rating: Number(r.rateNum || 0),
        date: new Date(r.date || r.createdAt).toLocaleDateString("ar-EG"),
        content: r.description || "",
      }));
      //console.log(`📝 Loaded ${reviews.length} reviews`);
    } catch (err: any) {
      console.warn(
        "⚠️ No reviews found or failed to load reviews:",
        err.message
      );
      reviews = [];
    }

    // Prepare product data
    const rating = Number(apiProduct.averageRate ?? apiProduct.rating ?? 0);
    const ratingCount = Number(apiProduct.reviewsCount ?? reviews.length ?? 0);

    const data: ProductData = {
      id: String(apiProduct._id || apiProduct.id || decodedId),
      title: apiProduct.name || apiProduct.nameAr || "منتج",
      description: apiProduct.description || apiProduct.descriptionAr || "",
      price: Number(apiProduct.price ?? 0),
      imageList: getImageList(apiProduct),
      rating,
      ratingCount,
      category: apiProduct.category || "",
      organizationName: apiProduct.organizationName,
      organizationId: apiProduct.organizationId,
      specs: [
        { label: "التصنيف", value: apiProduct.category || "غير محدد" },
        ...(apiProduct.brand
          ? [{ label: "العلامة التجارية", value: String(apiProduct.brand) }]
          : []),
      ],
      ratingsDistribution: [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
      reviews,
      stockQty: Number(apiProduct.stockQty ?? apiProduct.stockQuantity ?? 0),
      stockType: apiProduct.stockType || "unit",
      _id: "",
      name: "",
    };

    //console.log(`✅ Product page data prepared successfully`);
    const canonicalUrl = `${getSiteUrl()}/product/${encodeURIComponent(decodedId)}`;
    const imageList = getImageList(apiProduct);
    const absoluteImages = imageList.map((img) => toAbsoluteUrl(img));
    const priceValue = Number(apiProduct.price ?? 0);
    const hasPrice = Number.isFinite(priceValue) && priceValue > 0;
    const faqItems = buildProductFaqByCategory({
      category: apiProduct.category,
      productName: apiProduct.name || apiProduct.nameAr,
      color: apiProduct.color,
      origin: apiProduct.origin,
      withInstallation: apiProduct.withInstallation,
    });
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
    const categoryContent = getCategoryContentById(apiProduct.category);
    const relatedLinks = getCategoryRelatedLinks(apiProduct.category);

    const brandName =
      typeof apiProduct.brand === "string" && apiProduct.brand.trim().length > 0
        ? apiProduct.brand.trim()
        : undefined;
    const productJsonLd = stripUndefined({
      "@context": "https://schema.org",
      "@type": "Product",
      name: data.title,
      description: data.description || buildProductDescription(apiProduct),
      image: absoluteImages,
      sku: String(apiProduct._id || apiProduct.id || decodedId),
      brand: brandName
        ? {
            "@type": "Brand",
            name: brandName,
          }
        : undefined,
      offers: hasPrice
        ? {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "EGP",
            price: priceValue,
            availability:
              (apiProduct.stockQty ?? apiProduct.stockQuantity ?? 0) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          }
        : undefined,
      aggregateRating:
        ratingCount > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: rating || 0,
              reviewCount: ratingCount,
            }
          : undefined,
    });

    // Breadcrumb Schema for SEO
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": getSiteUrl(),
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "المنتجات",
          "item": `${getSiteUrl()}/products`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": data.title,
          "item": canonicalUrl,
        },
      ],
    };

    return (
      <>
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <Script
          id="breadcrumb-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <Script
          id="product-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <ProductPage data={data} />
        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                أسئلة شائعة عن سعر {data.title} في مصر
              </h2>
              <div className="mt-6 space-y-5">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0"
                  >
                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                روابط تساعدك في اختيار أفضل
              </h2>
              <div className="mt-6 space-y-6">
                {Array.from(new Set(relatedLinks.map((item) => item.group))).map((group) => (
                  <div key={group}>
                    <h3 className="text-base font-semibold text-slate-800 sm:text-lg mb-3">
                      {group}
                    </h3>
                    <ul className="space-y-2">
                      {relatedLinks
                        .filter((item) => item.group === group)
                        .map((item) => (
                          <li key={`${item.group}-${item.href}-${item.label}`}>
                            <Link
                              href={item.href}
                              className="flex items-center text-sm text-blue-700 hover:text-blue-600 transition-colors font-medium group"
                            >
                              <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover:bg-blue-500" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
              {categoryContent?.seoIntro && (
                <p className="mt-8 text-sm leading-7 text-slate-600 pt-6 border-t border-slate-100">
                  {categoryContent.seoIntro}
                </p>
              )}
            </div>
          </div>
        </section>
      </>
    );
  } catch (e: any) {
    // If notFound() was called, it throws an error - rethrow it to let Next.js handle it
    if (e.message?.includes("NEXT_NOT_FOUND") || e.message?.includes("NEXT_HTTP_ERROR_FALLBACK;404")) {
      // Don't log 404 errors - they're expected when products don't exist
      throw e;
    }

    console.error("❌ Error fetching product:", e.message);

    // Enhanced error handling for different types of errors
    if (
      e.message?.includes("Connection timeout") ||
      e.message?.includes("socket hang up")
    ) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                مشكلة في الاتصال
              </h1>
              <p className="text-gray-600 mb-6">
                انقطع الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-slate-700/50 backdrop-blur-sm text-slate-200 px-4 py-3 rounded-lg hover:bg-slate-600/50 border border-slate-600 font-medium"
              >
                العودة للصفحة السابقة
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Rate limit or server busy
    if (
      e.message?.includes("temporarily unavailable") ||
      e.message?.includes("high demand")
    ) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                الخدمة غير متاحة مؤقتاً
              </h1>
              <p className="text-gray-600 mb-6">
                الخادم مشغول حالياً. يُرجى الانتظار قليلاً ثم المحاولة مرة أخرى.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium"
              >
                إعادة المحاولة الآن
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-slate-700/50 backdrop-blur-sm text-slate-200 px-4 py-3 rounded-lg hover:bg-slate-600/50 border border-slate-600 font-medium"
              >
                العودة للصفحة السابقة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return notFound();
  }
}

