import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash } from 'lucide-react';
import { Button, IconButton } from '@/components/UI/Buttons/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActionEmptyState from '@/components/UI/EmptyStates/ActionEmptyState';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
  unit: string;
  availability: string;
  category?: string;
  productId?: string;
};

type Props = {
  items?: CartItem[]; 
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
};


const CartItemImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSource, setImageSource] = React.useState('');
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const normalizedSrc = src?.trim();

    if (!normalizedSrc) {
      setImageSource('/acessts/NoImage.jpg');
      return;
    }

    // If it's already a full URL or data URL, use it directly
    if (normalizedSrc.startsWith('http') || normalizedSrc.startsWith('blob:') || normalizedSrc.startsWith('data:')) {
      setImageSource(normalizedSrc);
      return;
    }

    if (normalizedSrc.startsWith('/')) {
      setImageSource(normalizedSrc);
      return;
    }

    // Handle local paths (remove any leading slashes)
    const cleanPath = normalizedSrc.replace(/^\/+/, '');
    
    // Check if it's a local path that should be served from the public folder
    if (cleanPath.startsWith('public/') || cleanPath.startsWith('uploads/')) {
      setImageSource(`/${cleanPath}`);
    } else {
      // For API paths, use the API base URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";
      setImageSource(baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Use absolute path for the fallback image
      setImageSource('/acessts/NoImage.jpg');
    }
  };

  // Show loading state while image is being processed
  if (!imageSource) {
    return (
      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
    );
  }

  return (
    <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center bg-[#F7F9FC] rounded-lg overflow-hidden border border-slate-200">
      <Image
        src={imageSource}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-contain p-1"
        width={64}
        height={64}
      />
    </div>
  );
};

const CartItemsList: React.FC<Props> = React.memo(({ 
  items = [], 
  onUpdateQuantity = () => {}, 
  onRemove = () => {} 
}) => {
  const router = useRouter();
  
  // Ensure items is always an array
  const cartItems = Array.isArray(items) ? items : [];
  
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // The conversion logic (multiply by 1000) is now handled inside cart.ts's updateCartItem
    // We only pass the display quantity here.
    onUpdateQuantity(id, newQuantity);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200">
        <div className="p-12 text-center">
          <ActionEmptyState
            imageSrc="/icons/empty-cart.png"
            imageAlt="السلة فارغة"
            message="لا يوجد منتجات فالسلة"
            actionLabel="اذهب للتسوق"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-sm border border-slate-200 bg-white/85 backdrop-blur-md">
      {/* Mobile-first list spacing to avoid cramped cards */}
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-[#F7F9FC] border border-slate-200 p-3 sm:p-4"
          >
            {/* Mobile stack → desktop row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex-shrink-0">
                  {item.productId ? (
                    <Link href={`/product/${item.productId}`} className="block">
                      <CartItemImage src={item.image} alt={item.name} />
                    </Link>
                  ) : (
                    <CartItemImage src={item.image} alt={item.name} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {item.productId ? (
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-base sm:text-lg font-semibold text-slate-900 truncate hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      {item.name}
                    </h3>
                  )}
                  <h4 className="mt-1 text-xs sm:text-sm font-medium text-slate-500 whitespace-nowrap">
                    {item.unit}
                  </h4>
                  {item.availability ? (
                    <h4 className="mt-1 text-xs sm:text-sm font-medium text-emerald-500 whitespace-nowrap">
                      {item.availability}
                    </h4>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    state="default"
                    leftIcon={<Trash className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => onRemove(item.id)}
                    className="mt-3 min-h-[44px] w-full sm:w-auto justify-center text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <span className="text-sm sm:text-base whitespace-nowrap">
                      حذف المنتج من السلة
                    </span>
                  </Button>
                </div>
              </div>

              {/* Price + quantity area with clear hierarchy */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 sm:ms-auto">
                <div className="text-right sm:text-left">
                  <div className="text-base sm:text-lg font-bold text-slate-900 whitespace-nowrap">
                    {(item.totalPrice || item.price * item.quantity).toLocaleString()} ج.م / {item.unit}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-1 whitespace-nowrap">
                    {item.price.toLocaleString()} ج.م / {item.unit}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2" dir="ltr">
                  <IconButton
                    aria-label="decrease quantity"
                    title="إنقاص الكمية"
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    icon={<Minus className="w-4 h-4" />}
                  />
                  <span className="min-w-[36px] text-center text-slate-900 font-medium">
                    {/* item.quantity is already the display quantity after reverse conversion in cart.ts */}
                    {Number(item.quantity.toFixed(3))}
                  </span>
                  <IconButton
                    aria-label="increase quantity"
                    title="زيادة الكمية"
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    icon={<Plus className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CartItemsList.displayName = 'CartItemsList';

export default React.memo(CartItemsList);