import ProductsPage from "@/_pages/ProductsPage/ProductsPage";
import { generateSEO } from "@/config/seo.config";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "شراء رخام مصري اونلاين | سوق الرخام في مصر",
  description:
    "تصفح سوق الرخام في مصر لشراء رخام مصري اونلاين وجرانيت وكوارتز للمطابخ والمشاريع مع خيارات بالجملة والتصدير.",
  keywords: [
    "شراء رخام مصري اونلاين",
    "رخام طبيعي للبيع",
    "بيع الواح رخام بالجملة",
    "توريد كوارتز للمطابخ",
    "مورد رخام في مصر",
    "مصنع جرانيت في مصر",
    "مورد جرانيت شق التعبان",
    "سوق الرخام في مصر",
    "منصة بيع الرخام",
    "stone marketplace",
    "marble marketplace egypt",
    "egypt stone marketplace",
    "marble suppliers egypt",
    "granite slabs for sale egypt",
    "bulk marble suppliers",
    "marble exporters egypt",
  ],
  url: "/products",
});

export default function ProductsRoutePage() {
  return <ProductsPage />;
}
