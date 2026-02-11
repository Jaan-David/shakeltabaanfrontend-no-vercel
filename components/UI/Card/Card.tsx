"use client"
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";

import styles from '@/components/UI/Card/card.module.css';

// Components
import { CustomMedia } from '@/components/UI/Image/Images';
import Availablity from '@/components/UI/Card/Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import Alert from '@/components/UI/Alert/alert';

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
    hasOffer = false
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

    const hasOfferBadge = useMemo(() => {
        if (isOffer || hasOffer) return true;
        if (discountPercentage > 0) return true;
        const linearOffer = offerLinearPrice !== null && offerLinearPrice !== undefined && Number(offerLinearPrice) > 0;
        const cubicOffer = offerCubicPrice !== null && offerCubicPrice !== undefined && Number(offerCubicPrice) > 0;
        return linearOffer || cubicOffer;
    }, [isOffer, hasOffer, discountPercentage, offerLinearPrice, offerCubicPrice]);

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
                    <div className={styles.skeletonCategory}></div>
                    <div className={styles.skeletonName}></div>
                    <div className={styles.skeletonPrice}></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`${styles.card} ${!available ? styles.unavailable : ''}`}>
                {badge && (
                    <div className={styles.badge}>
                        {badge}
                    </div>
                )}
                
                <div className={styles.cardHeader}>
                    <div className={styles.icon}>
                        {loved ? (
                            <img
                                src={FHEART_SRC}
                                onClick={onHeartClick}
                                className={styles.heartIcon}
                                role="button"
                                aria-label="إزالة من المفضلة"
                                alt="مفضل"
                            />
                        ) : (
                            <img
                                src={EHEART_SRC}
                                onClick={onHeartClick}
                                className={styles.heartIcon}
                                role="button"
                                aria-label="إضافة إلى المفضلة"
                                alt="غير مفضل"
                            />
                        )}
                    </div>
                    
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
                        {hasOfferBadge && (
                            <div className={styles.offerBadge}>
                                عرض خاص
                            </div>
                        )}

                        {discountPercentage > 0 && (
                            <div className={styles.discountBadge}>
                                -{discountPercentage}%
                            </div>
                        )}
                        <CustomMedia
                            src={imageSrc}
                            alt={productName || 'صورة المنتج'}
                            width={240}
                            height={240}
                            rounded="md"
                            className={styles.img}
                            objectFit="cover"
                            priority
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                        />
                    </div>
                </div>
                
                <div className={styles.cardBody}>
                    {!showMinimalMarbleInfo && (
                        <div className={styles.category}>
                            <span className={styles.categoryText}>{productCategory || 'غير محدد'}</span>
                        </div>
                    )}
                    
                    {!showMinimalMarbleInfo && !showOrganizationInline && (organizationName || organizationId) && (
                        <div className={styles.organizationName}>
                            <span className={styles.organizationText}>
                                {organizationName || organizationId}
                            </span>
                        </div>
                    )}

                    {!showMinimalMarbleInfo && showOrganizationInline && (organizationName || organizationId) && (
                        <div className={styles.organizationInline}>
                            <span className={styles.organizationInlineText}>
                                {organizationName || organizationId}
                                {organizationName && organizationId ? ` • ${organizationId}` : ''}
                            </span>
                        </div>
                    )}
                    
                    <div className={styles.cardInfo}>
                        <h2 
                            className={styles.productName}
                            title={productName}
                            onClick={handleCardClick}
                        >
                            {productName || 'اسم المنتج'} 
                        </h2>

                        {showMinimalMarbleInfo && organizationId && (
                            <div className={styles.minimalOrganization}>
                                {organizationId}
                            </div>
                        )}

                        {/* Quality Grade Badge */}
                        {!showMinimalMarbleInfo && showQualityGrade && qualityGrade && (
                            <div className={styles.qualityBadge}>
                                <span className={styles.qualityText}>
                                    <span className={styles.qualityLabel}>جودة:</span>{" "}
                                    <span className={styles.qualityValue}>{qualityGrade}</span>
                                </span>
                            </div>
                        )}

                        {/* Color Display */}
                        {!showMinimalMarbleInfo && color && (
                            <div className={styles.colorDisplay}>
                                <span className={styles.colorText}>
                                    <span className={styles.colorLabel}>لون:</span>{" "}
                                    <span className={styles.colorValue}>{color}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.cardPrices}>
                        {showMinimalMarbleInfo && (pricePerLinearMeter || pricePerCubicMeter) && (
                            <div className={styles.minimalPriceList}>
                                {pricePerCubicMeter && (
                                    <div className={styles.minimalPriceRow}>
                                        <span className={styles.minimalPriceLabel}>سعر المتر مربع:</span>
                                        <span className={styles.minimalPriceValue}>
                                            {formatPrice(offerCubicPrice && Number(offerCubicPrice) > 0 ? offerCubicPrice : pricePerCubicMeter)} ج.م
                                        </span>
                                    </div>
                                )}
                                {pricePerLinearMeter && (
                                    <div className={styles.minimalPriceRow}>
                                        <span className={styles.minimalPriceLabel}>سعر المتر الطولي:</span>
                                        <span className={styles.minimalPriceValue}>
                                            {formatPrice(offerLinearPrice && Number(offerLinearPrice) > 0 ? offerLinearPrice : pricePerLinearMeter)} ج.م
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {!showMinimalMarbleInfo && (pricePerLinearMeter || pricePerCubicMeter) && (
                            <div className={styles.marblePriceSection}>
                                {/* Linear Meter Price */}
                                {pricePerLinearMeter && (
                                    <div className={styles.marblePrice}>
                                        <span className={styles.priceLabel}>سعر المتر الطولي:</span>
                                        {offerLinearPrice !== null && offerLinearPrice !== undefined && Number(offerLinearPrice) > 0 ? (
                                            <>
                                                <div className={styles.marblePriceValue}>
                                                    <span className={`${styles.priceAmount} ${styles.strikethrough}`}>
                                                        {formatPrice(pricePerLinearMeter)}
                                                    </span>
                                                    <span className={styles.currency}> ج.م</span>
                                                </div>
                                                <div className={styles.offerPriceValue}>
                                                    <span className={styles.offerAmount}>
                                                        {formatPrice(offerLinearPrice)}
                                                    </span>
                                                    <span className={styles.currency}> ج.م</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={styles.marblePriceValue}>
                                                <span className={styles.priceAmount}>
                                                    {formatPrice(pricePerLinearMeter)}
                                                </span>
                                                <span className={styles.currency}> ج.م</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cubic Meter Price */}
                                {pricePerCubicMeter && (
                                    <div className={styles.marblePrice}>
                                        <span className={styles.priceLabel}>سعر المتر مربع:</span>
                                        {offerCubicPrice !== null && offerCubicPrice !== undefined && Number(offerCubicPrice) > 0 ? (
                                            <>
                                                <div className={styles.marblePriceValue}>
                                                    <span className={`${styles.priceAmount} ${styles.strikethrough}`}>
                                                        {formatPrice(pricePerCubicMeter)}
                                                    </span>
                                                    <span className={styles.currency}> ج.م</span>
                                                </div>
                                                <div className={styles.offerPriceValue}>
                                                    <span className={styles.offerAmount}>
                                                        {formatPrice(offerCubicPrice)}
                                                    </span>
                                                    <span className={styles.currency}> ج.م</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={styles.marblePriceValue}>
                                                <span className={styles.priceAmount}>
                                                    {formatPrice(pricePerCubicMeter)}
                                                </span>
                                                <span className={styles.currency}> ج.م</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!showMinimalMarbleInfo && !(pricePerLinearMeter || pricePerCubicMeter) && (
                            <div className={styles.priceSection}>
                                <span className={styles.priceAmount}>
                                    {formatPrice(productPrice ?? 0)}
                                </span>
                                <span className={styles.currency}> ج.م</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.cardAction}>
                        {showActionButton && !showMinimalMarbleInfo && (
                            <div className={styles.cardActionButton}>
                                عرض التفاصيل
                            </div>
                        )}
                    </div>
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