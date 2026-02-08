

// Import order service
import orderService, { OrderItem } from "@/services/profile/orders";

// import { generateSEO } from '@/config/seo.config';

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'تفاصيل الطلب',
    description: 'تفاصيل طلبات الرخام والجرانيت والكوارتز على منصة شق الثعبان.',
    keywords: ['تفاصيل الطلب', 'طلبات الرخام', 'شق الثعبان'],
    noIndex: true,
});

import OrdWrapper from "./ordWrapper";

export default function OrderDetailsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
            <OrdWrapper />
        </div>
    );
} 