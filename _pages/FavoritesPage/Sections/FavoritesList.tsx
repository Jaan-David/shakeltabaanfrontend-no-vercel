"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/UI/Card/Card';

export type FavoriteItem = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  // Extended fields from API
  pricePerLinearMeter?: number;
  pricePerCubicMeter?: number;
  offerLinearPrice?: number | null;
  offerCubicPrice?: number | null;
  category?: string;
  color?: string;
  qualityGrade?: string;
  isOffer?: boolean;
  organizationName?: string;
  organizationId?: string;
  stockQty?: number;
};

type Props = {
  items: FavoriteItem[];
  onRemove?: (id: number | string) => void;
};

const BASE_IMAGE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";

const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";

const FavoritesList: React.FC<Props> = ({ items, onRemove }) => {
  const mappedProducts = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => {
      const imageUrl = item.image?.startsWith('http') 
        ? item.image.replace('http://', 'https://')
        : `${BASE_IMAGE_URL}${item.image?.startsWith('/') ? '' : '/'}${item.image || PLACEHOLDER_SRC}`;

      return {
        ...item,
        productImg: imageUrl,
        productName: item.name,
        productCategory: item.category || 'غير محدد',
        productId: String(item.id),
        productPrice: String(item.price || 0),
        available: (item.stockQty ?? 1) > 0,
        rating: 0,
        reviewsCount: 0,
      };
    });
  }, [items]);

  if (!items?.length) return null;

  return (
    <section className="bg-white">
      {/* Professional grid layout */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {mappedProducts.map((product) => (
          <div key={product.id} className="relative group">
            <Link href={`/product/${product.id}`}>
              <Card
                productId={product.productId}
                productImg={product.productImg}
                productName={product.productName}
                productCategory={product.productCategory}
                productPrice={product.productPrice}
                available={product.available}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                pricePerLinearMeter={product.pricePerLinearMeter}
                pricePerCubicMeter={product.pricePerCubicMeter}
                offerLinearPrice={product.offerLinearPrice}
                offerCubicPrice={product.offerCubicPrice}
                color={product.color}
                qualityGrade={product.qualityGrade}
                isOffer={product.isOffer}
                organizationName={product.organizationName}
                organizationId={product.organizationId}
                showOrganizationInline
                showQualityGrade={true}
                showMinimalMarbleInfo={false}
                showActionButton={false}
              />
            </Link>
            
            {/* Remove button overlay */}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(product.id);
                }}
                className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                type="button"
                aria-label={`حذف ${product.name} من المفضلة`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(FavoritesList);