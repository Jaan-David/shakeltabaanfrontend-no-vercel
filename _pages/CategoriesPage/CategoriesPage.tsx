import React from "react";
import CategoriesGrid, { Category } from "./CategoriesGrid";
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const categories: Category[] = [];
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>رخام في مصر وجرانيت في مصر</h1>
        <p className={styles.subtitle}>تصنيفات كوارتز للمطابخ وخامات تناسب الأرضيات والواجهات</p>
      </div>
      <CategoriesGrid categories={categories} />
    </div>
  );
}