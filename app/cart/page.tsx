import { generateSEO } from '@/config/seo.config';
import CartWrapper from './cartWrapper';

export const metadata = generateSEO({
  title: 'سلة التسوق',
  description: 'منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت',
  keywords: ['كيماويات', 'تجارة'],
});

export default function Cart() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <CartWrapper />
    </main>
  );
}