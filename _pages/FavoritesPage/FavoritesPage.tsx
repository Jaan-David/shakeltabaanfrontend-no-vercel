"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { UserStorage } from '@/services/auth/login';
import { LogIn, Loader2 } from 'lucide-react';

// Dynamically import components with SSR disabled
const FavoritesList = dynamic(
  () => import('./Sections/FavoritesList').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري التحميل...</div> }
);

const ActionEmptyState = dynamic(
  () => import('@/components/UI/EmptyStates/ActionEmptyState').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري التحميل...</div> }
);

const RelatedProducts = dynamic(
  () => import('@/components/UI/RelatedProducts/RelatedProducts').then(mod => mod.default),
  { ssr: false, loading: () => <div>جاري تحميل المنتجات المتعلقة...</div> }
);

// Import the FavoritesProvider and useFavorites hook
import { FavoritesProvider, useFavorites } from '@/services/favorites/FavoritesContext';

// Define the FavoriteItem type
type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

// Main component that wraps everything with FavoritesProvider
const FavoritesPageWrapper: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  return (
    <FavoritesProvider>
      <FavoritesPageContent items={items} />
    </FavoritesProvider>
  );
};

// Inner component that uses the useFavorites hook
const FavoritesPageContent: React.FC<{ items?: FavoriteItem[] }> = ({ items }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { items: favItems, remove, loading, error } = useFavorites();
  
  // Initialize on client side
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    
    const user = UserStorage.getUser();
    const token = UserStorage.getToken();
    const isUserAuthenticated = user !== null && token !== null;
    
    console.log('🔍 FavoritesPage Auth Check:', {
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated: isUserAuthenticated
    });
    
    setIsAuthenticated(isUserAuthenticated);
  }, [router]);
  
  // Don't render anything during SSR or if not mounted yet
  if (typeof window === 'undefined' || !isMounted || !isClient) {
    return null;
  }

  // Show loading state with a more visible spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-beiruti flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-bold text-slate-900">جاري تحميل المفضلة...</p>
          <p className="text-sm text-slate-500 mt-2">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  // Show unauthenticated message if user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-beiruti">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-full mb-6 shadow-lg">
              <LogIn className="h-20 w-20 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">يرجى تسجيل الدخول</h1>
            <p className="text-slate-600 text-lg mb-8">
              لعرض المنتجات المفضلة والاستمتاع بمزايا التسوق، يرجى تسجيل الدخول أولاً
            </p>
            <button
              onClick={() => router.push('/login?redirect=/favorites')}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <LogIn className="w-6 h-6" />
              تسجيل الدخول الآن
            </button>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              أو تصفح المنتجات بدون تسجيل
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an authentication error
  if (error?.includes('تسجيل الدخول')) {
    return (
      <div className="min-h-screen bg-white font-beiruti">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <LogIn className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-red-800 mb-2">يرجى تسجيل الدخول</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login?redirect=/favorites')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Combine server and client items if needed
  const list = items ?? favItems;

  // Show empty state
  if (favItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-beiruti">
        <div className="max-w-[95%] mx-auto px-4 py-8">
          <header className="mb-8 pb-6 border-b-2 border-slate-200">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">المفضلة</h1>
              <span className="text-base font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full border-2 border-slate-200">
                0 منتج
              </span>
            </div>
          </header>
          <section className="flex flex-col items-center justify-center py-12 md:py-16">
            <ActionEmptyState
              imageSrc="/icons/empty-cart.png"
              imageAlt="لا يوجد منتجات في المفضلة"
              message="لا يوجد منتجات في المفضلة"
              actionLabel="تصفح المنتجات"
              actionHref="/products"
              imageClassName="w-64 h-auto mb-6"
            />
          </section>
          <section className="pt-8">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">منتجات قد تعجبك</h2>
              <p className="text-slate-600">ابدأ بإضافة منتجات إلى المفضلة من هنا</p>
            </div>
            <RelatedProducts />
          </section>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error && error.includes('تسجيل الدخول')) {
    return (
      <div className="min-h-screen bg-background font-beiruti">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <LogIn className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-red-800 mb-2">يرجى تسجيل الدخول</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login?redirect=/favorites')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for other errors
  if (error) {
    return (
      <div className="min-h-screen bg-white font-beiruti">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <h2 className="text-xl font-bold text-red-800 mb-2">حدث خطأ</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-beiruti">
      <div className="max-w-[95%] mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">المفضلة</h1>
            <span className="text-base md:text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border-2 border-blue-200">
              {favItems.length} منتج
            </span>
          </div>
          {favItems.length > 0 && (
            <button
              onClick={() => router.push('/products')}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              تصفح المزيد
            </button>
          )}
        </header>

        {/* Favorites List */}
        <FavoritesList items={favItems} onRemove={remove} />

        {/* Related products */}
        <section className="pt-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">منتجات قد تعجبك</h2>
            <p className="text-slate-600">اكتشف منتجات مميزة قد تكون مهتماً بها</p>
          </div>
          <RelatedProducts />
        </section>
      </div>
    </div>
  );
};

// Export the wrapper component
export default FavoritesPageWrapper;