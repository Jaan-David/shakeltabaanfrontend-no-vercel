import React, { useState, useEffect } from 'react';
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
      <img
        src={imageSource}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-contain p-1"
        loading="lazy"
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
      <div className="divide-y divide-slate-200 pt-[5px] max-h-[60vh] md:max-h-[70vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cartItems.map((item) => (
          <div 
            key={item.id} 
            className="pt-[3px] sm:p-3 mt-[15px] mb-[15px] rounded-[12px] mx-[10px] bg-[#F7F9FC] border-[1px] border-slate-200"
          >
            
            <div className="flex sm:flex-row gap-4">
              <div className="flex-shrink-0 m-auto">
                {item.productId ? (
                  <Link href={`/product/${item.productId}`} className="block">
                    <CartItemImage src={item.image} alt={item.name} />
                  </Link>
                ) : (
                  <CartItemImage src={item.image} alt={item.name} />
                )}
              </div>

              <div className="flex-1 flex justify-between min-w-0">
                <div className="flex flex-col justify-between items-start w-[35%] mb-2">
                  {item.productId ? (
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-lg font-semibold text-slate-900 truncate hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {item.name}
                    </h3>
                  )}
                  <h4 className="text-[14px] font-medium text-right leading-tight text-slate-500 font-beiruti mb-2 whitespace-nowrap">
                    {item.unit}
                  </h4>
                  {item.availability ? (
                    <h4 className="text-[14px] font-medium leading-[1] text-right w-[71px] h-[17px] text-emerald-500 font-beiruti mb-2">
                      {item.availability}
                    </h4>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    state="default"
                    leftIcon={<Trash className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:bg-red-500/10 hover:text-red-600 w-full sm:w-auto justify-start sm:justify-center p-1 sm:px-2 mt-2"
                  >
                    <span className="text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                      حذف المنتج من السلة
                    </span>
                  </Button>
                </div>
{/* /************************************************************/}
                <div className="flex flex-col items-start  w-[35%] sm:flex-col sm:items-center pr-[10px] sm:pr-3 justify-between gap-4">
                  <div className="text-left w-[100%] pl-2 sm:pl-3 ">
                    <div className="text-l font-bold text-slate-900 whitespace-nowrap">
                      {(item.totalPrice || item.price * item.quantity).toLocaleString()} ج.م / {item.unit}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 whitespace-nowrap">
                      {item.price.toLocaleString()} ج.م / {item.unit}
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-end  pr-2 sm:pr-4">
                    <div className="flex items-center justify-end gap-3" dir="ltr">
                      <IconButton
                        aria-label="decrease quantity"
                        title="إنقاص الكمية"
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        icon={<Minus className="w-4 h-4" />}
                      />
                      <span className="w-8 text-center text-slate-900 font-medium">
                        {/* item.quantity is already the display quantity after reverse conversion in cart.ts */}
                        {Number(item.quantity.toFixed(3))} 
                      </span>
                      <IconButton
                        aria-label="increase quantity"
                        title="زيادة الكمية"
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        icon={<Plus className="w-4 h-4" />}
                      />
                      {/* <span className="text-gray-500 text-sm mr-2">{item.unit}</span> */}
                    </div>
                  </div>
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