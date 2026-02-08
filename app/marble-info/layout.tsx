import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "معلومات الرخام",
  description: "معلومات وأنواع الرخام وأسعار تقديرية في مصر مع نصائح الاختيار والصيانة.",
  keywords: ["معلومات الرخام", "اسعار الرخام", "رخام مصري", "نصائح الرخام"],
  url: "/marble-info",
});

export default function MarbleInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
