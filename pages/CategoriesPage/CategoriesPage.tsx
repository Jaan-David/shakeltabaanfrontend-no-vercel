import React from "react";
import CategoriesGrid, { Category } from "./CategoriesGrid";
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const categories: Category[] = [];
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>فئات المنتجات</h1>
        <p className={styles.subtitle}>اكتشف مجموعتنا الواسعة من المنتجات الكيميائية</p>
      </div>
      <CategoriesGrid categories={categories} />
    </div>
  );
}