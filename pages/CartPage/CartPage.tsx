"use client";
import React, { useState, useEffect } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
// import type { CartItem } from './Sections/types';
import { cartService, getClientCartItems } from '@/services/api/cart';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import ordersOrgService from '@/services/api/ordersOrg';

export  type CartItem = {
  id: string;            // Cart item ID
  name: string;          // Name of the product
  price: number;         // Price of the individual item
  quantity: number;      // Quantity in cart
  image: string;         // URL or path to the product image
  unit: string;          // Unit of measurement (e.g., 'قطعة')
  availability: string;  // Availability status (e.g., 'متوفر', 'غير متوفر')
  category?: string;     // Optional category of the product
  organizationId?: string;
  productId?: string;
};

type OrgGroup = {
  organizationId: string;
  organizationName?: string;
  items: CartItem[];
};

const CartPage = () => {
  const [orgGroups, setOrgGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isAuthenticated()) {
          return;
        }
        await cartService.getCart();
        const processedItems = await getClientCartItems();
        
        // Debug: Log raw cart data
        console.log('Raw cart items from API:', JSON.stringify(processedItems.slice(0, 2), null, 2));
        
        const mapped: CartItem[] = processedItems.map((it: any) => {
          const p = it.productId || {};
          const productId = (p && (p._id || p.id)) || it.productId || '';
          
          // Convert unit to display name
          const unitMap: Record<string, string> = {
            'unit': 'قطعة',
            'kg': 'كيلو',
            'ton': 'طن',
            'liter': 'لتر',
            'cubic_meter': 'متر مكعب'
          };
          const selectedUnit = unitMap[it.unit] || it.unit || 'قطعة';
          
          let imageUrl = '/acessts/NoImage.jpg';
          const imageSources = p.imageList || p.images || p.image || [];
          
          // Debug: Log image sources for first item
          if (it.quantity === processedItems[0]?.quantity) {
            console.log('Product data structure:', {
              name: p.name,
              hasImageList: !!p.imageList,
              imageListLength: Array.isArray(p.imageList) ? p.imageList.length : 0,
              imageListFirst: Array.isArray(p.imageList) ? p.imageList[0] : undefined,
              hasImages: !!p.images,
              hasImage: !!p.image,
              allFields: Object.keys(p).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('photo'))
            });
          }
          
          // Handle different image source formats
          if (Array.isArray(imageSources) && imageSources.length > 0) {
            const firstImage = imageSources[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            } else if (firstImage?.url) {
              imageUrl = firstImage.url;
            }
          } else if (typeof imageSources === 'string') {
            imageUrl = imageSources;
          }

          // If still no valid image, try other possible image fields
          if (!imageUrl || imageUrl === '/acessts/NoImage.jpg') {
            imageUrl = p.thumbnail || p.mainImage || p.coverImage || p.imageUrl || '/acessts/NoImage.jpg';
          }

          // Ensure the image URL is properly formatted
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
            // Remove any leading slashes to prevent double slashes
            const cleanPath = imageUrl.replace(/^\/+/, '');
            // Check if it's a local path that should be served from the public folder
            if (cleanPath.startsWith('public/') || cleanPath.startsWith('uploads/') || cleanPath.startsWith('acessts/')) {
              imageUrl = `/${cleanPath}`;
            } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
              // For API paths, use the API base URL
              imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
            } else {
              // Fallback to absolute path
              imageUrl = `/${cleanPath}`;
            }
          }

          const availability = (p.stockQty ?? p.quantity ?? 0) > 0 ? 'متوفر' : 'غير متوفر';

          return {
            id: String(it._id),
            name: p.name || p.title || 'منتج',
            price: it.price,
            quantity: it.quantity,
            image: imageUrl,
            unit: selectedUnit,
            availability,
            category: p.category,
            organizationId: p.organizationId || p.organization || '',
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

        // Fetch organization names from new endpoint (best-effort)
        try {
          const orgs = await ordersOrgService.listOrganizations();
          orgs.forEach((org: any) => {
            const key = org._id || org.organizationId;
            if (key && groupsMap.has(key)) {
              const g = groupsMap.get(key)!;
              g.organizationName = org.name || org.organizationName || 'منظمة';
            }
          });
        } catch (e) {
          console.warn('Failed to fetch organizations list, using defaults');
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
  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return sum + itemTotal;
  }, 0);

  const handleMultiOrgCheckout = async () => {
    try {
      // Validate payload before sending
      const payload = orgGroups
        .filter(g => g.items && g.items.length > 0)
        .map(g => ({
          organizationId: g.organizationId,
          items: g.items
            .filter(it => it.productId) // Filter out items without productId
            .map(it => ({ 
              productId: String(it.productId).trim(), 
              itemQty: it.quantity 
            }))
        }))
        .filter(g => g.items.length > 0); // Filter out groups with no valid items

      if (payload.length === 0) {
        console.error('No valid items to checkout');
        return;
      }

      console.log('Sending checkout payload:', JSON.stringify(payload, null, 2));
      
      await ordersOrgService.createMultiOrgOrder(payload);
      router.push('/checkout');
    } catch (e: any) {
      console.error('Failed to create multi-org order:', {
        message: e.message,
        status: e?.response?.status,
        data: e?.response?.data
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-white font-beiruti">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
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
                      <h3 className="text-lg font-semibold text-slate-900">{group.organizationName || 'منظمة'}</h3>
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
                  total={subtotal} 
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