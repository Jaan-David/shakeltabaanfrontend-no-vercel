import FavoritesPage from "./FavWrapper";
import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة المفضلات',
  description: 'قائمة المفضلات للرخام والجرانيت والكوارتز على منصة شق الثعبان.',
  keywords: ['المفضلات', 'رخام', 'جرانيت', 'شق الثعبان'],
  noIndex: true,
});

export default function FavoritesRoutePage() {
  return <FavoritesPage />;
}