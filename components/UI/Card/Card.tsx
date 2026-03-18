"use client"
import { useMemo, useCallback, useEffect, useState } from 'react';
import Image, { type StaticImageData } from "next/image";

import styles from '@/components/UI/Card/card.module.css';
import { resolveProductPricing } from '@/utils/pricing';

// Components
import { CustomMedia } from '@/components/UI/Image/Images';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import Alert from '@/components/UI/Alert/alert';

// Import Product type and helper function
import type { Product } from '@/services/product/products';

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
    offerPrice?: string | number | null;
    offerSquarePrice?: string | number | null;
    minPrice?: string | number | null;
    maxPrice?: string | number | null;
    pricePerSquareMeter?: string | number | null;
    priceOnRequest?: boolean;
    customPriceLabel?: string;
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
    withInstallation?: boolean;
}

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
    pricePerLinearMeter,
    pricePerCubicMeter,
    offerLinearPrice = null,
    offerCubicPrice = null,
    offerPrice = null,
    offerSquarePrice = null,
    minPrice = null,
    maxPrice = null,
    pricePerSquareMeter = null,
    priceOnRequest = false,
    customPriceLabel,
    color,
    qualityGrade,
    organizationName,
    organizationId,
    showQualityGrade = true,
    showMinimalMarbleInfo = false,
    showActionButton = true,
    hasOffer = false,
    isVerifiedSupplier = false,
    withInstallation,
    product
}: CardProps) {
    const { toggle, isFavorite } = useFavorites();
    const router = useRouter();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [useContainFit, setUseContainFit] = useState(false);

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

    const isPlaceholderImage = useMemo(() => {
        return !imageSrc || imageSrc.includes('NoImage');
    }, [imageSrc]);

    useEffect(() => {
        setUseContainFit(false);
    }, [imageSrc]);

    const id = useMemo(() => productId || productName || imageSrc, [productId, productName, imageSrc]);

    const loved = isFavorite(id!);

    const discountPercentage = useMemo(() => {
        if (discount) return discount;
        if (numericOriginalPrice && numericPrice) {
            return calculateDiscountPercentage(numericOriginalPrice, numericPrice);
        }
        return 0;
    }, [discount, numericOriginalPrice, numericPrice]);

    const resolvedPricing = useMemo(() => {
        return resolveProductPricing(
            {
                price: productPrice ?? product?.price,
                offerPrice: offerPrice ?? product?.offerPrice,
                pricePerSquareMeter:
                    pricePerSquareMeter ?? product?.pricePerSquareMeter ?? product?.pricePerCubicMeter,
                offerSquarePrice:
                    offerSquarePrice ?? product?.offerSquarePrice ?? product?.offerCubicPrice,
                pricePerCubicMeter: pricePerCubicMeter ?? product?.pricePerCubicMeter,
                offerCubicPrice: offerCubicPrice ?? product?.offerCubicPrice,
                pricePerLinearMeter: pricePerLinearMeter ?? product?.pricePerLinearMeter,
                offerLinearPrice: offerLinearPrice ?? product?.offerLinearPrice,
                minPrice: minPrice ?? product?.minPrice,
                maxPrice: maxPrice ?? product?.maxPrice,
                priceOnRequest: priceOnRequest || product?.priceOnRequest,
                customPriceLabel: customPriceLabel ?? product?.customPriceLabel,
            },
            {
                preferredOrder: ['square', 'linear', 'fixed', 'cubic'],
                treatCubicAsSquare: true,
            }
        );
    }, [
        productPrice,
        product,
        offerPrice,
        pricePerSquareMeter,
        offerSquarePrice,
        pricePerCubicMeter,
        offerCubicPrice,
        offerLinearPrice,
        pricePerLinearMeter,
        minPrice,
        maxPrice,
        priceOnRequest,
        customPriceLabel,
    ]);

    const showSpecialOfferBadge = useMemo(() => {
        return hasOffer === true || resolvedPricing.mode === 'offer';
    }, [hasOffer, resolvedPricing.mode]);

    const hasInstallation = useMemo(() => {
        return withInstallation === true || product?.withInstallation === true;
    }, [withInstallation, product?.withInstallation]);

    const imageBadgeText = useMemo(() => {
        if (badge) return badge;
        if (productCategory && productCategory !== 'غير محدد') return productCategory;
        return '';
    }, [badge, productCategory]);

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

    const handleImageLoad = useCallback((event: any) => {
        const target = (event?.currentTarget || event?.target) as HTMLImageElement | null;
        if (!target) return;

        const naturalWidth = target.naturalWidth || 0;
        const naturalHeight = target.naturalHeight || 0;
        if (!naturalWidth || !naturalHeight) return;

        const isPortrait = naturalHeight > naturalWidth;
        const isSmall = naturalWidth < 420 || naturalHeight < 320;
        setUseContainFit(isPortrait || isSmall);
    }, []);

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
                        <Image
                            src={loved ? FHEART_SRC : EHEART_SRC}
                            className={styles.heartIcon}
                            alt={loved ? 'مفضل' : 'غير مفضل'}
                            width={22}
                            height={22}
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
                        {isPlaceholderImage ? (
                            <div className={styles.placeholderImage}>
                                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.placeholderIcon}>
                                    <path
                                        d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v13c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 21 4 19.88 4 18.5v-13zm2.5-.5a.5.5 0 0 0-.5.5v13c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-11zm2.25 3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm-1.5 8.25 3.5-4.5 2.5 3 3.5-4.5 3.25 4.5v1.5H7.25v-0.5z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span className={styles.placeholderText}>بدون صورة</span>
                            </div>
                        ) : (
                            <CustomMedia
                                src={imageSrc}
                                alt={productName || 'صورة المنتج'}
                                width={400}
                                height={300}
                                sizes="(max-width: 475px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className={styles.imageMedia}
                                imageClassName={`${styles.img} ${useContainFit ? styles.small : ''}`}
                                objectFit={useContainFit ? 'contain' : 'cover'}
                                loading="lazy"
                                decoding="async"
                                onLoad={handleImageLoad}
                                priority={false}
                            />
                        )}
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

                    {hasInstallation && (
                        <div className={styles.metaBadges}>
                            <span className={styles.installationBadge}>متاح تركيب</span>
                        </div>
                    )}

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

                    <div className={styles.priceBox}>
                        <span className={styles.priceBoxLabel}>{resolvedPricing.label}</span>
                        {resolvedPricing.mode === 'offer' && resolvedPricing.oldDisplay && (
                            <span className={styles.priceBoxOld}>بدلاً من {resolvedPricing.oldDisplay}</span>
                        )}
                        <span
                            className={`${styles.priceBoxValue} ${
                                resolvedPricing.mode === 'request' ? styles.priceBoxMuted : ''
                            }`}
                        >
                            {resolvedPricing.display}
                        </span>
                        {resolvedPricing.mode === 'range' && (
                            <span className={styles.priceBoxHint}>
                                السعر متغير وبيتأكد بعد الاتفاق، لكن في الرينج ده.
                            </span>
                        )}
                        {resolvedPricing.mode === 'request' && (
                            <span className={styles.priceBoxHint}>سيتم تحديد السعر بعد التواصل</span>
                        )}
                    </div>

                    {showActionButton && !showMinimalMarbleInfo && (
                        <div className={styles.cardActions}>
                            <button type="button" className={styles.primaryButton} onClick={handleCardClick}>
                                تفاصيل المنتج
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