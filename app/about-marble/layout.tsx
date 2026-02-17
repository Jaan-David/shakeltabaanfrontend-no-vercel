import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "أنواع الرخام في مصر | شق التعبان",
  description:
    "تعرف على أنواع الرخام في مصر ومميزاته واستخداماته مع مقارنة الرخام والجرانيت ونصائح اختيار الرخام من شق التعبان بأسلوب مبسط.",
  keywords: [
    "أنواع الرخام",
    "رخام في مصر",
    "الفرق بين الرخام والجرانيت",
    "مميزات الرخام",
    "رخام شق التعبان",
  ],
  url: "/about-marble",
  type: "article",
});

export default function AboutMarbleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
