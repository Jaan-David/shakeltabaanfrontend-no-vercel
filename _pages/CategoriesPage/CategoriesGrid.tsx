"use client";
import React from "react";
import CategoryCard from "./CategoryCard";
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
  isLoading?: boolean;
}

const categoryImages: Record<string, string> = {
  "جرانيت مستورد": "/categories/1.jpg",
  "جرانيت مصرى": "/categories/2.jpg",
  "رخام مستورد": "/categories/3.jpg",
  "رخام مصرى": "/categories/5.jpg",
  "كوارتز": "/categories/4.jpg",
  "رخام مصنع": "/categories/6.jpg",
};
const CATEGORY_FALLBACKS: Record<string, string> = {
  "جرانيت مستورد": "جرانيت مستورد فاخر",
  "جرانيت مصرى": "جرانيت مصري عالي المتانة",
  "رخام مستورد": "رخام مستورد بتشطيبات راقية",
  "رخام مصرى": "رخام مصري عالي الجودة",
  "كوارتز": "كوارتز عملي ولمسات عصرية",
  "رخام مصنع": "رخام مصنع بتكلفة اقتصادية",
};

const getCategoryType = (name: string): "رخام" | "جرانيت" | "كوارتز" => {
  if (name.includes("جرانيت")) return "جرانيت";
  if (name.includes("كوارتز")) return "كوارتز";
  return "رخام";
};

export default function CategoriesGrid({
  categories = [],
  onCategoryClick,
  isLoading = false,
}: CategoriesGridProps) {
  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category.id, category.name);
    }
  };

  return (
    <div className={styles.grid}>
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard} aria-hidden="true" />
        ))
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>لا توجد تصنيفات متاحة</h3>
          <p className={styles.emptySubtitle}>سنضيف المزيد من التصنيفات قريباً.</p>
        </div>
      ) : (
        categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.name}
            description={category.description || CATEGORY_FALLBACKS[category.name] || "تصنيفات مختارة بعناية"}
            badge={getCategoryType(category.name)}
            image={categoryImages[category.name] || "/acessts/placeholder.svg"}
            onClick={() => handleCategoryClick(category)}
          />
        ))
      )}
    </div>
  );
}