import FavoritesPage from "./FavWrapper";
import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'المفضلات | افضل رخام للمطابخ في مصر',
  description:
    'احفظ منتجات الرخام والجرانيت والكوارتز المفضلة لديك لاختيار افضل خامة كونترتوب للمطبخ.',
  keywords: [
    'افضل رخام للمطابخ في مصر',
    'افضل جرانيت للمطبخ',
    'افضل كوارتز للمطبخ',
    'مقارنة الرخام والكوارتز',
    'افضل خامة كونترتوب مطبخ',
    'marble vs quartz kitchen',
    'quartz vs granite countertops',
  ],
});

export default function FavoritesRoutePage() {
  return <FavoritesPage />;
}