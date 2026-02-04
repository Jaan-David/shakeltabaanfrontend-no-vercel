import NewAddressForm from "@/pages/ProfilePage/sections/AddAdress/AddAdress";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "إضافة عنوان جديد ",
  description: "منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت",
  keywords: ["كيماويات", "تجارة"],
});
export default function AddAddressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <NewAddressForm />
    </div>
  );
}
