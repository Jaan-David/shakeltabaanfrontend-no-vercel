import { seoConfig, generateBreadcrumb } from "@/config/seo.config";

export type KeywordIntent =
  | "buy"
  | "price"
  | "comparison"
  | "education"
  | "trust"
  | "supplier"
  | "export";

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const toAbsoluteUrl = (value?: string) => {
  if (!value) return getBaseUrl();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${getBaseUrl()}${normalized}`;
};

export const buildKeywordSet = ({
  baseKeywords = [],
  intents = [],
  includeBrandVariants = true,
  includeInternational = true,
  includeFranco = true,
  includeMisspellings = true,
}: {
  baseKeywords?: string[];
  intents?: KeywordIntent[];
  includeBrandVariants?: boolean;
  includeInternational?: boolean;
  includeFranco?: boolean;
  includeMisspellings?: boolean;
}) => {
  const intentKeywords: string[] = [];

  if (intents.includes("buy")) {
    intentKeywords.push(
      "شراء رخام",
      "بيع رخام",
      "مصانع رخام",
      "معارض رخام",
      "Marble Suppliers",
      "Stone Marketplace"
    );
  }

  if (intents.includes("price")) {
    intentKeywords.push(
      "سعر متر الرخام",
      "اسعار الرخام اليوم",
      "Granite Countertop Prices"
    );
  }

  if (intents.includes("comparison")) {
    intentKeywords.push("الفرق بين الرخام والجرانيت", "Quartz Countertops");
  }

  if (intents.includes("education")) {
    intentKeywords.push("افضل نوع رخام", "ازاي تختار الرخام");
  }

  if (intents.includes("trust")) {
    intentKeywords.push("تقييمات", "مصانع موثوقة", "verified factories");
  }

  if (intents.includes("supplier")) {
    intentKeywords.push("مصانع رخام", "معارض رخام", "Marble Suppliers");
  }

  if (intents.includes("export")) {
    intentKeywords.push("Marble Slabs Export", "Bulk Granite Egypt");
  }

  const groupKeywords: string[] = [
    ...seoConfig.keywordGroups.arabicCore,
    ...(includeMisspellings ? seoConfig.keywordGroups.arabicMisspellings : []),
    ...(includeInternational ? seoConfig.keywordGroups.internationalEnglish : []),
    ...(includeFranco ? seoConfig.keywordGroups.francoArabic : []),
  ];

  return unique([
    ...baseKeywords,
    ...intentKeywords,
    ...groupKeywords,
    ...(includeBrandVariants ? seoConfig.brandVariants : []),
  ]);
};

export const buildProductKeywords = ({
  name,
  category,
  usage,
}: {
  name?: string;
  category?: string;
  usage?: string;
}) =>
  buildKeywordSet({
    baseKeywords: unique([
      name || "",
      category || "",
      usage || "",
      "رخام",
      "جرانيت",
      "كوارتز",
    ]),
    intents: ["buy", "price", "supplier"],
  });

export const buildOrganizationKeywords = (name?: string, area?: string) =>
  buildKeywordSet({
    baseKeywords: unique([
      name || "",
      area || "",
      "مصانع رخام",
      "معارض رخام",
      "Marble Suppliers",
    ]),
    intents: ["supplier", "trust"],
  });

export const buildCategoryKeywords = (category?: string) =>
  buildKeywordSet({
    baseKeywords: unique([category || "", "رخام", "جرانيت", "كوارتز"]),
    intents: ["buy", "price"],
  });

export const buildAreaKeywords = (area?: string) =>
  buildKeywordSet({
    baseKeywords: unique([
      area || "",
      "رخام",
      "جرانيت",
      "كوارتز",
      "مصانع رخام",
    ]),
    intents: ["supplier"],
  });

export const buildAltText = ({
  productName,
  stoneType,
  usage,
  includeDialect = false,
}: {
  productName?: string;
  stoneType?: string;
  usage?: string;
  includeDialect?: boolean;
}) => {
  const base = [productName, stoneType, usage, "مصر"].filter(Boolean).join(" ");
  const dialect = includeDialect ? "شق التعبان" : "شق الثعبان";
  return base ? `${base} ${dialect}` : `رخام مطابخ مصري ${dialect}`;
};

export const buildBreadcrumbJsonLd = (items: Array<{ name: string; url: string }>) =>
  generateBreadcrumb(
    items.map((item) => ({
      ...item,
      url: toAbsoluteUrl(item.url),
    }))
  );

export const buildProductJsonLd = ({
  id,
  title,
  description,
  images,
  price,
  rating,
  ratingCount,
  url,
  category,
  material,
  brand,
}: {
  id: string;
  title: string;
  description?: string;
  images: string[];
  price: number;
  rating?: number;
  ratingCount?: number;
  url: string;
  category?: string;
  material?: string | string[];
  brand?: string;
}) => {
  const absoluteUrl = toAbsoluteUrl(url);
  const absoluteImages = images.map((image) => toAbsoluteUrl(image));
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: description || "",
    image: absoluteImages,
    sku: id,
    brand: {
      "@type": "Brand",
      name: brand || seoConfig.siteName,
    },
    category: category || undefined,
    material: material || undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl,
      priceCurrency: "EGP",
      price,
      availability:
        price > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  if (ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating || 0,
      reviewCount: ratingCount,
    };
  }

  return schema;
};

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
  geo,
}: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  areaServed?: string[];
  sameAs?: string[];
  geo?: { latitude: number; longitude: number };
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: description || "",
    image: image ? toAbsoluteUrl(image) : undefined,
    url: toAbsoluteUrl(url),
    areaServed,
    sameAs,
  };

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: address,
      addressCountry: "EG",
    };
  }

  if (geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  if (ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating || 0,
      reviewCount: ratingCount,
    };
  }

  return schema;
};

export const buildFAQJsonLd = (items: Array<{ question: string; answer: string }>) => {
  const validItems = items
    .filter((item) => item?.question?.trim() && item?.answer?.trim())
    .map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.trim(),
      },
    }));

  if (validItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems,
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
}: {
  name: string;
  description?: string;
  url: string;
  logo?: string;
  address?: string;
  areaServed?: string[];
  sameAs?: string[];
}) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description: description || "",
    url: toAbsoluteUrl(url),
    logo: logo ? toAbsoluteUrl(logo) : undefined,
    sameAs,
  };

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: address,
      addressCountry: "EG",
    };
  }

  if (areaServed && areaServed.length > 0) {
    schema.areaServed = areaServed;
  }

  return schema;
};

export const buildItemListJsonLd = ({
  name,
  items,
}: {
  name: string;
  items: Array<{ url: string; title: string; position: number }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: items.map((item) => ({
    "@type": "ListItem",
    position: item.position,
    url: toAbsoluteUrl(item.url),
    name: item.title,
  })),
});
