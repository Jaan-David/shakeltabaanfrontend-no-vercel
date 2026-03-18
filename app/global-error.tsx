"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900">
        <main className="min-h-screen flex items-center justify-center px-4">
          <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">تعذر عرض التطبيق</h1>
            <p className="mt-2 text-sm text-slate-600">
              حدث خطأ عام في التطبيق. يمكنك إعادة المحاولة الآن.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              إعادة تشغيل الصفحة
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
