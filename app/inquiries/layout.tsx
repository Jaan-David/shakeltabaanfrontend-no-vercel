import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "الطلبات الخاصة",
  description: "إدارة الطلبات الخاصة على منصة شق الثعبان.",
  keywords: ["طلبات خاصة", "شق الثعبان"],
  noIndex: true,
});

export default function InquiriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
