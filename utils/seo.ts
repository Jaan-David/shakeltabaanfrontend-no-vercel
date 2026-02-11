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
