import { generateSEO } from "../../config/seo.config";

export const metadata = generateSEO({
  title: "طلبات التوريد والتركيب",
  description: "إدارة طلبات التوريد والتركيب والتنفيذ على منصة شق الثعبان.",
  keywords: ["توريد", "تركيب", "تنفيذ", "خدمات", "شق الثعبان"],
  noIndex: true,
});

export default function ServiceRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
