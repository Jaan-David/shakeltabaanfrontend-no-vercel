import FavoritesPage from "./FavWrapper";
import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة المفضلات',
  description: 'منصة شق الثعبان متخصصة في جميع أنواع الرخام والجرانيت',
  keywords: ['كيماويات', 'تجارة'],
});

export default function FavoritesRoutePage() {
  return <FavoritesPage />;
}