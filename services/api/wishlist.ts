import apiClient from './client';
import { UserStorage } from '../auth/login';

export interface WishItemResponse {
  _id: string;
  userId: string;
  productId: any;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  status: string;
  data: {
    count: number;
    wishItems: WishItemResponse[];
  };
  message?: string;
}

// Client-side cache for wishlist
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs: number = 2 * 60 * 1000) { // 2 minutes default for wishlist
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Get all cache keys for filtering
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean expired entries - public method
  public cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testWishlistAuth = () => {
    // Simple auth check without importing
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    const user = userData ? JSON.parse(userData) : null;

    //console.log('🔍 Auth Debug:', {
    //   user: user ? { id: user._id, email: user.email } : null,
    //   token: token ? token.substring(0, 50) + '...' : null,
    //   hasToken: !!token,
    //   hasUser: !!user
    // });
    return { user, token: token?.substring(0, 20) + '...' };
  };
}

// Global cache instance for wishlist
const wishlistCache = new ClientCache<WishlistResponse>();

// Cache key for wishlist
function getWishlistCacheKey(params?: Record<string, any>): string {
  const query = params ? new URLSearchParams(params).toString() : '';
  return `wishlist${query ? `?${query}` : ""}`;
}

// Authentication helper functions
function checkAuthentication(): { isAuthenticated: boolean; token: string | null; user: any } {
  const user = UserStorage.getUser();
  const token = UserStorage.getToken();

  const result = {
    isAuthenticated: user !== null && token !== null,
    token,
    user
  };

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔍 checkAuthentication result:', {
      isAuthenticated: result.isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      userId: user?._id,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
  }

  return result;
}

// Error for unauthenticated users
export class AuthenticationError extends Error {
  constructor(message: string = 'يرجى تسجيل الدخول أولاً') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const wishlistService = {
  async getAll(params?: Record<string, any>) {
    try {
      const auth = checkAuthentication();

      if (!auth.isAuthenticated) {
        console.warn('User not authenticated - returning empty wishlist');
        return {
          status: 'success',
          data: {
            count: 0,
            wishItems: []
          }
        };
      }

      // Client-side cache check first
      const cacheKey = getWishlistCacheKey(params);
      const cachedData = wishlistCache.get(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      try {
        const res = await apiClient.get('/wish-items', { params });
        
        // Validate response structure according to API documentation
        // API returns: { status: "success", results: 5, data: { wishItems: [...] } }
        const responseData = res.data?.data || {};
        const wishlistData = {
          status: 'success',
          data: {
            count: res.data?.results || responseData.wishItems?.length || 0,
            wishItems: Array.isArray(responseData.wishItems) ? responseData.wishItems : []
          }
        };

        // Store in client cache for future requests
        wishlistCache.set(cacheKey, wishlistData);

        return wishlistData;
        
      } catch (error: any) {
        // Check if this is a network error (no response from server)
        const isNetworkError = !error.response && (error.request || error.message);

        if (isNetworkError) {
          console.warn('Network error - unable to connect to server');
          // For network errors, return empty wishlist
          return {
            status: 'success',
            data: {
              count: 0,
              wishItems: []
            }
          };
        }

        // Handle 401 Unauthorized
        if (error?.response?.status === 401) {
          // Clear any invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
          console.warn('Authentication failed (401) - token may be invalid or expired');
          return {
            status: 'error',
            message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
            requiresAuth: true,
            statusCode: 401,
            data: {
              count: 0,
              wishItems: []
            }
          };
        }

        // If wishlist doesn't exist (404), return empty data
        if (error?.response?.status === 404) {
          return {
            status: 'success',
            data: {
              count: 0,
              wishItems: []
            }
          };
        }

        // Log other errors
        console.error('Error fetching wishlist:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error.message
        });

        // Return empty data for other errors
        return {
          status: 'success',
          data: {
            count: 0,
            wishItems: []
          }
        };
      }
    } catch (error: any) {
      // This catch block is for non-API errors
      console.error('Unexpected error in wishlist getAll:', error);
      // Return empty wishlist instead of crashing
      return {
        status: 'success',
        data: {
          count: 0,
          wishItems: []
        }
      };
    }
  },

  async add(productId: string) {
    try {
      const auth = checkAuthentication();
      
      // Debug logging to understand authentication state
      console.log('🔍 Wishlist add - Auth check:', {
        isAuthenticated: auth.isAuthenticated,
        hasToken: !!auth.token,
        hasUser: !!auth.user,
        userId: auth.user?._id
      });

      if (!auth.isAuthenticated) {
        console.warn('User not authenticated - cannot add to wishlist');
        return {
          status: 'error',
          message: 'يرجى تسجيل الدخول لإضافة منتج للمفضلة',
          requiresAuth: true
        };
      }

      try {
        const res = await apiClient.post('/wish-items', { productId });
        wishlistCache.clear();
        
        // Handle successful response
        if (res.data.status === 'success') {
          return {
            status: 'success',
            data: res.data.data?.wishItem,
            message: res.data.message || 'تمت إضافة المنتج إلى المفضلة بنجاح',
            wasAdded: true
          };
        }
        
        // Handle API error response
        return {
          status: 'error',
          message: res.data.message || 'حدث خطأ غير متوقع',
          data: res.data
        };
        
      } catch (error: any) {
        // Handle network errors or API errors
        const isNetworkError = !error.response && (error.request || error.message);
        
        if (isNetworkError) {
          console.warn('Network error - unable to connect to server');
          // Return a success response to maintain optimistic UI
          return { 
            status: 'success',
            message: 'تمت الإضافة إلى المفضلة (اتصال غير مستقر)',
            wasAdded: true // Assume success for network errors
          };
        }

        // Handle 409 Conflict (item already exists)
        if (error?.response?.status === 409) {
          // Clear cache to ensure we have the latest data
          wishlistCache.clear();
          
          return {
            status: 'success',
            message: 'المنتج موجود بالفعل في قائمة الأمنيات',
            data: error.response?.data,
            wasAlreadyAdded: true
          };
        }

        // Handle 401 Unauthorized
        if (error?.response?.status === 401) {
          // Clear any invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
          console.warn('Authentication failed (401) - token may be invalid or expired');
          return {
            status: 'error',
            message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
            requiresAuth: true,
            statusCode: 401
          };
        }

        // Handle 400 Bad Request
        if (error?.response?.status === 400) {
          return {
            status: 'error',
            message: 'بيانات غير صالحة. يرجى التحقق من معرف المنتج.',
            data: error.response?.data
          };
        }

        // Handle 404 Not Found
        if (error?.response?.status === 404) {
          return {
            status: 'error',
            message: 'المنتج غير موجود',
            data: error.response?.data
          };
        }

        // For other errors, log and return a generic error
        console.error('Error adding to wishlist:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error.message,
          config: error?.config
        });

        // Return a user-friendly error message
        return {
          status: 'error',
          message: 'حدث خطأ أثناء إضافة المنتج إلى المفضلة. يرجى المحاولة مرة أخرى لاحقاً.'
        };
      }
    } catch (error: any) {
      // This catch block is for non-API errors
      console.error('Unexpected error in wishlist add:', error);
      return {
        status: 'error',
        message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
        error: error?.message
      };
    }
  },

  async remove(productId: string) {
    try {
      const auth = checkAuthentication();

      if (!auth.isAuthenticated) {
        console.warn('User not authenticated - cannot remove from wishlist');
        return {
          status: 'error',
          message: 'يرجى تسجيل الدخول لحذف منتج من المفضلة',
          requiresAuth: true
        };
      }

      try {
        const res = await apiClient.delete(`/wish-items/${productId}`);
        wishlistCache.clear();
        
        // Handle successful response
        if (res.data.status === 'success') {
          return {
            status: 'success',
            message: res.data.message || 'تم حذف المنتج من المفضلة بنجاح',
            data: res.data.data
          };
        }
        
        // Handle API error response
        return {
          status: 'error',
          message: res.data.message || 'حدث خطأ غير متوقع',
          data: res.data
        };
        
      } catch (error: any) {
        // Handle network errors or API errors
        const isNetworkError = !error.response && (error.request || error.message);

        if (isNetworkError) {
          console.warn('Network error - unable to connect to server');
          // For network errors during removal, return success (optimistic update)
          return { 
            status: 'success', 
            message: 'تم حذف المنتج من المفضلة (اتصال غير مستقر)' 
          };
        }

        // Handle 404 Not Found (item doesn't exist or already removed)
        if (error?.response?.status === 404) {
          // Clear cache to ensure we don't have stale data
          wishlistCache.clear();
          
          // Check if the error message indicates the item is already removed
          const errorMessage = error?.response?.data?.message || '';
          if (errorMessage.includes('not found') || errorMessage.includes('غير موجود')) {
            return { 
              status: 'success', 
              message: 'المنتج غير موجود في المفضلة',
              wasAlreadyRemoved: true
            };
          }
          
          // For other 404 errors, still treat as success since the end result is the same
          return { 
            status: 'success', 
            message: 'تم حذف المنتج من المفضلة',
            wasAlreadyRemoved: true
          };
        }

        // Handle 400 Bad Request
        if (error?.response?.status === 400) {
          return {
            status: 'error',
            message: 'بيانات غير صالحة. يرجى المحاولة مرة أخرى.',
            data: error.response?.data
          };
        }

        // Handle 401 Unauthorized
        if (error?.response?.status === 401) {
          // Clear any invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
          console.warn('Authentication failed (401) - token may be invalid or expired');
          return {
            status: 'error',
            message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
            requiresAuth: true,
            statusCode: 401
          };
        }

        // For other errors, log and return a generic error
        console.error('Error removing from wishlist:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error.message
        });

        return {
          status: 'error',
          message: 'حدث خطأ أثناء إزالة المنتج من المفضلة. يرجى المحاولة مرة أخرى لاحقاً.'
        };
      }
    } catch (error: any) {
      // This catch block is for non-API errors
      console.error('Unexpected error in wishlist remove:', error);
      return {
        status: 'error',
        message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
        error: error?.message
      };
    }
  },

  // Convenience: add-if-missing, otherwise remove (idempotent toggle)
  async toggle(productId: string) {
    const auth = checkAuthentication();

    if (!auth.isAuthenticated) {
      console.warn('User not authenticated - cannot toggle wishlist');
      return {
        status: 'error',
        message: 'يرجى تسجيل الدخول لتعديل قائمة المفضلة',
        requiresAuth: true
      };
    }

    // Try to add first
    const added = await this.add(productId);
    
    // If item already exists (wasAlreadyAdded), remove it
    if (added?.wasAlreadyAdded) {
      const removed = await this.remove(productId);
      return { status: 'removed', data: removed?.data, message: removed?.message };
    }
    
    // If add was successful, return success
    if (added?.status === 'success') {
      return { status: 'added', data: added?.data, message: added?.message };
    }
    
    // If there was an error, return it
    return added;
  },

  // Method to clear wishlist cache
  clearCache() {
    wishlistCache.clear();
    //console.log('🧹 Wishlist cache cleared');
  },

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return checkAuthentication().isAuthenticated;
  },

  // Helper method to get current user
  getCurrentUser() {
    return UserStorage.getUser();
  },

  // Helper method to get auth token
  getAuthToken() {
    return UserStorage.getToken();
  }
};

export default wishlistService;

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugWishlistAPI = async () => {
    try {
      const { UserStorage } = await import('../auth/login');
      const user = UserStorage.getUser();
      const token = UserStorage.getToken();

      if (!user || !token) {
        //console.log('❌ Not authenticated');
        return { authenticated: false };
      }

      //console.log('🔍 Testing wishlist endpoints...');
      const axios = (await import('./client')).default;

      const results: any = {
        authenticated: true,
        user: user._id,
        token: token.substring(0, 20) + '...',
        endpoints: {}
      };

      // Test wish-items endpoints (based on documentation)
      try {
        //console.log('🔍 Testing GET /wish-items');
        const getRes = await axios.get('/wish-items');
        results.endpoints.wish_items_get = { status: getRes.status, data: getRes.data };
      } catch (err: any) {
        const isNetworkError = !err.response && (err.request || err.message);
        if (isNetworkError) {
          results.endpoints.wish_items_get = { error: 'Network Error', message: err.message };
        } else if (err?.response?.status !== 404) {
          results.endpoints.wish_items_get = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wish_items_get = { status: 404, message: 'Wishlist not found (expected for new users)' };
        }
      }

      try {
        //console.log('🔍 Testing POST /wish-items');
        const postRes = await axios.post('/wish-items', { productId: 'test-123' });
        results.endpoints.wish_items_add = { status: postRes.status, data: postRes.data };
      } catch (err: any) {
        const isNetworkError = !err.response && (err.request || err.message);
        if (isNetworkError) {
          results.endpoints.wish_items_add = { error: 'Network Error', message: err.message };
        } else if (err?.response?.status !== 409) {
          results.endpoints.wish_items_add = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wish_items_add = { status: 409, message: 'Conflict (expected for existing items)' };
        }
      }

      try {
        //console.log('🔍 Testing DELETE /wish-items/:productId');
        const deleteRes = await axios.delete('/wish-items/test-123');
        results.endpoints.wish_items_delete = { status: deleteRes.status, data: deleteRes.data };
      } catch (err: any) {
        const isNetworkError = !err.response && (err.request || err.message);
        if (isNetworkError) {
          results.endpoints.wish_items_delete = { error: 'Network Error', message: err.message };
        } else if (err?.response?.status !== 404) {
          results.endpoints.wish_items_delete = { error: err.response?.status, data: err.response?.data };
        } else {
          results.endpoints.wish_items_delete = { status: 404, message: 'Item not found (expected for invalid ID)' };
        }
      }

      //console.log('🔍 Debug results:', results);
      return results;
    } catch (err) {
      console.error('❌ Debug failed:', err);
      return { error: err };
    }
  };

  // Clear all caches and localStorage
  (window as any).resetFavorites = () => {
    // Clear localStorage
    localStorage.removeItem('shakeltaaban:favorites');

    // Clear API caches
    // import('./products').then(({ productService }) => productService.clearCache()).catch(() => {});
    import('./reviews').then(({ reviewService }) => reviewService.clearCache()).catch(() => {});
    import('./wishlist').then(({ wishlistService }) => wishlistService.clearCache()).catch(() => {});

    //console.log('🧹 All favorites data cleared. Please refresh the page.');
  };
}