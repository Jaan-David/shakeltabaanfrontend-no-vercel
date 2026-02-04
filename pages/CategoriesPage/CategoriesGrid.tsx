"use client";
import React from "react";
import styles from './CategoriesGrid.module.css';



export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

interface CategoriesGridProps {
  categories: Category[];
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

const categoryImages: Record<string, string> = {
  "جرانيت مستورد": "/categories/1.jpg",
  "جرانيت مصري": "/categories/2.jpg",
  "رخام مستورد": "/categories/3.jpg",
  "رخام مصري": "/categories/5.jpg",
  "كوارتز": "/categories/4.jpg",
  "رخام مصنع": "/categories/6.jpg",
};
export default function CategoriesGrid({ categories = [], onCategoryClick }: CategoriesGridProps) {
  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category.id, category.name);
    }
  };

  return (
    <div className={styles.grid}>
      {categories.length === 0 ? (
        <div className={styles.categoryInfo}>
          <h3 className={"marble-heading " + styles.categoryName}>لا توجد تصنيفات متاحة</h3>
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className={"marble-card " + styles.categoryCard}
            onClick={() => handleCategoryClick(category)}
          >
            <div className={styles.imageContainer}>
              <img
  src={categoryImages[category.name] || '/acessts/placeholder.svg'}
  alt={category.name}
  className={styles.categoryImage}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = '/acessts/placeholder.svg';
  }}
/>

            </div>
            
            <div className={styles.categoryInfo}>
              <h3 className={"marble-heading " + styles.categoryName}>{category.name}</h3>
              {category.description ? (
                <p className={styles.categoryDescription}>{category.description}</p>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}