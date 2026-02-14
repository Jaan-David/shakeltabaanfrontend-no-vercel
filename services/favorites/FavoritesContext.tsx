"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { isAuthenticated } from '@/utils/auth';
import  AuthenticationError  from "@/services/Utils/alertHandler";
import { wishlistService } from '@/services/api/wishlist';
import { UserStorage } from '@/services/auth/login';

export type FavoriteItem = {
  id: number | string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  // Extended marble/granite product fields
  pricePerLinearMeter?: number;
  pricePerCubicMeter?: number;
  offerLinearPrice?: number | null;
  offerCubicPrice?: number | null;
  category?: string;
  color?: string;
  qualityGrade?: string;
  isOffer?: boolean;
  organizationName?: string;
  organizationId?: string;
  stockQty?: number;
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

const resolveProductId = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value._id || value.id || null;
  }
  return null;
};

const getFavoriteKey = (item: FavoriteItem): string => {
  return String(item.productId || item.id);
};

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

            const mapped: FavoriteItem[] = list
              .map((w: any) => {
                // According to API documentation, productId should be populated with product details
                const p = w.productId || {};
                
                // Extract actual product ID (the one API expects for DELETE)
                // If productId is an object (populated), use its _id or id
                // If productId is a string, use it directly
                const actualProductId = typeof w.productId === 'string' 
                  ? w.productId 
                  : (p._id || p.id);
                
                // Skip items without valid product ID (MongoDB ObjectIds are 24 chars)
                if (!actualProductId || actualProductId.length < 20) {
                  console.warn('⚠️ Skipping wishlist item with invalid/missing product ID:', {
                    wishlistItemId: w._id,
                    productIdType: typeof w.productId,
                    extractedProductId: actualProductId
                  });
                  return null;
                }
                
                // Skip items where product was not populated (deleted products)
                if (!p._id && !p.id && !p.name) {
                  console.warn('⚠️ Skipping wishlist item - product data missing (may be deleted):', {
                    wishlistItemId: w._id,
                    productId: actualProductId
                  });
                  return null;
                }

                const images = p.imageList || p.images || [];
                const img = Array.isArray(images) ? (images[0] || '/acessts/NoImage.jpg') : (images || '/acessts/NoImage.jpg');

                // Calculate price from marble/granite pricing (pricePerLinearMeter or pricePerCubicMeter)
                let calculatedPrice = 0;
                if (p.pricePerLinearMeter && Number(p.pricePerLinearMeter) > 0) {
                  calculatedPrice = Number(p.pricePerLinearMeter);
                } else if (p.pricePerCubicMeter && Number(p.pricePerCubicMeter) > 0) {
                  calculatedPrice = Number(p.pricePerCubicMeter);
                } else {
                  calculatedPrice = Number(p.price) || 0;
                }

                return {
                  id: actualProductId, // Use actual product ID
                  productId: actualProductId, // This is what API expects for DELETE
                  name: p.name || p.title || 'منتج',
                  price: calculatedPrice,
                  image: typeof img === 'string' ? img : (img?.url || '/acessts/NoImage.jpg'),
                  // Include marble/granite specific fields
                  pricePerLinearMeter: p.pricePerLinearMeter ? Number(p.pricePerLinearMeter) : undefined,
                  pricePerCubicMeter: p.pricePerCubicMeter ? Number(p.pricePerCubicMeter) : undefined,
                  offerLinearPrice: p.offerLinearPrice ? Number(p.offerLinearPrice) : null,
                  offerCubicPrice: p.offerCubicPrice ? Number(p.offerCubicPrice) : null,
                  category: p.category || undefined,
                  color: p.color || undefined,
                  qualityGrade: p.qualityGrade || undefined,
                  isOffer: p.isOffer || false,
                  organizationName: p.organizationName || undefined,
                  organizationId: p.organizationId || undefined,
                  stockQty: p.stockQty !== undefined ? Number(p.stockQty) : undefined,
                };
              })
              .filter((item): item is FavoriteItem => item !== null);
              
            setItems(mapped);
            console.log('✅ Mapped favorites:', mapped.length, 'valid items (filtered out invalid/deleted products)');
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
    const incomingKey = getFavoriteKey(item);
    const alreadyInFavorites = items.some(p => getFavoriteKey(p) === incomingKey);
    if (alreadyInFavorites) {
      return; // Already in favorites, no need to add again
    }

    // Optimistic update
    setItems(prev => [item, ...prev]);
    setError(null);

    // Sync with backend if authenticated
    if (wishlistService.isAuthenticated()) {
      try {
        const res = await wishlistService.add(String(item.productId || item.id));
        
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
          // Just keep the optimistic update - no need to refresh from server
          // This improves performance and reduces unnecessary API calls
          return;
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
    const normalizedId = String(id);
    
    // Store the item being removed for potential rollback
    const itemToRemove = items.find(item => (
      String(item.productId || item.id) === normalizedId
    ));
    
    // Optimistic update
    setItems(prev => prev.filter(p => (
      String(p.productId || p.id) !== normalizedId
    )));
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
      const res = await wishlistService.remove(normalizedId);
      
      // Check if response indicates error (but not already removed)
      if (res.status === 'error' && !res.wasAlreadyRemoved) {
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
      
      // On success, show brief feedback and keep optimistic update
      if (typeof window !== 'undefined' && itemToRemove) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <div style="
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 10px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            z-index: 9999;
            font-family: 'Beiruti', sans-serif;
            font-size: 14px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.2s ease;
          ">
            ✓ تم الحذف من المفضلة
          </div>
        `;
        document.body.appendChild(tempDiv);
        requestAnimationFrame(() => {
          const div = tempDiv.firstElementChild as HTMLElement;
          if (div) div.style.opacity = '1';
        });
        setTimeout(() => {
          const div = tempDiv.firstElementChild as HTMLElement;
          if (div) div.style.opacity = '0';
          setTimeout(() => tempDiv.remove(), 200);
        }, 1500);
      }
      
      // Optimistic update is enough - no need to refresh from server
      // Item already removed from UI above
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