import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 font-beiruti mt-[93px] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 blur-3xl" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8">
              <svg
                className="w-32 h-32 text-primary mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          المنتج غير موجود
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          عذراً، المنتج الذي تبحث عنه غير متوفر حالياً
        </p>
        <p className="text-base text-gray-500 mb-8">
          قد يكون تم حذفه أو نفد من المخزون
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 font-medium text-base"
          >
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            تصفح المنتجات
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200 font-medium text-base"
          >
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            العودة للرئيسية
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            هل تحتاج مساعدة؟{' '}
            <Link href="/inquiries" className="text-primary hover:underline font-medium">
              تواصل معنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
