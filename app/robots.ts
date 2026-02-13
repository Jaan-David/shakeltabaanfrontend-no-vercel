import type { MetadataRoute } from "next";
import { canonicalBaseUrl } from "@/config/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${canonicalBaseUrl}/sitemap.xml`,
    host: canonicalBaseUrl,
  };
}
