import Checkout from "./checkoutWarpper";

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة الدفع',
  description: 'إتمام طلبات الرخام والجرانيت والكوارتز عبر منصة شق الثعبان.',
  keywords: ['الدفع', 'طلبات الرخام', 'شق الثعبان'],
  noIndex: true,
});

export default function CheckoutPage() {
  return <Checkout/>;
}