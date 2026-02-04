import Checkout from "./checkoutWarpper";

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة الدفع',
  description: 'منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت',
  keywords: ['كيماويات', 'تجارة'],
});

export default function CheckoutPage() {
  return <Checkout/>;
}