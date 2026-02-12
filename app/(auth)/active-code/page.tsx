import Background from '@/components/UI/Background/Background';
import ActiveCodePage from '@/_pages/AuthPages/ActiveCodePage/ActiveCode';
import { Suspense } from 'react';

export default function Page() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
      <Background />
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }>
        <ActiveCodePage />
      </Suspense>
    </div>
  );
}