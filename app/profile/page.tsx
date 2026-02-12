// import React from 'react';
import Profile from "@/_pages/ProfilePage/ProfilePage";

import { generateSEO } from "@/config/seo.config";

export const dynamic = "force-dynamic";

export const metadata = generateSEO({
  title: "صفحة المستخدم",
  description: "منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت",
  keywords: ["كيماويات", "تجارة"],
});

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <Profile />
    </div>
  );
}
