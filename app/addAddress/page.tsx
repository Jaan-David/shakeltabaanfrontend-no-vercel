import NewAddressForm from "@/pages/ProfilePage/sections/AddAdress/AddAdress";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "إضافة عنوان جديد | توريد رخام للمشاريع",
  description:
    "اضف عنوانك لتسهيل توريد الرخام والجرانيت والكوارتز للمشاريع والمطابخ عبر منصة شق التعبان.",
  keywords: [
    "توريد رخام للمشاريع",
    "رخام جملة للمقاولين",
    "مورد رخام مصري للمشاريع الكبيرة",
    "رخام للمشاريع الكبيرة",
    "توريد رخام لمولات",
    "buy marble online egypt",
    "bulk marble supplier egypt",
    "marble factory egypt wholesale",
  ],
});
export default function AddAddressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <NewAddressForm />
    </div>
  );
}
