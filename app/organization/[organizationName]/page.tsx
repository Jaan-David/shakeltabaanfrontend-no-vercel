import Link from "next/link";
import Image from "next/image";
import { generateSEO, seoConfig } from "@/config/seo.config";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import {
  buildAltText,
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  buildOrganizationKeywords,
  buildOrganizationJsonLd,
} from "@/utils/seo";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";
const API_IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL).replace(
  /\/app\/v1\/?$/,
  ""
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ organizationName: string }>;
}) {
  const resolvedParams = await params;
  const organizationId = decodeURIComponent(resolvedParams.organizationName || "");
  const orgData = await fetchOrganizationProfile(organizationId);
  const title = orgData?.name || organizationId || "ملف الشريك";
  const description =
    orgData?.description ||
    "تعرف على مصنع أو معرض الشريك ومنتجات الرخام والجرانيت والكوارتز في منصة شق الثعبان.";

  return generateSEO({
    title,
    description,
    keywords: buildOrganizationKeywords(title, orgData?.location),
    url: `/organization/${encodeURIComponent(resolvedParams.organizationName || "")}`,
  });
}

type Product = {
  _id?: string;
  id?: string;
  name?: string;
  nameAr?: string;
  category?: string;
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
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${API_BASE_URL}/products/organization/${safeId}`, {
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
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${API_BASE_URL}/previous-work/organization/${safeId}`, {
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
  const safeId = encodeURIComponent(organizationId);
  const response = await fetch(`${API_BASE_URL}/organizations/${safeId}`, {
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
  return `${API_IMAGE_BASE_URL}/${cleaned}`;
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
  const logoIsRemote = logo.startsWith("http://") || logo.startsWith("https://");

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

  const heroImageRaw = orgProfile.logo;
  const normalizeHeroImage = (path?: string | null) => {
    if (!path) return "/categories/rokham10.jpeg";
    if (
      path.startsWith("/logo/") ||
      path.startsWith("/categories/") ||
      path.startsWith("/acessts/")
    ) {
      return path;
    }
    return normalizeApiImage(path);
  };
  const heroImage = normalizeHeroImage(heroImageRaw);
  const heroImageIsRemote = heroImage.startsWith("http://") || heroImage.startsWith("https://");
  const hasDescription = Boolean(orgProfile.description?.trim());
  const hasRating = typeof orgProfile.rating === "number";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const organizationUrl = `${baseUrl}/organization/${encodeURIComponent(organizationId)}`;
  const areaServed = ["EG", "SA", "AE", "KW", "LY", "JO"];
  const sameAs = Object.values(seoConfig.socialLinks);
  const organizationSchema = buildOrganizationJsonLd({
    name: orgProfile.name,
    description: orgProfile.description,
    url: organizationUrl,
    logo: orgProfile.logo,
    address: orgProfile.location,
    areaServed,
    sameAs,
  });

  const localBusinessSchema = buildLocalBusinessJsonLd({
    name: orgProfile.name,
    description: orgProfile.description,
    image: orgProfile.logo,
    url: organizationUrl,
    address: orgProfile.location,
    rating: orgProfile.rating,
    ratingCount: orgProfile.reviewsCount,
    areaServed,
    sameAs,
  });

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "الرئيسية", url: "/" },
    { name: "المصانع والمعارض", url: "/factories" },
    { name: orgProfile.name, url: `/organization/${encodeURIComponent(organizationId)}` },
  ]);

  return (
    <main className="min-h-screen bg-slate-50 font-beiruti">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pt-8 space-y-12">
        <RevealOnScroll className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-56 md:h-72">
            <Image
              src={heroImage}
              alt={orgProfile.name}
              fill
              className="object-cover"
              priority
              unoptimized={heroImageIsRemote}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/50 to-slate-900/80 backdrop-blur-[2px]" />
          </div>
          <div className="relative -mt-10 md:-mt-14 mx-4 md:mx-8 mb-6 rounded-2xl border border-slate-200 bg-white/95 p-5 md:p-8 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">ملف الشريك</p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {orgProfile.name}
                </h1>
                {hasDescription ? (
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {orgProfile.description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                {hasRating ? (
                  <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < Math.round(orgProfile.rating) ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-slate-600">
                      {orgProfile.rating} ({orgProfile.reviewsCount})
                    </span>
                  </div>
                ) : null}
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-200 hover:text-blue-700"
                  >
                    العودة للرئيسية
                  </Link>
                  <Link
                    href="#organization-products"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
                  >
                    منتجات المعرض
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
              <Image
                src={orgProfile.logo}
                alt={orgProfile.name}
                width={112}
                height={112}
                sizes="(max-width: 768px) 96px, 112px"
                className="w-full h-full object-contain p-3"
                priority
                unoptimized={logoIsRemote}
              />
            </div>
            <div className="flex-1 space-y-3 text-right">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{orgProfile.name}</h2>
              {hasDescription ? (
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  {orgProfile.description}
                </p>
              ) : null}
              {hasRating ? (
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1 text-yellow-400 text-lg">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < Math.round(orgProfile.rating) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">
                    {orgProfile.rating} ({orgProfile.reviewsCount})
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm" id="organization-products">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">منتجات المعرض</h3>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl mt-6">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
              <p className="text-slate-600">لم نتمكن من العثور على منتجات لهذا الشريك</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const id = product._id || product.id || "";
                const name = product.nameAr || product.name || "منتج";
                const rawImage = product.imageList?.[0] || product.image || "";
                const image = rawImage ? normalizeApiImage(rawImage) : "/acessts/NoImage.jpg";
                const imageIsRemote = image.startsWith("http://") || image.startsWith("https://");
                const altText = buildAltText({
                  productName: name,
                  stoneType: product.category || "رخام",
                  usage: "مطابخ",
                  includeDialect: index === 0,
                });
                return (
                  <div
                    key={id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={image}
                        alt={altText}
                        width={420}
                        height={320}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        unoptimized={imageIsRemote}
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 leading-tight line-clamp-2">
                        {name}
                      </h3>
                      {product.category ? (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {product.category}
                        </p>
                      ) : null}
                      <Link
                        href={`/product/${encodeURIComponent(id)}`}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </RevealOnScroll>

        <RevealOnScroll className="rounded-3xl border border-slate-200 bg-slate-100/70 p-6 md:p-8 shadow-sm">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">الأعمال السابقة</h3>
          {previousWorks.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl mt-6">
              <div className="text-5xl mb-3">🧱</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">لا توجد أعمال سابقة</h4>
              <p className="text-slate-600">لم نتمكن من العثور على أعمال سابقة لهذا الشريك</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousWorks.map((work) => {
                const id = work._id || work.id || work.title || "work";
                const rawImage = work.photoList?.[0] || "";
                const image = rawImage ? normalizeApiImage(rawImage) : "/acessts/NoImage.jpg";
                const imageIsRemote = image.startsWith("http://") || image.startsWith("https://");
                return (
                  <div
                    key={id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={image}
                        alt={work.title || "عمل سابق"}
                        width={520}
                        height={340}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        unoptimized={imageIsRemote}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-4 right-4 left-4">
                        <h4 className="text-base md:text-lg font-semibold text-white line-clamp-2">
                          {work.title || "مشروع"}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </RevealOnScroll>
      </div>
    </main>
  );
}
