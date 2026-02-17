import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import ProductPage, { ProductData } from "@/_pages/ProductPage/ProductPage";
import { fetchProductByIdISR } from "@/services/api/products";
import { reviewService } from "@/services/api/reviews";

import { canonicalBaseUrl, generateSEO, seoConfig } from "@/config/seo.config";
import { marbleUseCategories } from "@/app/marble-uses/data";

const buildProductKeywords = (product: any) => {
  const name = product?.name || product?.nameAr || "";
  const category = product?.category || "";
  const organization = product?.organizationName || "";

  const baseKeywords = [
    name,
    category,
    organization,
    "رخام",
    "جرانيت",
    "شق التعبان",
    "شقه تعبان",
    "شق الثعبان",
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
  return `اشترِ ${name} ${category} من شق التعبان في مصر. رخام وجرانيت بجودة عالية وأسعار منافسة لمشاريعك.`.trim();
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
  const title = `سعر ${name} في مصر | شق التعبان`;
  return title.length > 60 ? `${title.slice(0, 59)}…` : title;
};

const buildProductMetaDescription = (product: any, material: string) => {
  const name = product?.name || product?.nameAr || "المنتج";
  let description = `سعر ${name} من ${material} متاح في مصر عبر شق التعبان مع توريد موثوق وخيارات متعددة تناسب المشاريع السكنية والتجارية.`;

  if (description.length < 140) {
    description = `${description} اطلب عرض سعر الآن.`;
  }

  if (description.length > 160) {
    description = `${description.slice(0, 157).trimEnd()}...`;
  }

  return description;
};

const buildProductFaqItems = (product: any, material: string) => {
  const name = product?.name || product?.nameAr || "هذا المنتج";
  return [
    {
      question: `ما سعر المتر من ${name} في مصر؟`,
      answer:
        `السعر يعتمد على المقاس والسُمك والمصدر. تواصل مع شق التعبان للحصول على سعر متر ${material} المناسب لمشروعك بدقة.`,
    },
    {
      question: `ما أفضل استخدامات ${name}؟`,
      answer:
        `يُستخدم ${name} في الأرضيات والمطابخ والواجهات حسب درجة التحمل والصيانة المطلوبة، ويمكن لفريق شق التعبان ترشيح الاستخدام الأنسب.`,
    },
    {
      question: `ما الفرق بين ${name} والبدائل الأخرى؟`,
      answer:
        `البدائل تختلف في المتانة ومقاومة البقع والتكلفة. مقارنة ${material} مع الجرانيت أو الكوارتز تساعدك على اختيار الأفضل حسب ميزانيتك.`,
    },
  ];
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
    const materialType = detectMaterialType(apiProduct);
    const faqItems = buildProductFaqItems(apiProduct, materialType);
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
    const relatedUseCategories = marbleUseCategories
      .filter((item) => {
        const title = item.title;
        if (materialType === "كوارتز") {
          return title.includes("مطبخ") || title.includes("مطابخ");
        }
        if (materialType === "جرانيت") {
          return title.includes("واجه") || title.includes("سلالم") || title.includes("أرضيات");
        }
        return title.includes("أرضيات") || title.includes("مداخل") || title.includes("حمامات");
      })
      .slice(0, 3);

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

    return (
      <>
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
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
                روابط مفيدة لاختيار {materialType}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600 sm:text-base">
                <li>
                  <Link
                    href="/marble-info"
                    className="font-semibold text-blue-700 hover:text-blue-600"
                  >
                    تعرف على أنواع الرخام والجرانيت والكوارتز في مصر
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/products?category=${encodeURIComponent(materialType)}`}
                    className="font-semibold text-blue-700 hover:text-blue-600"
                  >
                    تصفح منتجات {materialType} وأسعارها في مصر
                  </Link>
                </li>
                {relatedUseCategories.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/marble-uses/${item.slug}`}
                      className="font-semibold text-blue-700 hover:text-blue-600"
                    >
                      استخدامات {item.title} للمشاريع المختلفة
                    </Link>
                  </li>
                ))}
              </ul>
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

