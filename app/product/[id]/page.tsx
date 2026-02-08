import { notFound } from "next/navigation";
import ProductPage, { ProductData } from "@/pages/ProductPage/ProductPage";
import { fetchProductByIdISR } from "@/services/api/products";
import { reviewService } from "@/services/api/reviews";

import { generateSEO } from "@/config/seo.config";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductKeywords,
} from "@/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const apiImageBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3002/app/v1"
  ).replace(/\/app\/v1\/?$/, "");

  try {
    const response = await fetchProductByIdISR(decodedId, 3600);
    const responseRecord = response as unknown as Record<string, unknown>;
    const dataRecord = responseRecord?.data as Record<string, unknown> | undefined;
    const apiProduct =
      (dataRecord?.product as Record<string, unknown> | undefined) ||
      (responseRecord?.product as Record<string, unknown> | undefined);

    if (!apiProduct) {
      return generateSEO({
        title: "منتج غير متاح",
        description: "هذا المنتج غير متاح حاليًا على منصة شق الثعبان.",
        noIndex: true,
      });
    }

    const title =
      (apiProduct.name as string | undefined) ||
      (apiProduct.nameAr as string | undefined) ||
      "منتج رخام";
    const description =
      (apiProduct.description as string | undefined) ||
      (apiProduct.descriptionAr as string | undefined) ||
      "اكتشف تفاصيل المنتج من مصانع ومعارض شق الثعبان في مصر.";
    const rawImage =
      (apiProduct.image as string | undefined) ||
      ((apiProduct.imageList as string[] | undefined) || [])[0];
    const image = rawImage
      ? rawImage.startsWith("http")
        ? rawImage
        : `${apiImageBaseUrl}/${rawImage.replace(/^\//, "")}`
      : `${baseUrl}/acessts/NoImage.jpg`;

    return generateSEO({
      title,
      description,
      keywords: buildProductKeywords({ name: title }),
      image,
      url: `/product/${encodeURIComponent(id)}`,
      type: "product",
    });
  } catch {
    return generateSEO({
      title: "منتج غير متاح",
      description: "هذا المنتج غير متاح حاليًا على منصة شق الثعبان.",
      noIndex: true,
    });
  }
}

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

const resolveProductImageForSchema = (image: string, baseUrl: string) => {
  if (!image) return `${baseUrl}/acessts/NoImage.jpg`;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return `${baseUrl}${image}`;
  const apiImageBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3002/app/v1"
  ).replace(/\/app\/v1\/?$/, "");
  return `${apiImageBaseUrl}/${image.replace(/^\//, "")}`;
};

const resolveMaterialFromCategory = (category?: string) => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("granite") || normalized.includes("جرانيت")) return "Granite";
  if (normalized.includes("quartz") || normalized.includes("كوارتز")) return "Quartz";
  if (normalized.includes("marble") || normalized.includes("رخام")) return "Marble";
  return "Marble";
};

export default async function ProductByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params in Next.js 15
  const decodedId = decodeURIComponent(id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    //console.log(`🔄 Loading product page for ID: ${decodedId}`);

    // ✅ Fetch product details
    const res = await fetchProductByIdISR(decodedId, 3600);
    //console.log(`📦 Product fetch result:`, res);

    // Check if the response indicates an error
    if (res.status === "error") {
      if (res.message?.includes("Product not found")) {
        //console.log(`❌ Product not found: ${decodedId}`);
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

    const apiProduct: any =
      (res as any)?.data?.product || (res as any)?.product;
    if (!apiProduct) {
      //console.log(`❌ No product data received for ID: ${decodedId}`);
      return notFound();
    }

    console.log(`✅ Product data received:`, apiProduct.title || apiProduct.name);
    console.log(`📦 Organization Name:`, apiProduct.organizationName);
    console.log(`📦 Organization ID:`, apiProduct.organizationId);
    console.log(`📦 Full API Product:`, JSON.stringify(apiProduct, null, 2));

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

    const productImages = getImageList(apiProduct);
    const schemaImages = productImages.map((image) =>
      resolveProductImageForSchema(image, baseUrl)
    );
    const productUrl = `${baseUrl}/product/${encodeURIComponent(data.id)}`;
    const productSchema = buildProductJsonLd({
      id: data.id,
      title: data.title,
      description: data.description,
      images: schemaImages,
      price: data.price,
      rating,
      ratingCount,
      url: productUrl,
      category: data.category || "رخام",
      material: resolveMaterialFromCategory(data.category),
      brand: apiProduct.brand || apiProduct.organizationName || "شق الثعبان",
    });

    const breadcrumbSchema = buildBreadcrumbJsonLd([
      { name: "الرئيسية", url: "/" },
      { name: data.category || "المنتجات", url: "/categories" },
      { name: data.title, url: `/product/${encodeURIComponent(data.id)}` },
    ]);

    console.log(`📤 Data being passed to ProductPage:`, JSON.stringify(data, null, 2));

    //console.log(`✅ Product page data prepared successfully`);
    return (
      <>
        <ProductPage data={data} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      </>
    );
  } catch (e: any) {
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
