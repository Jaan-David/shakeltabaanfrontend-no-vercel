'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

//components
import OrderStepper from '@/components/UI/Profile/leftSection/Orders/OrderStepper';
import type { OrderStatus } from '@/components/UI/Profile/leftSection/Orders/OrderStepper';
import InfoCard from '@/components/UI/Profile/leftSection/Orders/InfoCard';

// Dynamic import to avoid circular dependencies
const PaymentRequestsSection = dynamic(
  () => import('@/components/UI/PaymentRequests/PaymentRequestsSection').then(mod => ({ default: mod.PaymentRequestsSection })),
  { loading: () => <div className="bg-white rounded-lg border border-gray-200 p-6 h-40 animate-pulse" /> }
);

// Import order service
import orderService, { CartItem, OrderItem, OrderStatusArabic } from '@/services/profile/orders';

// Status mapping from API to component
const mapOrderStatus = (apiStatus: OrderItem['status']): OrderStatus => {
  const statusMap: Record<OrderStatusArabic, OrderStatus> = {
    'تحت المراجعة': 'تحت المراجعة',
    'تم التواصل': 'تم التواصل',
    'تم الإلغاء': 'تم الإلغاء',
    'تم البيع': 'تم البيع',
  };
  return statusMap[apiStatus] || 'تحت المراجعة';
};

// Helper to safely get item price
const getItemPrice = (item: CartItem & { totalPrice?: number; unitPrice?: number }): number => {
  if (typeof item.totalPrice === 'number') return item.totalPrice;
  if (typeof item.unitPrice === 'number') return item.unitPrice * (item.itemQty ?? 1);
  const product = item.productId as unknown as { pricePerLinearMeter?: number };
  if (typeof product?.pricePerLinearMeter === 'number')
    return product.pricePerLinearMeter * (item.itemQty ?? 1);
  return 0;
};

export default function OrdWrapper() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderNumber as string;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('معرف الطلب غير موجود');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const allOrders = await orderService.getUserOrders(true); // Force refresh
        const foundOrder = allOrders.find(o => o._id === orderId || o.orderId === orderId);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          const orderDetails = await orderService.getOrderDetails(orderId, true); // Force refresh
          setOrder(orderDetails);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-20 px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-t-blue-600 rounded-full mb-3"></div>
          <p className="text-slate-700 text-md">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-20 px-4">
        <div className="flex flex-col items-center bg-white shadow-lg rounded-xl p-5">
          <p className="text-red-600 font-semibold mb-3">
            {error ? `⚠️ ${error}` : 'الطلب غير موجود'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm"
          >
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fullAddress = `${order.address.address}, ${order.address.city}, ${order.address.region}`;
  const fullName = `${order.address.firstName} ${order.address.lastName}`;
  const cartTotal = order.cartId?.items?.reduce((sum, item) => sum + getItemPrice(item), 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          تفاصيل الطلب {order.orderId}
        </h1>

        <OrderStepper currentStatus={mapOrderStatus(order.status)} />

        {/* Order Info */}
        <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-200">
          <InfoCard
            orderNumber={order.orderId}
            orderPrice={`${order.deliveryPrice + cartTotal} ج`}
            orderDate={formatDate(order.createdAt)}
            address={fullAddress}
            phone={order.address.phoneNumber}
            name={fullName}
          />
        </div>

        {/* Items */}
        <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-200">
          <h2 className="text-md font-semibold text-slate-900 mb-3">المنتجات الخاصة بطلبك</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {order.cartId?.items?.length > 0 ? (
              order.cartId.items
                .filter(item => item?.productId)
                .map(item => (
                  <div
                    key={item._id}
                    className="flex flex-col items-center bg-slate-100 rounded-lg p-3 shadow hover:shadow-md transition"
                  >
                    <Image
                      src={item.productId.imageList?.[0] ?? '/acessts/NoImage.jpg'}
                      alt={item.productId?.name ?? 'منتج'}
                      width={240}
                      height={160}
                      sizes="(max-width: 768px) 100vw, 240px"
                      className="w-full h-32 object-contain mb-2 rounded-md"
                      unoptimized
                    />
                    <h3 className="text-sm font-semibold text-slate-900 text-center">
                      {item.productId?.name ?? 'منتج غير متوفر'}
                    </h3>
                    <p className="text-blue-600 font-semibold mt-1 text-sm">{getItemPrice(item)} ج.م</p>
                    <button
                      onClick={() => router.push(`/product/${item.productId?._id}`)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm w-full"
                    >
                      قم بالشراء مرة أخرى
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-center col-span-full text-sm">لا توجد منتجات في هذا الطلب</p>
            )}
          </div>
        </div>

        {/* Payment Requests */}
        <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-200">
          <PaymentRequestsSection
            orderId={orderId}
            orderTotal={order.deliveryPrice + cartTotal}
          />
        </div>
      </div>
    </div>
  );
}