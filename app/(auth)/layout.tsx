import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "تسجيل الدخول وإنشاء الحساب",
  description: "صفحات تسجيل الدخول وإنشاء الحساب في منصة شق الثعبان.",
  keywords: ["تسجيل الدخول", "إنشاء حساب", "شق الثعبان"],
  noIndex: true,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
