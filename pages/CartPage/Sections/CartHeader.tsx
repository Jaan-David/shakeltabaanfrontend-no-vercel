import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Props = {
  itemCount: number;
};

const CartHeader: React.FC<Props> = ({ itemCount }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200 pt-[93px] md:pt-[93px] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            سلة التسوق
          </h1>
          {itemCount > 0 && (
            <div className="text-sm text-slate-600">
              {itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartHeader);