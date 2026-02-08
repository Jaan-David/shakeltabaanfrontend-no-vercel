// import React from 'react';
import Profile from "@/pages/ProfilePage/ProfilePage";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "صفحة المستخدم",
  description: "إدارة حسابك وطلباتك وتقييماتك على منصة شق الثعبان للرخام والجرانيت والكوارتز.",
  keywords: ["حساب المستخدم", "طلبات الرخام", "تقييمات", "شق الثعبان"],
  noIndex: true,
});

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <Profile />
    </div>
  );
}
