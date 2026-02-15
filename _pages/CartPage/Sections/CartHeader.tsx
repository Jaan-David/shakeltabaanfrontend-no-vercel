import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Props = {
  itemCount: number;
};

const CartHeader: React.FC<Props> = ({ itemCount }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            إرسال الطلب للتاجر
          </h1>
          {itemCount > 0 && (
            <div className="text-xs sm:text-sm text-slate-600">
              {itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartHeader);