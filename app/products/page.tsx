import ProductsPage from "@/_pages/ProductsPage/ProductsPage";
import { canonicalBaseUrl, generateSEO } from "@/config/seo.config";
import { fetchProductsISR } from "@/services/api/products";

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
    title: "رخام وجرانيت شق التعبان | مصر",
    description:
      "تصفح رخام وجرانيت شق التعبان في مصر من موردين موثوقين للواجهات والمطابخ والمشاريع بأسعار تنافسية.",
    keywords: [
      "رخام",
      "جرانيت",
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
  let products: Array<{ _id?: string; id?: string; name?: string; nameAr?: string; imageList?: string[]; image?: string; images?: string[] }> = [];

  try {
    const res = await fetchProductsISR({ page: 1, limit: 60 }, 300);
    if (Array.isArray(res?.data)) {
      products = res.data;
    } else if (Array.isArray((res as any)?.data?.products)) {
      products = (res as any).data.products;
    }
  } catch {
    products = [];
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <ProductsPage />
    </>
  );
}
