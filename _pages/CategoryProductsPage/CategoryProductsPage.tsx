"use client";
import { useState, useEffect } from 'react';
import { fetchAllProducts, Product } from '@/services/product/products';
import ProductSlider from '@/components/UI/Product/ProductSlider';
import styles from './CategoryProductsPage.module.css';

interface CategoryProductsPageProps {
  categoryId: string;
  categoryName: string;
}

export default function CategoryProductsPage({ categoryId, categoryName }: CategoryProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchAllProducts({
          category: categoryName,
          limit: 50
        });

        setProducts(response.data);
      } catch (err: any) {
        setError(err.message || 'فشل في تحميل المنتجات');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryName]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{categoryName}</h1>
        </div>
        <div className={styles.loading}>
          <div className={styles.loader}></div>
          <p>جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{categoryName}</h1>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{categoryName}</h1>
        <p className={styles.subtitle}>
          {products.length} منتج متاح
        </p>
      </div>

      {products.length > 0 ? (
        <div className={styles.productsSection}>
          <ProductSlider
            products={products}
            isLoading={false}
            error={null}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>لا توجد منتجات</h3>
          <p>لا توجد منتجات متاحة في هذه الفئة حالياً</p>
        </div>
      )}
    </div>
  );
}