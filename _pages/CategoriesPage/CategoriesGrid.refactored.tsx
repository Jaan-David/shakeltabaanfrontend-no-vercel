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
  "جرانيت مستورد": "/categories/جرانيت مستورد.jpeg",
  "جرانيت مصرى": "/categories/جرانيت مصري.jpeg",
  "رخام مستورد": "/categories/رخام مستورد.jpeg",
  "رخام مصرى": "/categories/رخام مصري.jpeg",
  "كوارتز": "/categories/كوارتز.jpeg",
  "رخام مصنع": "/categories/رخام صناعي.jpeg",
  "اعمال النحت": "/categories/اعمال نحت.jpeg",
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  "جرانيت مستورد": "جرانيت مستورد فاخر",
  "جرانيت مصرى": "جرانيت مصري عالي المتانة",
  "رخام مستورد": "رخام مستورد بتشطيبات راقية",
  "رخام مصرى": "رخام مصري عالي الجودة",
  "كوارتز": "كوارتز عملي ولمسات عصرية",
  "رخام مصنع": "رخام مصنع بتكلفة اقتصادية",
  "اعمال النحت": "أعمال نحت احترافية وفنية",
};

const getCategoryType = (name: string): "رخام" | "جرانيت" | "كوارتز" | "نحت" => {
  if (name.includes("جرانيت")) return "جرانيت";
  if (name.includes("كوارتز")) return "كوارتز";
  if (name.includes("نحت")) return "نحت";
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
    <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse"
            aria-hidden="true"
          />
        ))
      ) : categories.length === 0 ? (
        <div className="col-span-full text-center py-16">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">لا توجد تصنيفات متاحة</h3>
          <p className="text-slate-500">سنضيف المزيد من التصنيفات قريباً.</p>
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
