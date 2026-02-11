import AboutPage from "@/pages/AboutPage/Aboutpage";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "افضل مصانع الرخام في مصر | منصة شق التعبان",
  description:
    "تعرف على منصة شق التعبان كمركز موثوق لتوريد الرخام والجرانيت والكوارتز للمشاريع والمطابخ والتصدير.",
  keywords: [
    "افضل مصانع الرخام في مصر",
    "تقييم مصانع شق التعبان",
    "افضل مورد جرانيت مصري",
    "جودة الرخام المصري",
    "شركات رخام موثوقة مصر",
    "تجارب شراء رخام من شق التعبان",
    "رخام عالي الجودة مصر",
    "best marble suppliers egypt",
    "trusted granite supplier egypt",
    "top stone exporters egypt",
  ],
});

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="w-full max-w-[380px] sm:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1360px] min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <AboutPage />
      </div>
    </div>
  );
}
