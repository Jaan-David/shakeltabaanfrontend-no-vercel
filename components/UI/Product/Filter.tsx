'use client';
import React, { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/product/categories';

//styles
import styles from '@/components/UI/Product/Filter.module.css';

interface FilterProps {
  getByCategory: (categories: string[]) => void;
  getByLetter: (letter: string) => void;
  selectedCategories?: string[];
  selectedLetter?: string;
  initialCategories?: string[];
  initialLetter?: string;
  disabled?: boolean;
}

// Helper function to format category name for display
const formatCategoryName = (categoryName: string): string => {
  // If it's already properly formatted, return as is
  if (categoryName.includes(' ')) {
    return categoryName;
  }
  
  // Convert kebab-case or snake_case to Title Case
  return categoryName
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function Filter({ 
  getByCategory, 
  getByLetter,
  selectedCategories: propSelectedCategories,
  selectedLetter: propSelectedLetter,
  initialCategories,
  initialLetter,
  disabled = false
}: FilterProps) {
  // Detect current language
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');

  // Dynamic categories from API
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Internal state with fallback to props
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    propSelectedCategories || initialCategories || []
  );
  const [selectedLetter, setSelectedLetter] = useState<string>(
    propSelectedLetter || initialLetter || 'الكل'
  );

  // ============================================
  // DETECT LANGUAGE CHANGES
  // ============================================
  useEffect(() => {
    const detectLanguage = () => {
      const htmlLang = document.documentElement.lang;
      const savedLang = localStorage.getItem('selectedLanguage');
      const detectedLang = savedLang || htmlLang || 'ar';
      setCurrentLanguage(detectedLang === 'ar' ? 'ar' : 'en');
    };

    detectLanguage();

    const observer = new MutationObserver(detectLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    window.addEventListener('storage', detectLanguage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', detectLanguage);
    };
  }, []);

  // ============================================
  // FETCH CATEGORIES FROM API
  // ============================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setCategoriesError(null);
        
        console.log('🔄 Loading categories...');
        const categories = await fetchCategories();
        
        console.log('✅ Categories loaded:', categories);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');
        
        // Don't use fallback categories - show error instead
        setAvailableCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Update internal state when props change
  useEffect(() => {
    if (propSelectedCategories !== undefined) {
      setSelectedCategories(propSelectedCategories);
    }
  }, [propSelectedCategories]);

  useEffect(() => {
    if (propSelectedLetter !== undefined) {
      setSelectedLetter(propSelectedLetter);
    }
  }, [propSelectedLetter]);

  // Transform categories for display
  const categories = availableCategories.map(categoryName => ({
    id: categoryName,
    label: formatCategoryName(categoryName) // Use actual category name from API
  }));

  // Bilingual letters
  const arabicLetters = [
    'الكل', 'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ',
    'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ',
    'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ى'
  ];

  const englishLetters = [
    'All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  const letters = currentLanguage === 'ar' ? arabicLetters : englishLetters;

  // Bilingual text
  const text = {
    ar: {
      activeFilters: 'فلاتر نشطة',
      clearAll: 'مسح الكل',
      type: 'النوع',
      selected: 'مُحدد',
      letter: 'الحرف',
      selectedLetter: 'الحرف المُحدد',
      showingAll: 'عرض جميع المنتجات',
      loading: 'جاري التحميل...',
      error: 'خطأ في تحميل الفئات',
      retry: 'إعادة المحاولة'
    },
    en: {
      activeFilters: 'Active Filters',
      clearAll: 'Clear All',
      type: 'Type',
      selected: 'Selected',
      letter: 'Letter',
      selectedLetter: 'Selected Letter',
      showingAll: 'Showing All Products',
      loading: 'Loading...',
      error: 'Error loading categories',
      retry: 'Retry'
    }
  };

  const t = text[currentLanguage];

  // Helper function to check if "All" is selected
  const isAllLetter = (letter: string): boolean => {
    const normalizedLetter = letter.toLowerCase().trim();
    return normalizedLetter === 'all' || 
           normalizedLetter === 'الكل' || 
           normalizedLetter === 'كل';
  };

  const handleCategoryChange = (categoryId: string) => {
    if (disabled) return;

    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(updatedCategories);
    getByCategory(updatedCategories);
  };

  const handleLetterClick = (letter: string) => {
    if (disabled) return;

    setSelectedLetter(letter);
    getByLetter(letter);
  };


  const retryLoadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      
      const categories = await fetchCategories();
      setAvailableCategories(categories);
    } catch (error) {
      setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  return (
    <div className={`${styles.filterContainer} ${disabled ? styles.disabled : ''}`}>
      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>{t.type}</h2>

        {/* Loading State */}
        {isCategoriesLoading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {categoriesError && !isCategoriesLoading && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{t.error}</p>
            <button 
              onClick={retryLoadCategories} 
              className={styles.retryButton}
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* Categories List */}
        {!isCategoriesLoading && !categoriesError && (
          <div className={styles.categoriesList}>
            {categories.map((category) => (
              <label
                key={category.id}
                className={`${styles.categoryItem} ${disabled ? styles.disabledItem : ''}`}
              >
                <span className={styles.categoryLabel}>
                  {category.label}
                </span>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className={styles.checkbox}
                  disabled={disabled}
                />
              </label>
            ))}
          </div>
        )}

      
       
      </div>

      {/* Letters Section */}
      <div className={styles.lettersSection}>
        <h2 className={styles.sectionTitle}>{t.letter}</h2>
        <div className={styles.lettersGrid}>
          {letters.map((letter) => {
            const isActive = 
              isAllLetter(letter) && isAllLetter(selectedLetter)
                ? true 
                : selectedLetter === letter;
            
            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={disabled}
                className={`
                  ${styles.letterButton}
                  ${isActive ? styles.active : ''}
                  ${isAllLetter(letter) ? styles.all : ''}
                  ${disabled ? styles.disabledButton : ''}
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state overlay */}
      {disabled && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}

export default Filter;