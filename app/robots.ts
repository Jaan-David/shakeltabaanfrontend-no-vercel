import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/profile",
          "/cart",
          "/checkout",
          "/order",
          "/inquiries",
          "/favorites",
          "/addAddress",
          "/login",
          "/register",
          "/reset-password",
          "/active-code",
          "/accept-policies",
          "/*?*filter=",
          "/*?*sort=",
          "/*?*page=",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
