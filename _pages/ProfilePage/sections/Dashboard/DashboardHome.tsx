import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ClipboardList, Heart, MapPin, Pencil, Ruler } from 'lucide-react';

import styles from '../../profile.module.css';
import TopMetrics from '@/_pages/ProfilePage/sections/TopScetion/Top';
import Welcome from '@/components/UI/Profile/leftSection/Welcome/Welcome';

import type { CartItem, OrderItem, Product } from '@/services/profile/orders';
import { normalizeOrderStatus } from '@/services/profile/orders';
import type { ProductPreviewItem } from './types';

const FavoritesPreview = dynamic(() => import('./FavoritesPreview'), {
  loading: () => (
    <section className={styles.section_card}>
      <div className={styles.section_header}>
        <div>
          <h2 className={styles.section_title}>المفضلة</h2>
          <p className={styles.section_subtitle}>منتجات قمت بحفظها</p>
        </div>
      </div>
      <div className={styles.product_grid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.skeleton_card}></div>
        ))}
      </div>
    </section>
  ),
  ssr: false,
});

const RecommendedProducts = dynamic(() => import('./RecommendedProducts'), {
  loading: () => (
    <section className={styles.section_card}>
      <div className={styles.section_header}>
        <div>
          <h2 className={styles.section_title}>منتجات مقترحة لك</h2>
          <p className={styles.section_subtitle}>اقتراحات بناء على نشاطك</p>
        </div>
      </div>
      <div className={styles.product_grid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.skeleton_card}></div>
        ))}
      </div>
    </section>
  ),
  ssr: false,
});

interface Metric {
  icon: React.ReactNode;
  number: number;
  title: string;
  className?: string;
  onClick?: () => void;
}

interface DashboardHomeProps {
  name: string;
  metrics: Metric[];
  onSelectSection?: (value: string) => void;
  orders: OrderItem[];
  isLoadingOrders: boolean;
  ordersError?: string | null;
}

const getItemTotal = (item: CartItem): number => {
  const pricedItem = item as CartItem & {
    totalPrice?: number;
    unitPrice?: number;
    productId?: Product & { pricePerLinearMeter?: number; price?: number };
  };

  if (typeof pricedItem.totalPrice === 'number') return pricedItem.totalPrice;
  if (typeof pricedItem.unitPrice === 'number') {
    return pricedItem.unitPrice * (item.itemQty ?? 1);
  }

  const pricePerLinearMeter = pricedItem.productId?.pricePerLinearMeter;
  if (typeof pricePerLinearMeter === 'number') {
    return pricePerLinearMeter * (item.itemQty ?? 1);
  }

  if (typeof pricedItem.productId?.price === 'number') {
    return pricedItem.productId.price * (item.itemQty ?? 1);
  }

  return 0;
};

const getOrderTotal = (order: OrderItem): number => {
  const deliveryPrice = typeof order.deliveryPrice === 'number' ? order.deliveryPrice : 0;
  const paymentTotal = order.paymentDetails?.totalPrice;

  if (typeof paymentTotal === 'number' && paymentTotal > 0) {
    return paymentTotal + deliveryPrice;
  }

  const itemsTotal = order.cartId?.items?.reduce((sum, item) => sum + getItemTotal(item), 0) ?? 0;
  return itemsTotal + deliveryPrice;
};

const getStatusClass = (status: string): string => {
  switch (normalizeOrderStatus(status)) {
    case 'تم البيع':
      return styles.status_completed;
    case 'تحت المراجعة':
      return styles.status_processing;
    case 'تم التواصل':
      return styles.status_reviewed;
    case 'تم الإلغاء':
      return styles.status_cancelled;
    default:
      return styles.status_processing;
  }
};

const DashboardHome: React.FC<DashboardHomeProps> = ({
  name,
  metrics,
  onSelectSection,
  orders,
  isLoadingOrders,
  ordersError,
}) => {
  const router = useRouter();

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const isSecondaryLoading = isLoadingOrders && orders.length === 0;

  const quickActions = useMemo(
    () => [
      {
        title: 'تعديل الملف الشخصي',
        description: 'بيانات الحساب الاساسية',
        icon: Pencil,
        onClick: () => onSelectSection?.('تفاصيل الحساب'),
      },
      {
        title: 'طلباتي',
        description: 'متابعة حالة الطلب',
        icon: ClipboardList,
        onClick: () => onSelectSection?.('طلباتك'),
      },
      {
        title: 'المفضلة',
        description: 'المنتجات المحفوظة',
        icon: Heart,
        onClick: () => router.push('/favorites'),
      },
      {
        title: 'طلبات خاصة',
        description: 'تفاصيل الطلب المخصص',
        icon: Ruler,
        onClick: () => router.push('/order'),
      },
      {
        title: 'العناوين',
        description: 'ادارة العناوين',
        icon: MapPin,
        onClick: () => onSelectSection?.('عناوينك'),
      },
    ],
    [onSelectSection, router]
  );

  const favoriteItems: ProductPreviewItem[] = [
    { id: 'fav-1', name: 'رخام كارارا', price: '1200 ج', category: 'رخام' },
    { id: 'fav-2', name: 'جرانيت اسود', price: '980 ج', category: 'جرانيت' },
    { id: 'fav-3', name: 'رخام بيج', price: '760 ج', category: 'رخام' },
    { id: 'fav-4', name: 'حجر طبيعي', price: '640 ج', category: 'حجر' },
    { id: 'fav-5', name: 'رخام رمادي', price: '890 ج', category: 'رخام' },
  ];

  const recommendedItems: ProductPreviewItem[] = [
    { id: 'rec-1', name: 'جرانيت احمر', price: '1100 ج', category: 'جرانيت' },
    { id: 'rec-2', name: 'رخام ابيض', price: '1350 ج', category: 'رخام' },
    { id: 'rec-3', name: 'حجر ديكوري', price: '520 ج', category: 'حجر' },
    { id: 'rec-4', name: 'رخام ازرق', price: '980 ج', category: 'رخام' },
  ];

  return (
    <div className={styles.dashboard_stack}>
      <section className={styles.banner_section}>
        <Welcome name={name} />
      </section>

      <section className={styles.stats_section}>
        <TopMetrics metrics={metrics} className={styles.metric_card} />
      </section>

      <section className={styles.section_card}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>اجراءات سريعة</h2>
            <p className={styles.section_subtitle}>اختصر الوصول لاقسامك المهمة</p>
          </div>
        </div>
        <div className={styles.quick_actions}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                className={styles.quick_action_card}
                onClick={action.onClick}
              >
                <div className={styles.quick_action_icon}>
                  <Icon />
                </div>
                <div className={styles.quick_action_text}>
                  <span className={styles.quick_action_title}>{action.title}</span>
                  <span className={styles.quick_action_subtitle}>{action.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section_card}>
        <div className={styles.section_header}>
          <div>
            <h2 className={styles.section_title}>احدث الطلبات</h2>
            <p className={styles.section_subtitle}>اخر عمليات الشراء الخاصة بك</p>
          </div>
          <button
            className={styles.section_action}
            onClick={() => onSelectSection?.('طلباتك')}
          >
            عرض الكل
          </button>
        </div>

        <div className={styles.orders_list}>
          {isLoadingOrders
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={styles.skeleton_row}></div>
              ))
            : ordersError
            ? (
                <div className={styles.empty_state}>
                  <p>تعذر تحميل الطلبات حاليا</p>
                  <button
                    className={styles.section_action}
                    onClick={() => onSelectSection?.('طلباتك')}
                  >
                    اعادة المحاولة
                  </button>
                </div>
              )
            : recentOrders.length === 0
            ? (
                <div className={styles.empty_state}>
                  <p>لا توجد طلبات حديثة حتى الان</p>
                </div>
              )
            : recentOrders.map((order) => (
                <div key={order.id} className={styles.order_card}>
                  <div className={styles.order_meta}>
                    <div className={styles.order_id}>طلب #{order.orderId}</div>
                    <div className={styles.order_date}>
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div className={styles.order_info}>
                    <span className={`${styles.status_badge} ${getStatusClass(order.status)}`}>
                      {normalizeOrderStatus(order.status)}
                    </span>
                    <span className={styles.order_total}>
                      {getOrderTotal(order).toFixed(2)} ج
                    </span>
                    <button
                      className={styles.order_action}
                      onClick={() => router.push(`/order/${order.orderId}`)}
                    >
                      عرض سريع
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <FavoritesPreview
        items={favoriteItems}
        isLoading={isSecondaryLoading}
        onViewAll={() => router.push('/favorites')}
      />

      <RecommendedProducts
        items={recommendedItems}
        isLoading={isSecondaryLoading}
        onExplore={() => router.push('/products')}
      />
    </div>
  );
};

export default DashboardHome;
