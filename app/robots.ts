import type { MetadataRoute } from "next";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.shkelteaban.com";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
