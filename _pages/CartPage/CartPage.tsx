"use client";
import React, { useState, useEffect } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
// import type { CartItem } from './Sections/types';
import { cartService } from '@/services/api/cart';
import AlertHandler from '@/services/Utils/alertHandler';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import ordersOrgService from '@/services/api/ordersOrg';

type CartItem = {
  id: string;            // Cart item ID
  name: string;          // Name of the product
  price: number;         // Unit price
  quantity: number;      // Quantity in cart
  totalPrice: number;    // Total price for the item
  image: string;         // URL or path to the product image
  unit: string;          // Unit of measurement (e.g., 'قطعة')
  availability: string;  // Availability status (e.g., 'متوفر', 'غير متوفر')
  category?: string;     // Optional category of the product
  organizationId?: string;
  productId?: string;
};

type ApiProduct = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  category?: string;
  imageList?: string[];
  images?: Array<string | { url?: string }>;
  image?: string | Array<{ url?: string }>;
  thumbnail?: string;
  mainImage?: string;
  coverImage?: string;
  imageUrl?: string;
  pricePerLinearMeter?: number | null;
  pricePerCubicMeter?: number | null;
  stockQty?: number;
  quantity?: number;
  organizationId?: string;
  organization?: string;
};

type ApiCartItem = {
  _id?: string;
  cartId?: string;
  productId?: ApiProduct | string | null;
  itemQty?: number;
  unitPrice?: number;
  totalPrice?: number;
  unitType?: string;
  pricePerLinearMeter?: number | null;
  pricePerCubicMeter?: number | null;
  offerLinearPrice?: number | null;
  offerCubicPrice?: number | null;
};

type ApiCartResponse = {
  status?: string;
  data?: {
    cart?: {
      totalQty?: number;
      totalPrice?: number;
      items?: ApiCartItem[];
    };
  };
};

type OrgGroup = {
  organizationId: string;
  organizationName?: string;
  items: CartItem[];
};

const CartPage = () => {
  const [orgGroups, setOrgGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isAuthenticated()) {
          return;
        }
        const cartResponse = (await cartService.getCart()) as ApiCartResponse | undefined;
        const cart = cartResponse?.data?.cart;
        const items = cart?.items ?? [];

        setCartTotalPrice(cart?.totalPrice ?? 0);

        const mapped: CartItem[] = items.map((item) => {
          const product = typeof item.productId === 'object' && item.productId ? item.productId : null;
          const productId = product?._id || product?.id || (typeof item.productId === 'string' ? item.productId : '');

          const unitType = item.unitType || '';
          const unitMap: Record<string, string> = {
            unit: 'قطعة',
            kg: 'كيلو',
            ton: 'طن',
            liter: 'لتر',
            linear: 'متر طولي',
            cubic: 'متر مربع',
            square: 'متر مربع',
            linear_meter: 'متر طولي',
            cubic_meter: 'متر مربع',
            square_meter: 'متر مربع',
          };
          const selectedUnit = unitMap[unitType] || 'قطعة';

          let imageUrl = '/acessts/NoImage.jpg';
          const imageSources = product?.imageList || product?.images || product?.image || [];

          if (Array.isArray(imageSources) && imageSources.length > 0) {
            const firstImage = imageSources[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
              imageUrl = firstImage.url ?? imageUrl;
            }
          } else if (typeof imageSources === 'string') {
            imageUrl = imageSources;
          }

          if (!imageUrl || imageUrl === '/acessts/NoImage.jpg') {
            imageUrl = product?.thumbnail || product?.mainImage || product?.coverImage || product?.imageUrl || '/acessts/NoImage.jpg';
          }

          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
            const cleanPath = imageUrl.replace(/^\/+/, '');
            if (cleanPath.startsWith('public/') || cleanPath.startsWith('uploads/') || cleanPath.startsWith('acessts/')) {
              imageUrl = `/${cleanPath}`;
            } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
              imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
            } else {
              imageUrl = `/${cleanPath}`;
            }
          }

          const quantity = item.itemQty ?? 0;
          const unitPrice = item.unitPrice
            ?? item.pricePerLinearMeter
            ?? item.pricePerCubicMeter
            ?? product?.pricePerLinearMeter
            ?? product?.pricePerCubicMeter
            ?? 0;
          const totalPrice = item.totalPrice ?? unitPrice * quantity;
          const availability = '';

          return {
            id: String(item._id ?? ''),
            name: product?.name || product?.title || 'منتج',
            price: unitPrice,
            quantity,
            totalPrice,
            image: imageUrl,
            unit: selectedUnit,
            availability,
            category: product?.category,
            organizationId: product?.organizationId || product?.organization || '',
            productId,
          };
        });

        // Group items by organization
        const groupsMap = new Map<string, OrgGroup>();
        for (const item of mapped) {
          const orgId = item.organizationId || 'unknown';
          if (!groupsMap.has(orgId)) {
            groupsMap.set(orgId, { organizationId: orgId, organizationName: '', items: [] });
          }
          groupsMap.get(orgId)!.items.push(item);
        }

        for (const group of groupsMap.values()) {
          group.organizationName = group.organizationId;
        }

        setOrgGroups(Array.from(groupsMap.values()));
      } catch (error: any) {
        //console.error('Error fetching cart items:', error);
        if (error?.response?.status === 401) {
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await cartService.removeFromCart(id);
        setOrgGroups(groups => groups.map(g => ({...g, items: g.items.filter(i => i.id !== id)})).filter(g => g.items.length > 0));
        return;
      }
      await cartService.updateCartItem(id, newQuantity);
      setOrgGroups(groups => groups.map(g => ({
        ...g,
        items: g.items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
      })));
    } catch (e) {
      //console.error('Failed to update cart item quantity', e);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setOrgGroups(groups => groups.map(g => ({...g, items: g.items.filter(i => i.id !== id)})).filter(g => g.items.length > 0));
    } catch (e) {
      console.error('Failed to remove cart item', e);
    }
  };

  const cartItems = (orgGroups || []).flatMap(g => g.items || []);
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPrice = cartTotalPrice > 0 ? cartTotalPrice : subtotal;

  const handleMultiOrgCheckout = async () => {
    try {
      if (!isAuthenticated()) {
        AlertHandler.warning('يرجى تسجيل الدخول لإكمال الطلب', {
          buttons: [
            {
              label: 'تسجيل الدخول',
              onClick: () => router.push('/login'),
              variant: 'primary'
            }
          ]
        });
        return;
      }
      await ordersOrgService.createMultiOrgOrder();
      AlertHandler.success('تم إنشاء الطلب بنجاح');
      router.push('/profile?tab=orders');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || 'يرجى إضافة عنوان في حسابك ثم إعادة المحاولة';
      const normalizedMessage = String(errorMessage).toLowerCase();

      if (errorMessage.includes('Currently, we only accept orders from Egyptian customers')) {
        const extractedNumber = errorMessage.match(/\+?\d{8,}/)?.[0] || '201204246538';
        const whatsappUrl = `https://wa.me/${extractedNumber.replace(/^\+/, '')}`;
        AlertHandler.warning(errorMessage, {
          buttons: [
            {
              label: 'التواصل عبر واتساب',
              onClick: () => window.open(whatsappUrl, '_blank'),
              variant: 'primary'
            }
          ]
        });
        return;
      }

      if (normalizedMessage.includes('no default address')) {
        AlertHandler.error('لا يوجد عنوان افتراضي. يرجى إضافة عنوان أو تعيين عنوان افتراضي من الملف الشخصي.', {
          buttons: [
            {
              label: 'إضافة عنوان',
              onClick: () => router.push('/addAddress'),
              variant: 'primary'
            }
          ]
        });
        return;
      }

      if (errorMessage.includes('عنوان')) {
        AlertHandler.error(errorMessage, {
          buttons: [
            {
              label: 'إضافة عنوان',
              onClick: () => router.push('/addAddress'),
              variant: 'primary'
            }
          ]
        });
        return;
      }

      AlertHandler.error(errorMessage);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-beiruti flex items-center justify-center">
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-white font-beiruti">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-24 sm:pb-6">
        {/* Main Grid Layout */}
        <div className={`grid ${cartItems.length > 0 ? 'lg:grid-cols-12' : 'w-full'} gap-4 md:gap-6`}>
          {/* Cart Items Section */}
          <div className={`${cartItems.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'w-full'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
              <CartHeader itemCount={cartItems.length} />
              <div className="mt-4 space-y-6">
                {orgGroups.map(group => (
                  <div key={group.organizationId} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{group.organizationName || group.organizationId}</h3>
                      <span className="text-slate-500 text-sm">{group.items.length} منتج</span>
                    </div>
                    <CartItemsList 
                      items={group.items} 
                      onUpdateQuantity={updateQuantity} 
                      onRemove={removeItem} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Only shown when there are items */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-4">
                <OrderSummary 
                  order={cartItems} 
                  itemCount={cartItems.length} 
                  total={totalPrice} 
                  hasItems={cartItems.length > 0} 
                  onCheckout={handleMultiOrgCheckout}
                />
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        
      </div>
    </div>
  );
};

export default React.memo(CartPage);