import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    "",
    "/categories",
    "/categories/marble",
    "/categories/granite",
    "/categories/quartz",
    "/about",
    "/policies",
    "/about-marble",
    "/marble-info",
  ];

  return staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
