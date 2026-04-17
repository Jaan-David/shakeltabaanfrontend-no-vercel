import Script from "next/script";
import { Suspense } from "react";
import ProductsPage from "@/_pages/ProductsPage/ProductsPage";
import { canonicalBaseUrl, generateSEO } from "@/config/seo.config";

export const revalidate = 3600;

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
    : canonicalBaseUrl;

const toAbsoluteUrl = (value: string) =>
  value.startsWith("http")
    ? value
    : `${getSiteUrl()}${value.startsWith("/") ? value : `/${value}`}`;

const stripUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export async function generateMetadata() {
  return generateSEO({
    title: "رخام في مصر وأسعار الجرانيت | شق التعبان",
    description:
      "تصفح رخام مطابخ ورخام أرضيات وجرانيت واجهات من شق التعبان مع توريد رخام في مصر وأسعار تنافسية للمشاريع السكنية والتجارية.",
    keywords: [
      "رخام",
      "جرانيت",
      "كوارتز",
      "رخام مطابخ",
      "رخام أرضيات",
      "جرانيت واجهات",
      "أسعار الجرانيت في مصر",
      "توريد رخام في مصر",
      "شق التعبان",
      "رخام في مصر",
      "جرانيت في مصر",
      "شقه تعبان",
      "شق الثعبان",
      "رخام شق التعبان",
      "جرانيت شق التعبان",
      "marble Egypt",
      "granite Egypt",
      "marble suppliers Egypt",
      "granite suppliers Egypt",
    ],
    url: "/products",
  });
}

export default async function ProductsRoutePage() {
  // Skip data fetching during build to avoid 401 errors
  // Data will be fetched client-side by ProductsPage component
  const products: Array<{ _id?: string; id?: string; name?: string; nameAr?: string; imageList?: string[]; image?: string; images?: string[] }> = [];

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "رخام وجرانيت شق التعبان",
    description:
      "قائمة منتجات الرخام والجرانيت من شق التعبان تشمل موردين ومصانع موثوقة في مصر.",
    url: `${getSiteUrl()}/products`,
    inLanguage: "ar",
  };

  const itemListJsonLd = products.length
    ? stripUndefined({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.slice(0, 50).map((product, index) => {
          const productId = product._id || product.id || String(index + 1);
          const productName = product.name || product.nameAr || "منتج";
          const productUrl = `${getSiteUrl()}/product/${encodeURIComponent(String(productId))}`;
          const imageCandidate =
            (Array.isArray(product.imageList) && product.imageList[0]) ||
            (Array.isArray(product.images) && product.images[0]) ||
            product.image;

          return stripUndefined({
            "@type": "ListItem",
            position: index + 1,
            url: productUrl,
            item: stripUndefined({
              "@type": "Product",
              name: productName,
              url: productUrl,
              image: imageCandidate ? [toAbsoluteUrl(imageCandidate)] : undefined,
            }),
          });
        }),
      })
    : null;

  return (
    <>
      <Script
        id="products-collection-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      {itemListJsonLd ? (
        <Script
          id="products-itemlist-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
        <ProductsPage />
      </Suspense>
    </>
  );
}
