"use client"
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";

import styles from '@/components/UI/Card/card.module.css';

// Components
import { CustomMedia } from '@/components/UI/Image/Images';
import Availablity from '@/components/UI/Card/Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import Alert from '@/components/UI/Alert/alert';
import PriceRow from '@/components/UI/Price/PriceRow';

// Import Product type and helper function
import type { Product } from '@/services/product/products';
import { getProductUnitLabel } from '@/services/product/products';

// Sample Image
import Img from '@/public/acessts/NoImage.jpg';

// Icons
const EHEART_SRC = '/icons/emptyHeart.svg';
const FHEART_SRC = '/icons/FilledHeart.svg';
import { useRouter } from 'next/navigation';

interface CardProps {
    productImg?: string | StaticImageData;
    productName?: string;
    productCategory?: string;
    productPrice?: string;
    originalPrice?: string;
    discount?: number;
    productId?: string;
    available?: boolean;
    rating?: number;
    reviewsCount?: number;
    badge?: string;
    isLoading?: boolean;
    // Unit type props - pass the whole product or individual flags
    product?: Product;
    IsKG?: boolean;
    IsTON?: boolean;
    IsLITER?: boolean;
    IsCUBIC_METER?: boolean;
    // Marble/Granite specific fields
    pricePerLinearMeter?: string | number;
    pricePerCubicMeter?: string | number;
    offerLinearPrice?: string | number | null;
    offerCubicPrice?: string | number | null;
    color?: string;
    qualityGrade?: string;
    isOffer?: boolean;
    organizationName?: string;
    organizationId?: string;
    showOrganizationInline?: boolean;
    showQualityGrade?: boolean;
    showMinimalMarbleInfo?: boolean;
    showActionButton?: boolean;
    hasOffer?: boolean;
    isVerifiedSupplier?: boolean;
    alwaysShowBothPrices?: boolean;
}

// Helper function to format price
const formatPrice = (price: string | number | undefined): string => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, ''))
        : price;
    
    if (isNaN(numericPrice)) return '0';
    
    return numericPrice.toLocaleString('ar-EG');
};

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

function Card({ 
    productImg= Img, 
    productName, 
    productCategory, 
    productPrice, 
    originalPrice,
    discount,
    productId, 
    available = true,
    rating,
    reviewsCount,
    badge,
    isLoading = false,
    product,
    IsKG,
    IsTON,
    IsLITER,
    IsCUBIC_METER,
    pricePerLinearMeter,
    pricePerCubicMeter,
    offerLinearPrice = null,
    offerCubicPrice = null,
    color,
    qualityGrade,
    isOffer = false,
    organizationName,
    organizationId,
    showOrganizationInline = false,
    showQualityGrade = true,
    showMinimalMarbleInfo = false,
    showActionButton = true,
    hasOffer = false,
    isVerifiedSupplier = false,
    alwaysShowBothPrices = false
}: CardProps) {
    const { toggle, isFavorite } = useFavorites();
    const router = useRouter();
    const [showLoginAlert, setShowLoginAlert] = useState(false);

    const numericPrice = useMemo(() => {
        const n = parseFloat(String(productPrice ?? '0').replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
    }, [productPrice]);

    const numericOriginalPrice = useMemo(() => {
        if (!originalPrice) return null;
        const n = parseFloat(String(originalPrice).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? null : n;
    }, [originalPrice]);

    const imageSrc: string = useMemo(() => {
        return typeof productImg === 'string' ? productImg : (productImg?.src || '/acessts/NoImage.jpg');
    }, [productImg]);

    const id = useMemo(() => productId || productName || imageSrc, [productId, productName, imageSrc]);

    const loved = isFavorite(id!);

    const discountPercentage = useMemo(() => {
        if (discount) return discount;
        if (numericOriginalPrice && numericPrice) {
            return calculateDiscountPercentage(numericOriginalPrice, numericPrice);
        }
        return 0;
    }, [discount, numericOriginalPrice, numericPrice]);

    const showSpecialOfferBadge = useMemo(() => {
        return hasOffer === true;
    }, [hasOffer]);

    const imageBadgeText = useMemo(() => {
        if (badge) return badge;
        if (productCategory && productCategory !== 'غير محدد') return productCategory;
        return '';
    }, [badge, productCategory]);

    // Get unit label using helper function
    const unitLabel = useMemo(() => {
        if (product) {
            return getProductUnitLabel(product);
        }
        // Fallback to individual props
        const mockProduct: Partial<Product> = {
            IsKG,
            IsTON,
            IsLITER,
            IsCUBIC_METER
        };
        return getProductUnitLabel(mockProduct as Product);
    }, [product, IsKG, IsTON, IsLITER, IsCUBIC_METER]);

    const onHeartClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id || isLoading) return;

        const { UserStorage } = require('@/services/auth/login');
        const user = UserStorage.getUser();

        if (!user) {
            setShowLoginAlert(true);
            return;
        }

        toggle({
            id,
            name: productName || 'منتج',
            price: numericPrice,
            image: imageSrc,
        });
    }, [id, toggle, productName, numericPrice, imageSrc, isLoading]);

    const handleLoginConfirm = useCallback(() => {
        setShowLoginAlert(false);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }, [router]);

    const handleLoginCancel = useCallback(() => {
        setShowLoginAlert(false);
    }, []);

    const handleCardClick = useCallback(() => {
        if (isLoading) return;
        const target = productId ? String(productId) : (productName || '');
        const slug = encodeURIComponent(target);
        router.push(`/product/${slug}`);
    }, [router, productName, productId, isLoading]);


    if (isLoading) {
        return (
            <div className={`${styles.card} ${styles.loading}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.skeletonImage}></div>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonPrice}></div>
                    <div className={styles.skeletonActions}></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`${styles.card} ${!available ? styles.unavailable : ''}`}>
                <div className={styles.cardHeader}>
                    <button
                        type="button"
                        className={styles.favoriteButton}
                        onClick={onHeartClick}
                        aria-label={loved ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                        <img
                            src={loved ? FHEART_SRC : EHEART_SRC}
                            className={styles.heartIcon}
                            alt={loved ? 'مفضل' : 'غير مفضل'}
                        />
                    </button>
                    
                    <div
                        className={styles.cardImage}
                        onClick={handleCardClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleCardClick();
                            }
                        }}
                    >
                        <div className={styles.badgeStack}>
                            {imageBadgeText && (
                                <span className={styles.imageBadge}>
                                    {imageBadgeText}
                                </span>
                            )}
                            {showSpecialOfferBadge && (
                                <span className={styles.specialOfferBadge}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M13.5 2l-2 6H6l4.5 3-2 6L13 13l4.5 4-2-6L20 8h-5.5L13.5 2z" />
                                    </svg>
                                    عرض خاص
                                </span>
                            )}
                        </div>
                        {discountPercentage > 0 && (
                            <div className={styles.discountBadge}>
                                -{discountPercentage}%
                            </div>
                        )}
                        <div className={styles.quickActions}>
                            <button type="button" className={styles.quickActionButton} onClick={handleCardClick}>
                                عرض التفاصيل
                            </button>
                        </div>
                        <CustomMedia
                            src={imageSrc}
                            alt={productName || 'صورة المنتج'}
                            width={320}
                            height={240}
                            rounded="md"
                            className={styles.img}
                            objectFit="cover"
                            priority
                        />
                    </div>
                </div>
                
                <div className={styles.cardBody}>
                    <div className={styles.topMeta}>
                        <div className={styles.supplierRow}>
                            <span className={styles.supplierName}>
                                {organizationName || organizationId || 'مورد معتمد'}
                            </span>
                            {isVerifiedSupplier && (
                                <span className={styles.verifiedBadge} title="مورد موثوق">
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14.8 7.2 16.5l.9-5.2L4.3 7.6l5.3-.8L12 2z" />
                                    </svg>
                                </span>
                            )}
                        </div>
                        <div className={styles.ratingRow}>
                            <span className={styles.ratingStar}>★</span>
                            <span className={styles.ratingValue}>{(rating ?? 0).toFixed(1)}</span>
                            <span className={styles.ratingCount}>({reviewsCount ?? 0})</span>
                        </div>
                    </div>

                    <h2
                        className={styles.productName}
                        title={productName}
                        onClick={handleCardClick}
                    >
                        {productName || 'اسم المنتج'}
                    </h2>

                    {!showMinimalMarbleInfo && showQualityGrade && qualityGrade && (
                        <div className={styles.qualityBadge}>
                            <span className={styles.qualityText}>
                                <span className={styles.qualityLabel}>جودة:</span>{" "}
                                <span className={styles.qualityValue}>{qualityGrade}</span>
                            </span>
                        </div>
                    )}

                    {!showMinimalMarbleInfo && color && (
                        <div className={styles.colorDisplay}>
                            <span className={styles.colorText}>
                                <span className={styles.colorLabel}>لون:</span>{" "}
                                <span className={styles.colorValue}>{color}</span>
                            </span>
                        </div>
                    )}

                    <div className={styles.priceBlock}>
                        <PriceRow
                            label="سعر المتر المربع"
                            price={pricePerCubicMeter}
                            offerPrice={offerCubicPrice}
                            unitLabel="م مربع"
                            size="primary"
                            showPlaceholder={alwaysShowBothPrices}
                        />
                        <PriceRow
                            label="سعر المتر الطولي"
                            price={pricePerLinearMeter}
                            offerPrice={offerLinearPrice}
                            unitLabel="م طولي"
                            size="secondary"
                            showPlaceholder={alwaysShowBothPrices}
                        />
                        {!pricePerCubicMeter && !offerCubicPrice && !pricePerLinearMeter && !offerLinearPrice && (
                            <span className={styles.priceOnRequest}>السعر عند الطلب</span>
                        )}
                    </div>

                    {showActionButton && !showMinimalMarbleInfo && (
                        <div className={styles.cardActions}>
                            <button type="button" className={styles.primaryButton} onClick={handleCardClick}>
                                عرض التفاصيل
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showLoginAlert && (
                <Alert
                    message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
                    setClose={handleLoginCancel}
                    buttons={[
                        { 
                            label: 'إلغاء', 
                            onClick: handleLoginCancel, 
                            variant: 'ghost' 
                        },
                        { 
                            label: 'تسجيل الدخول', 
                            onClick: handleLoginConfirm, 
                            variant: 'primary' 
                        }
                    ]}
                    type="warning"
                />
            )}
        </>
    );
}

export default Card;