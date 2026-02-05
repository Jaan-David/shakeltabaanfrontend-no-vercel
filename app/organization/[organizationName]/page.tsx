import Link from "next/link";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "ملف الشريك",
  description: "عرض منتجات الشريك",
  keywords: ["شركاء", "منتجات", "رخام", "جرانيت"],
});

type Product = {
  _id?: string;
  id?: string;
  name?: string;
  nameAr?: string;
  imageList?: string[];
  image?: string;
  price?: number;
  PurchasePrice?: number;
  averageRate?: number;
  productReview?: unknown[];
  isOffer?: boolean;
  pricePerLinearMeter?: number;
  pricePerCubicMeter?: number;
  offerLinearPrice?: number | null;
  offerCubicPrice?: number | null;
  organizationName?: string;
  organizationId?: string;
};

type PreviousWork = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  photoList?: string[];
  createdAt?: string;
};

type OrganizationProfile = {
  _id?: string;
  id?: string;
  organizationId?: string;
  name?: string;
  description?: string;
  location?: string;
  photo?: string;
};

async function fetchOrganizationProducts(organizationId: string): Promise<Product[]> {
  const BASE_URL = "https://shk2t-t3ban.fly.dev/app/v1";
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${BASE_URL}/products/organization/${safeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const candidates = [
    data?.data?.products,
    data?.data,
    data?.products,
    data?.data?.data?.products,
    data?.data?.data,
  ];
  const products = candidates.find((item) => Array.isArray(item));
  return Array.isArray(products) ? (products as Product[]) : [];
}

async function fetchOrganizationPreviousWork(
  organizationId: string
): Promise<PreviousWork[]> {
  const BASE_URL = "https://shk2t-t3ban.fly.dev/app/v1";
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${BASE_URL}/previous-work/organization/${safeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const candidates = [
    data?.data,
    data?.data?.data,
    data?.previousWork,
    data?.data?.previousWork,
  ];
  const works = candidates.find((item) => Array.isArray(item));
  return Array.isArray(works) ? (works as PreviousWork[]) : [];
}

async function fetchOrganizationProfile(
  organizationId: string
): Promise<OrganizationProfile | null> {
  const BASE_URL = "https://shk2t-t3ban.fly.dev/app/v1";
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${BASE_URL}/organizations/${safeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return (data?.data as OrganizationProfile) || null;
}

const normalizeApiImage = (path?: string | null): string => {
  if (!path) return "/acessts/NoImage.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleaned = path.startsWith("/") ? path.slice(1) : path;
  return `https://shk2t-t3ban.fly.dev/${cleaned}`;
};

export default async function OrganizationProfilePage({
  params,
}: {
  params: Promise<{ organizationName: string }>;
}) {
  const resolvedParams = await params;
  const organizationId = decodeURIComponent(resolvedParams.organizationName || "");
  const [products, previousWorks, orgData] = await Promise.all([
    fetchOrganizationProducts(organizationId),
    fetchOrganizationPreviousWork(organizationId),
    fetchOrganizationProfile(organizationId),
  ]);

  const rawPhoto = orgData?.photo || "";
  const logo = rawPhoto ? normalizeApiImage(rawPhoto) : "/logo/logo1.png";

  const orgProfile = {
    name: orgData?.name || organizationId || "اسم الشركة",
    description:
      orgData?.description ||
      "شركة متخصصة في جميع أنواع الرخام والجرانيت، بخبرة طويلة وجودة عالية في التنفيذ والتوريد.",
    location: orgData?.location || "",
    rating: 4.6,
    reviewsCount: 128,
    logo,
  };

  return (
    <div className="min-h-screen bg-white font-beiruti mt-[93px]">
      <div className="mx-auto max-w-[95%] px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة للرئيسية
          </Link>
          <div className="text-center">
            
          </div>
          <div className="w-[140px]" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={orgProfile.logo}
              alt={orgProfile.name}
              className="w-full h-full object-contain p-3"
            />
          </div>
          <div className="flex-1 text-center md:text-right space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
              {orgProfile.name}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {orgProfile.description}
            </p>
            {orgProfile.location ? (
              <p className="text-slate-500 text-sm">{orgProfile.location}</p>
            ) : null}
            <div className="flex items-center justify-center md:justify-end gap-2">
              <div className="flex items-center gap-1 text-yellow-400 text-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.round(orgProfile.rating) ? "★" : "☆"}</span>
                ))}
              </div>
              <span className="text-slate-600 text-sm">
                {orgProfile.rating} ({orgProfile.reviewsCount})
              </span>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900">
              المنتجات
            </h3>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">لا توجد منتجات</h3>
              <p className="text-slate-600">لم نتمكن من العثور على منتجات لهذا الشريك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const id = product._id || product.id || "";
                const name = product.nameAr || product.name || "منتج";
                const rawImage = product.imageList?.[0] || product.image || "";
                const image = rawImage ? normalizeApiImage(rawImage) : "/acessts/NoImage.jpg";
                const ratingCount = Array.isArray(product.productReview) ? product.productReview.length : 0;
                return (
                  <div
                    key={id}
                    className="group marble-card p-6 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2"
                  >
                    {product.isOffer && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-black text-xs font-extrabold px-3 py-1 rounded-md border-2 border-red-700 shadow-lg">
                        عرض خاص
                      </div>
                    )}
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="space-y-3">
                      {(product.organizationName || product.organizationId) && (
                        <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <span className="text-xs font-semibold text-blue-700">
                            {product.organizationName || product.organizationId}
                          </span>
                        </div>
                      )}
                      <h3 className="text-slate-900 font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-slate-600 text-sm">
                            {typeof product.averageRate === "number" ? product.averageRate : 4.5}
                          </span>
                          <span className="text-slate-500 text-sm">({ratingCount})</span>
                        </div>
                      </div>
                      {(product.pricePerCubicMeter || product.pricePerLinearMeter) ? (
                        <div className="flex flex-col gap-2 text-right">
                          {product.pricePerLinearMeter && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-600">المتر الطولي:</span>
                              {product.offerLinearPrice !== null && product.offerLinearPrice !== undefined && Number(product.offerLinearPrice) > 0 ? (
                                <>
                                  <span className="text-sm text-slate-500 line-through">{Number(product.pricePerLinearMeter).toLocaleString("ar-EG")} ج.م</span>
                                  <span className="text-xl font-bold text-red-600">{Number(product.offerLinearPrice).toLocaleString("ar-EG")} ج.م</span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-green-400">{Number(product.pricePerLinearMeter).toLocaleString("ar-EG")} ج.م</span>
                              )}
                            </div>
                          )}
                          {product.pricePerCubicMeter && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-600">المتر المكعب:</span>
                              {product.offerCubicPrice !== null && product.offerCubicPrice !== undefined && Number(product.offerCubicPrice) > 0 ? (
                                <>
                                  <span className="text-sm text-slate-500 line-through">{Number(product.pricePerCubicMeter).toLocaleString("ar-EG")} ج.م</span>
                                  <span className="text-xl font-bold text-red-600">{Number(product.offerCubicPrice).toLocaleString("ar-EG")} ج.م</span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-green-400">{Number(product.pricePerCubicMeter).toLocaleString("ar-EG")} ج.م</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">
                            {Number(product.price ?? 0).toLocaleString("ar-EG")} ج.م
                          </p>
                          {typeof product.PurchasePrice === "number" &&
                          product.PurchasePrice < Number(product.price ?? 0) ? (
                            <p className="text-sm text-slate-500 line-through">
                              {product.PurchasePrice.toLocaleString("ar-EG")} ج.م
                            </p>
                          ) : null}
                        </div>
                      )}
                      <Link
                        href={`/product/${encodeURIComponent(id)}`}
                        className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="pt-8 border-t border-gray-200 space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-900">
            الأعمال السابقة
          </h3>
          {previousWorks.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
              <div className="text-5xl mb-3">🧱</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">لا توجد أعمال سابقة</h4>
              <p className="text-slate-600">لم نتمكن من العثور على أعمال سابقة لهذا الشريك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousWorks.map((work) => {
                const id = work._id || work.id || work.title || "work";
                const rawImage = work.photoList?.[0] || "";
                const image = rawImage ? normalizeApiImage(rawImage) : "/acessts/NoImage.jpg";
                return (
                  <div
                    key={id}
                    className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={image}
                        alt={work.title || "عمل سابق"}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-slate-900 font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {work.title || "مشروع"}
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                        {work.description || "لا يوجد وصف متاح"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
