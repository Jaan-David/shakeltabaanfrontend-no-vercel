"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" role="alert">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-700">حدث خطأ غير متوقع</h2>
        <p className="mt-2 text-sm text-slate-600">
          واجهنا مشكلة أثناء تحميل الصفحة. حاول مرة أخرى.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
