import { generateSEO } from "../../config/seo.config";

export const metadata = generateSEO({
  title: "انواع الرخام المصري | مميزات الرخام الطبيعي",
  description:
    "تعرف على انواع الرخام المصري ومميزات الرخام الطبيعي وعيوب الرخام الصناعي مع معلومات تساعدك تختار افضل رخام للمطبخ والارضيات.",
  keywords: [
    "انواع الرخام المصري",
    "مميزات الرخام الطبيعي",
    "عيوب الرخام الصناعي",
    "الفرق بين الرخام والجرانيت",
    "افضل رخام للمطبخ",
    "انهي رخام احسن للمطبخ",
    "الرخام بيتخدش ولا لا",
    "best marble for kitchen countertops",
    "types of marble stone",
    "granite vs marble durability",
  ],
  url: "/about-marble",
});

export default function AboutMarbleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
