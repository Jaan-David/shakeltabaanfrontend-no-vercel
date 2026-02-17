import { Metadata } from "next";

export const metadata: Metadata = {
  title: "استخدامات الرخام | شق التعبان",
  description: "اكتشف استخدامات الرخام المختلفة من الأرضيات إلى المطابخ والحمامات والسلالم والمواد الحديثة",
  keywords: [
    "استخدامات الرخام",
    "أرضيات رخام",
    "رخام المطابخ",
    "رخام الحمامات",
    "سلالم رخام",
    "خامات مطابخ حديثة",
  ],
};

export default function MarbleUsesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
