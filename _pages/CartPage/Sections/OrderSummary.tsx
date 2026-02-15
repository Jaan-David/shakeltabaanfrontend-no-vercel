import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons/Button';

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
  unit: string;
  availability: string;
}

type Props = {
  itemCount: number;
  total: number;
  hasItems: boolean;
  order: Array<Item>;
  onCheckout?: () => void;
};

const OrderSummary: React.FC<Props> = ({ itemCount, total, hasItems, order, onCheckout }) => {
  const router = useRouter();
  
  if (!hasItems) return null;

  // Calculate total quantity of all items
  const totalItemQuantity = order.reduce((sum, item) => sum + item.quantity, 0);

  const calculatedTotal = order.reduce((sum, item) => {
    const itemTotal = item.totalPrice ?? item.price * item.quantity;
    return sum + itemTotal;
  }, 0);

  const finalTotal = total > 0 ? total : calculatedTotal;

  const handleCheckout = () => {
    const checkoutData = {
      totalItemQuantity,
      total: finalTotal,
      hasItems,
      order
    };
    //console.log('Checkout Data :from cart', checkoutData);
    
    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));
    if (onCheckout) {
      onCheckout();
    } else {
      router.push(`/checkout?data=${encodedData}`);
    }
  };

  return (
    <>
      <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:sticky lg:top-24">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 text-center">إجمالي الطلب للتاجر</h2>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-slate-900">
            <span className="text-slate-600">عدد المنتجات</span>
            <span className="font-medium">{totalItemQuantity}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600">الإجمالي</span>
            <span className="font-bold text-primary text-xl">{finalTotal.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="hidden sm:block">
          <Button
            onClick={handleCheckout}
            fullWidth
            size="lg"
            variant="primary"
            rounded
          >
            إرسال الطلب للتاجر
          </Button>
        </div>
      </div>

      {/* Mobile sticky CTA for thumb-friendly checkout */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3">
        <Button
          onClick={handleCheckout}
          fullWidth
          size="lg"
          variant="primary"
          rounded
        >
          إرسال الطلب للتاجر
        </Button>
      </div>
    </>
  );
};

export default React.memo(OrderSummary);