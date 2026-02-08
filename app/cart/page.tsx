import { generateSEO } from '@/config/seo.config';
import CartWrapper from './cartWrapper';

export const metadata = generateSEO({
  title: 'سلة التسوق',
  description: 'سلة مشتريات الرخام والجرانيت والكوارتز على منصة شق الثعبان.',
  keywords: ['سلة التسوق', 'طلبات الرخام', 'شق الثعبان'],
  noIndex: true,
});

export default function Cart() {
  return (
    <main className="min-h-screen bg-white">
      <CartWrapper />
    </main>
  );
}