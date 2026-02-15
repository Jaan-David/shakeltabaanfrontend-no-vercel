

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
    title: 'تفاصيل الطلب | شراء رخام في مصر',
    description:
        'راجع تفاصيل طلب الرخام والجرانيت والكوارتز مع منصة شق التعبان وسوق الرخام المصري.',
    keywords: [
        'شراء رخام في مصر',
        'رخام للبيع في القاهرة',
        'رخام شق التعبان للبيع',
        'جرانيت مطابخ للبيع',
        'شراء كوارتز للمطابخ',
        'سوق الرخام المصري',
        'stone marketplace egypt',
        'marble trading platform',
    ],
});

import OrdWrapper from "./ordWrapper";

export default function OrderDetailsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
            <OrdWrapper />
        </div>
    );
} 