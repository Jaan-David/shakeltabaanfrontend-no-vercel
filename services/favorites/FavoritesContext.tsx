"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { isAuthenticated } from '@/utils/auth';
import  AuthenticationError  from "@/services/Utils/alertHandler";
import { wishlistService } from '@/services/api/wishlist';
import { UserStorage } from '@/services/auth/login';

export type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

type FavoritesContextValue = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: number | string) => void;
  toggle: (item: FavoriteItem) => void;
  isFavorite: (id: number | string | undefined) => boolean;
  clear: () => void;
  loading: boolean;
  error: string | null;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = "shakeltaaban:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated using UserStorage
        const user = UserStorage.getUser();
        const token = UserStorage.getToken();
        const isUserAuthenticated = user !== null && token !== null;

        if (isUserAuthenticated) {
          try {
            const res = await wishlistService.getAll();
            
            console.log('🔍 Wishlist response:', {
              status: res.status,
              hasError: res.status === 'error',
              itemCount: res.data?.wishItems?.length
            });

            // Check if response is an error
            if (res.status === 'error') {
              console.warn('Wishlist API returned error:', (res as any).message);
              setItems([]);
              if ((res as any).requiresAuth) {
                setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
              } else {
                setError((res as any).message || 'فشل في تحميل قائمة المفضلة');
              }
              setLoading(false);
              return;
            }

            const list = res?.data?.wishItems ?? [];
            console.log('🔍 Wishlist items count:', list.length);

            const mapped: FavoriteItem[] = list.map((w: any) => {
              // According to API documentation, productId should be populated with product details
              const p = w.productId || {};

              const images = p.imageList || p.images || [];
              const img = Array.isArray(images) ? (images[0] || '/acessts/NoImage.jpg') : (images || '/acessts/NoImage.jpg');

              return {
                id: String(p._id ?? w.productId?._id ?? w._id),
                name: p.name || p.title || 'منتج',
                price: Number(p.price) || 0,
                image: typeof img === 'string' ? img : (img?.url || '/acessts/NoImage.jpg'),
              };
            });
            setItems(mapped);
            console.log('✅ Mapped favorites:', mapped.length, 'items');
            return;
          } catch (e: any) {
            console.error('❌ Exception loading wishlist:', e);
            setError('حدث خطأ غير متوقع في تحميل المفضلة');
            setItems([]);
          }
        } else {
          // User not authenticated, try to load from localStorage as fallback
          try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
            if (raw) {
              const parsed = JSON.parse(raw) as FavoriteItem[];
              if (Array.isArray(parsed)) {
                setItems(parsed);
                console.log('✅ Wishlist loaded from localStorage:', parsed.length, 'items');
              }
            }
          } catch (e) {
            console.warn('Failed to load wishlist from localStorage:', e);
          }
        }
      } catch (error: any) {
        console.error('Error loading favorites:', error);
        setError('حدث خطأ في تحميل قائمة المفضلة');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  const add = useCallback(async (item: FavoriteItem) => {
    // Check if already in favorites to avoid duplicate API calls
    const alreadyInFavorites = items.some(p => p.id === item.id);
    if (alreadyInFavorites) {
      return; // Already in favorites, no need to add again
    }

    // Optimistic update
    setItems(prev => [item, ...prev]);
    setError(null);

    // Sync with backend if authenticated
    if (wishlistService.isAuthenticated()) {
      try {
        const res = await wishlistService.add(String(item.id));
        
        // Check if response indicates error (not authenticated, or other error)
        if (res.status === 'error') {
          // Revert optimistic update
          setItems(prev => prev.filter(p => p.id !== item.id));
          
          if (res.requiresAuth) {
            setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
          } else {
            setError(res.message || 'فشل في إضافة المنتج للمفضلة');
          }
          return;
        }
        
        // Success or already exists (treated as success)
        if (res.status === 'success' || res.wasAlreadyAdded) {
          // Refresh the list to ensure consistency
          const freshList = await wishlistService.getAll();
          const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
            id: String(w.productId?._id || w.productId || w._id),
            name: w.productId?.name || 'منتج',
            price: w.productId?.price || 0,
            image: Array.isArray(w.productId?.imageList) 
              ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
              : (w.productId?.imageList || '/acessts/NoImage.jpg')
          }));
          setItems(mapped);
        }
      } catch (e: any) {
        // Unexpected errors (should rarely happen now)
        console.error('Unexpected error adding to wishlist:', e);
        setItems(prev => prev.filter(p => p.id !== item.id)); // Revert optimistic update
        setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى');
      }
    } else {
      // User not authenticated, show error message and revert optimistic update
      setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
      setItems(prev => prev.filter(p => p.id !== item.id));
    }
  }, []);

  const remove = useCallback(async (id: number | string) => {
    // Store the item being removed for potential rollback
    const itemToRemove = items.find(item => item.id === id);
    
    // Optimistic update
    setItems(prev => prev.filter(p => p.id !== id));
    setError(null);

    if (!wishlistService.isAuthenticated()) {
      setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
      if (itemToRemove) {
        setItems(prev => [...prev, itemToRemove].sort((a, b) => 
          a.name.localeCompare(b.name)
        ));
      }
      return;
    }

    try {
      const res = await wishlistService.remove(String(id));
      
      // Check if response indicates error
      if (res.status === 'error') {
        // Re-add the item if it exists
        if (itemToRemove) {
          setItems(prev => [...prev, itemToRemove].sort((a, b) => 
            a.name.localeCompare(b.name)
          ));
        }
        
        if (res.requiresAuth) {
          setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
        } else {
          setError(res.message || 'فشل في حذف المنتج من المفضلة');
        }
        return;
      }
      
      // On success, refresh the list to ensure consistency
      const freshList = await wishlistService.getAll();
      const mapped = (freshList.data?.wishItems || []).map((w: any) => ({
        id: String(w.productId?._id || w.productId || w._id),
        name: w.productId?.name || 'منتج',
        price: w.productId?.price || 0,
        image: Array.isArray(w.productId?.imageList) 
          ? (w.productId.imageList[0] || '/acessts/NoImage.jpg')
          : (w.productId?.imageList || '/acessts/NoImage.jpg')
      }));
      setItems(mapped);
    } catch (e: any) {
      // Unexpected errors (should rarely happen now)
      console.error('Unexpected error removing from wishlist:', e);
      
      // Re-add the item if it exists
      if (itemToRemove) {
        setItems(prev => [...prev, itemToRemove].sort((a, b) => 
          a.name.localeCompare(b.name)
        ));
      }
      
      setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى');
    }
  }, [items]);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id);
      setError(null);

      // fire API side-effect without changing function type
      if (wishlistService.isAuthenticated()) {
        if (exists) {
          void wishlistService.remove(String(item.id)).then(res => {
            if (res.status === 'error') {
              // Don't revert UI since optimistic update is intentional
              if (res.requiresAuth) {
                setError('يرجى تسجيل الدخول لحذف منتج من المفضلة');
              } else if (res.statusCode !== 404) {
                // Don't show error for 404 (item not found)
                setError(res.message || 'فشل في حذف المنتج من المفضلة');
              }
            }
          }).catch(err => {
            console.error('Unexpected error removing wishlist item:', err);
            setError('حدث خطأ غير متوقع');
          });
        } else {
          void wishlistService.add(String(item.id)).then(res => {
            if (res.status === 'error' && !res.wasAlreadyAdded) {
              // Don't revert UI since optimistic update is intentional
              if (res.requiresAuth) {
                setError('يرجى تسجيل الدخول لإضافة منتج للمفضلة');
              } else if (res.statusCode !== 409) {
                // Don't show error for 409 (already exists)
                setError(res.message || 'فشل في إضافة المنتج للمفضلة');
              }
            }
          }).catch(err => {
            console.error('Unexpected error adding wishlist item:', err);
            setError('حدث خطأ غير متوقع');
          });
        }
      } else {
        // User not authenticated
        setError('يرجى تسجيل الدخول لتعديل قائمة المفضلة');
      }
      return exists ? prev.filter(p => p.id !== item.id) : [item, ...prev];
    });
  }, []);

  const isFavorite = useCallback((id: number | string | undefined) => {
    if (id === undefined) return false;
    return items.some(p => p.id === id);
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
    setError(null);
    wishlistService.clearCache();
    // Also clear from backend if authenticated
    if (wishlistService.isAuthenticated()) {
      // Note: We don't have a clear all method in wishlistService yet
      // This would be a future enhancement
    }
  }, []);

  const value = useMemo(() => ({
    items,
    add,
    remove,
    toggle,
    isFavorite,
    clear,
    loading,
    error
  }), [items, add, remove, toggle, isFavorite, clear, loading, error]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}