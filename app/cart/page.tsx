import { generateSEO } from '@/config/seo.config';
import CartWrapper from './cartWrapper';

export const metadata = generateSEO({
  title: 'سلة التسوق | شراء رخام في مصر',
  description:
    'اكمل طلب شراء الرخام والجرانيت والكوارتز للمطابخ والمشاريع عبر منصة شق التعبان.',
  keywords: [
    'شراء رخام في مصر',
    'رخام للبيع في القاهرة',
    'رخام شق التعبان للبيع',
    'جرانيت مطابخ للبيع',
    'شراء كوارتز للمطابخ',
    'buy marble online egypt',
    'granite suppliers egypt',
    'quartz countertop supplier egypt',
  ],
});

export default function Cart() {
  return (
    <main className="min-h-screen bg-white">
      <CartWrapper />
    </main>
  );
}