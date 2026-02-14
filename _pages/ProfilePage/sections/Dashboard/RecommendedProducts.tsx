import React from 'react';
import Link from 'next/link';
import styles from '../../profile.module.css';
import type { ProductPreviewItem } from './types';

interface RecommendedProductsProps {
  items: ProductPreviewItem[];
  isLoading: boolean;
  onExplore?: () => void;
  errorMessage?: string | null;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  items,
  isLoading,
  onExplore,
  errorMessage,
}) => {
  return (
    <section className={styles.section_card}>
      <div className={styles.section_header}>
        <div>
          <h2 className={styles.section_title}>منتجات مقترحة لك</h2>
          <p className={styles.section_subtitle}>اقتراحات بناء على نشاطك</p>
        </div>
        <button
          className={`${styles.section_action} min-h-[44px] lg:min-h-[36px]`}
          onClick={onExplore}
        >
          اكتشف المزيد
        </button>
      </div>

      <div
        className={`${styles.product_grid} flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible lg:[grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]`}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.skeleton_card} min-w-[220px] flex-shrink-0 md:min-w-0`}
            ></div>
          ))
        ) : errorMessage ? (
          <div className={styles.empty_state}>{errorMessage}</div>
        ) : items.length === 0 ? (
          <div className={styles.empty_state}>لا توجد منتجات مقترحة حاليا</div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className={`${styles.product_card} min-w-[220px] flex-shrink-0 snap-start md:min-w-0 md:flex-shrink`}
            >
              <div className={styles.product_thumb}>{item.name.charAt(0)}</div>
              <div className={styles.product_info}>
                <div className={styles.product_name}>{item.name}</div>
                <div className={styles.product_meta}>
                  <span>{item.category}</span>
                  <span>{item.price}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default RecommendedProducts;
