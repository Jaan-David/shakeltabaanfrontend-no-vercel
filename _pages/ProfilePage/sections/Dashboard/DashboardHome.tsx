import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ClipboardList, Heart, MapPin, Pencil, Ruler } from 'lucide-react';

import styles from '../../profile.module.css';
import TopMetrics from '@/_pages/ProfilePage/sections/TopScetion/Top';
import Welcome from '@/components/UI/Profile/leftSection/Welcome/Welcome';

import type { CartItem, OrderItem, Product } from '@/services/profile/orders';
import { normalizeOrderStatus } from '@/services/profile/orders';
import { wishlistService, type WishItemResponse } from '@/services/api/wishlist';
import { productService } from '@/services/api/products';
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
  const [favoriteItems, setFavoriteItems] = useState<ProductPreviewItem[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<ProductPreviewItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

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
        description: 'فصل طلبك على مزاجك',
        icon: Ruler,
        onClick: () => router.push('/inquiries'),
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

  const formatPrice = (value?: number): string => {
    if (typeof value !== 'number') {
      return 'السعر غير متاح';
    }
    return `${value.toFixed(2)} ج`;
  };

  const mapProductToPreview = (product: Partial<Product>, fallbackId: string): ProductPreviewItem | null => {
    const productId = product._id || product.id || fallbackId;
    
    // Validate product ID - must be at least 20 characters (MongoDB ObjectId is 24 chars)
    if (!productId || productId.length < 20) {
      console.warn('⚠️ Invalid or missing product ID, skipping:', productId);
      return null;
    }

    const priceValue =
      product.offerLinearPrice ??
      product.offerCubicPrice ??
      product.pricePerLinearMeter ??
      product.pricePerCubicMeter ??
      product.price;

    return {
      id: productId,
      name: product.nameAr || product.name || 'منتج',
      price: formatPrice(typeof priceValue === 'number' ? priceValue : undefined),
      category: product.category || 'تصنيف غير محدد',
    };
  };

  const resolveProductId = (value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const record = value as { _id?: string; id?: string };
      return record._id || record.id || null;
    }
    return null;
  };

  const mapWishItem = (item: WishItemResponse): ProductPreviewItem | null => {
    // Extract product data - may be populated object or just an ID string
    const product = typeof item.productId === 'object' && item.productId
      ? (item.productId as Partial<Product>)
      : {};

    const fallbackId =
      resolveProductId(item.productId) ||
      resolveProductId(product) ||
      item._id;

    // Skip items without valid product ID (MongoDB ObjectIds are 24 chars)
    if (!fallbackId || fallbackId.length < 20) {
      console.warn('⚠️ Skipping wishlist item with invalid/missing product ID:', {
        fallbackId,
        productIdType: typeof item.productId,
        itemId: item._id
      });
      return null;
    }
    
    // Skip items where product was not populated (deleted products)
    if (!product._id && !product.id && !product.name) {
      console.warn('⚠️ Skipping wishlist item - product data missing (may be deleted):', fallbackId);
      return null;
    }

    return mapProductToPreview(product, fallbackId);
  };

  useEffect(() => {
    let isActive = true;

    const loadFavorites = async () => {
      setIsLoadingFavorites(true);
      setFavoritesError(null);

      try {
        const response = await wishlistService.getAll();
        const wishItems = response?.data?.wishItems ?? [];
        const mappedItems = wishItems
          .map(mapWishItem)
          .filter((item): item is ProductPreviewItem => item !== null)
          .slice(0, 6);

        if (isActive) {
          setFavoriteItems(mappedItems);
        }
      } catch (error) {
        if (isActive) {
          setFavoritesError('تعذر تحميل المفضلة حاليا');
          setFavoriteItems([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingFavorites(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadRecommendations = async () => {
      setIsLoadingRecommended(true);
      setRecommendedError(null);

      try {
        const response = await productService.getProducts({ page: 1, limit: 6 });
        const items = Array.isArray(response?.data) ? response.data : [];
        const mappedItems = items
          .map((item) => mapProductToPreview(item, item._id))
          .filter((item): item is ProductPreviewItem => item !== null);

        if (isActive) {
          setRecommendedItems(mappedItems);
        }
      } catch (error) {
        if (isActive) {
          setRecommendedError('تعذر تحميل المنتجات المقترحة حاليا');
          setRecommendedItems([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingRecommended(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className={`${styles.dashboard_stack} gap-10 md:gap-8 lg:gap-8`}>
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
        <div
          className={`${styles.quick_actions} grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4`}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                className={`${styles.quick_action_card} w-full min-w-0 items-center overflow-hidden`}
                onClick={action.onClick}
              >
                <div className={styles.quick_action_icon}>
                  <Icon />
                </div>
                <div className={`${styles.quick_action_text} min-w-0 flex-1 text-right`}>
                  <span className={`${styles.quick_action_title} break-normal whitespace-normal leading-snug`}>
                    {action.title}
                  </span>
                  <span className={`${styles.quick_action_subtitle} break-normal whitespace-normal leading-snug`}>
                    {action.description}
                  </span>
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
            className={`${styles.section_action} min-h-[44px] lg:min-h-[36px]`}
            onClick={() => onSelectSection?.('طلباتك')}
          >
            عرض الكل
          </button>
        </div>

        <div className={`${styles.orders_list} gap-4 md:gap-3`}>
          {isLoadingOrders
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={styles.skeleton_row}></div>
              ))
            : ordersError
            ? (
                <div className={styles.empty_state}>
                  <p>تعذر تحميل الطلبات حاليا</p>
                  <button
                    className={`${styles.section_action} min-h-[44px] lg:min-h-[36px]`}
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
                <div
                  key={order.id}
                  className={`${styles.order_card} w-full flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between`}
                >
                  <div className={`${styles.order_meta} w-full lg:w-auto`}>
                    <div className={styles.order_id}>طلب #{order.orderId}</div>
                    <div className={styles.order_date}>
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div
                    className={`${styles.order_info} w-full flex flex-col items-start gap-2 lg:w-auto lg:flex-row lg:items-center lg:gap-3`}
                  >
                    <span className={`${styles.status_badge} ${getStatusClass(order.status)}`}>
                      {normalizeOrderStatus(order.status)}
                    </span>
                    <span className={styles.order_total}>
                      {getOrderTotal(order).toFixed(2)} ج
                    </span>
                    <button
                      className={`${styles.order_action} w-full min-h-[44px] lg:w-auto lg:min-h-0`}
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
        isLoading={isSecondaryLoading || isLoadingFavorites}
        onViewAll={() => router.push('/favorites')}
        errorMessage={favoritesError}
      />

      <RecommendedProducts
        items={recommendedItems}
        isLoading={isSecondaryLoading || isLoadingRecommended}
        onExplore={() => router.push('/products')}
        errorMessage={recommendedError}
      />
    </div>
  );
};

export default DashboardHome;
