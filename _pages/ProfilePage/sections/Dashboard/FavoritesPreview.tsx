import React from 'react';
import styles from '../../profile.module.css';
import type { ProductPreviewItem } from './types';

interface FavoritesPreviewProps {
  items: ProductPreviewItem[];
  isLoading: boolean;
  onViewAll?: () => void;
  errorMessage?: string | null;
}

const FavoritesPreview: React.FC<FavoritesPreviewProps> = ({
  items,
  isLoading,
  onViewAll,
  errorMessage,
}) => {
  return (
    <section className={styles.section_card}>
      <div className={styles.section_header}>
        <div>
          <h2 className={styles.section_title}>المفضلة</h2>
          <p className={styles.section_subtitle}>منتجات قمت بحفظها</p>
        </div>
        <button
          className={`${styles.section_action} min-h-[44px] lg:min-h-[36px]`}
          onClick={onViewAll}
        >
          عرض الكل
        </button>
      </div>

      <div className={styles.product_grid}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeleton_card}></div>
          ))
        ) : errorMessage ? (
          <div className={styles.empty_state}>{errorMessage}</div>
        ) : items.length === 0 ? (
          <div className={styles.empty_state}>لا توجد عناصر في المفضلة حاليا</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.product_card}>
              <div className={styles.product_thumb}>{item.name.charAt(0)}</div>
              <div className={styles.product_info}>
                <div className={styles.product_name}>{item.name}</div>
                <div className={styles.product_meta}>
                  <span>{item.category}</span>
                  <span>{item.price}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default FavoritesPreview;
