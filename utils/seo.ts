import { seoConfig } from "@/config/seo.config";

type BreadcrumbItem = { name: string; url: string };

type OrganizationJsonLdParams = {
  name: string;
  description?: string;
  url: string;
  logo?: string;
  address?: string;
  areaServed?: string[];
  sameAs?: string[];
};

type LocalBusinessJsonLdParams = {
  name: string;
  description?: string;
  image?: string;
  url: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  areaServed?: string[];
  sameAs?: string[];
};

type AltTextOptions = {
  productName?: string;
  stoneType?: string;
  usage?: string;
  includeDialect?: boolean;
  extra?: string;
};

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.shkelteaban.com";

export const buildOrganizationKeywords = (name?: string, location?: string) => {
  const keywords = [
    name,
    location,
    "رخام شق التعبان",
    "marble suppliers egypt",
    "granite suppliers egypt",
    "stone marketplace egypt",
  ].filter(Boolean) as string[];

  return Array.from(new Set(keywords));
};

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
};

export const buildOrganizationJsonLd = ({
  name,
  description,
  url,
  logo,
  address,
  areaServed,
  sameAs,
}: OrganizationJsonLdParams) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  description: description || seoConfig.siteDescription,
  url,
  logo,
  address: address
    ? {
        "@type": "PostalAddress",
        addressCountry: "EG",
        addressLocality: "Cairo",
        streetAddress: address,
      }
    : undefined,
  areaServed,
  sameAs,
});

export const buildLocalBusinessJsonLd = ({
  name,
  description,
  image,
  url,
  address,
  rating,
  ratingCount,
  areaServed,
  sameAs,
}: LocalBusinessJsonLdParams) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name,
  description: description || seoConfig.siteDescription,
  image,
  url,
  address: address
    ? {
        "@type": "PostalAddress",
        addressCountry: "EG",
        addressLocality: "Cairo",
        streetAddress: address,
      }
    : undefined,
  aggregateRating:
    typeof rating === "number" && typeof ratingCount === "number"
      ? {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount: ratingCount,
        }
      : undefined,
  areaServed,
  sameAs,
});

export const buildAltText = ({
  productName,
  stoneType,
  usage,
  includeDialect,
  extra,
}: AltTextOptions) => {
  const parts = [productName, stoneType, usage, extra].filter(Boolean) as string[];
  if (includeDialect) {
    parts.push("rokham matbakh");
  }
  return parts.length > 0 ? parts.join(" - ") : "product image";
};

type ProductSchemaParams = {
  name: string;
  description: string;
  images: string[];
  sku: string;
  brand?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
  url: string;
};

export const buildProductSchema = ({
  name,
  description,
  images,
  sku,
  brand,
  price,
  currency = 'EGP',
  availability = 'InStock',
  rating,
  reviewCount,
  url,
}: ProductSchemaParams) => {
  const baseUrl = getBaseUrl();
  const absoluteUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const absoluteImages = images.map(img => 
    img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? img : `/${img}`}`
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: absoluteImages,
    sku,
    brand: brand ? {
      '@type': 'Brand',
      name: brand,
    } : undefined,
    offers: price ? {
      '@type': 'Offer',
      url: absoluteUrl,
      priceCurrency: currency,
      price: price,
      availability: `https://schema.org/${availability}`,
    } : undefined,
    aggregateRating: (rating && reviewCount) ? {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
    } : undefined,
  };
};

type FAQSchemaParams = {
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

export const buildFAQSchema = ({ questions }: FAQSchemaParams) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});
