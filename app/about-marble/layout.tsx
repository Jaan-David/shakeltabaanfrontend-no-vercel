import { generateSEO } from "../../config/seo.config";

export const metadata = generateSEO({
  title: "تعرف على الرخام",
  description: "دليل الرخام الشامل: الأنواع والاستخدامات وطرق الاختيار في السوق المصري.",
  keywords: ["انواع الرخام", "طرق اختيار الرخام", "رخام", "سوق الرخام في مصر"],
  url: "/about-marble",
});

export default function AboutMarbleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
