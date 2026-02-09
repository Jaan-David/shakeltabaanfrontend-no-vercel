"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';
import { Product as ApiProduct, productService, ProductFilters } from '@/services/api/products';
import type { Product as UiProduct } from '@/services/product/products';
import Card from '@/components/UI/Card/Card';

const RelatedProducts: React.FC<{ currentProductId?: string }> = ({ currentProductId }) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'free-snap',
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      '(min-width: 768px)': { slides: { perView: 3, spacing: 16 } },
      '(min-width: 1024px)': { slides: { perView: 6, spacing: 16 } },
    },
  });

  const timerRef = useRef<number | null>(null);
  const start = () => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = window.setInterval(() => slider.next(), 2500);
  };
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Base URL for images (adjust based on your backend)
  const BASE_IMAGE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1';

  // Safely pick a primary image with fallback
  const PLACEHOLDER_SRC = '/acessts/NoImage.jpg';
  const getPrimaryImage = (p: ApiProduct): string => {
    const candidates: string[] = [];

    if (Array.isArray(p?.imageList)) {
      candidates.push(...p.imageList.filter((img) => typeof img === 'string' && img.trim() !== ''));
    }

    if (typeof p?.image === 'string' && p.image.trim() !== '') {
      candidates.push(p.image);
    }

    if (Array.isArray(p?.images)) {
      candidates.push(...p.images.filter((img) => typeof img === 'string' && img.trim() !== ''));
    }

    const firstValidImage = candidates[0];
    if (!firstValidImage) return PLACEHOLDER_SRC;

    const imageUrl = firstValidImage.startsWith('http')
      ? firstValidImage
      : `${BASE_IMAGE_URL}${firstValidImage.startsWith('/') ? '' : '/'}${firstValidImage}`;

    if (imageUrl.startsWith('http://res.cloudinary.com')) {
      return imageUrl.replace('http://', 'https://');
    }

    return imageUrl;
  };

  const mapToUiProduct = (p: ApiProduct): UiProduct => {
    const imageUrl = getPrimaryImage(p);
    return {
      id: p._id || p.id || '',
      _id: p._id,
      name: p.name || '',
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      description: p.description,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      category: p.category || '',
      price: p.price || 0,
      image: imageUrl,
      images: [imageUrl],
      imageList: [imageUrl],
      inStock: typeof p.stockQty === 'number' ? p.stockQty > 0 : true,
      stockQuantity: p.stockQty,
      stockQty: p.stockQty,
      pricePerLinearMeter: p.pricePerLinearMeter,
      pricePerCubicMeter: p.pricePerCubicMeter,
      offerLinearPrice: p.offerLinearPrice,
      offerCubicPrice: p.offerCubicPrice,
      color: p.color,
      qualityGrade: p.qualityGrade,
      isOffer: p.isOffer,
      organizationName: p.organizationName,
      organizationId: p.organizationId,
    };
  };

  // Fetch related products from API
  const fetchRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters using the ProductFilters interface
      const filters: ProductFilters = {
        limit: 8, // Limit to 8 related products
        ...(currentProductId && { excludeId: currentProductId }) // Exclude current product if ID is provided
      };

      // Use the product service to fetch products
      const response = await productService.getProducts(filters);

      if (response && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      //console.error('Error fetching related products:', err);
      setError('حدث خطأ أثناء تحميل المنتجات المتعلقة');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentProductId]);

  useEffect(() => {
    fetchRelatedProducts();
  }, [fetchRelatedProducts]);

  useEffect(() => {
    start();
    return () => stop();
  }, [instanceRef]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">منتجات قد تعجبك</h2>
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    );
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">منتجات قد تعجبك</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if no products are available
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">منتجات قد تعجبك</h2>
      <div
        ref={sliderRef}
        className="keen-slider flex gap-4 overflow-hidden px-2"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product, index) => (
          <div
            key={`${product._id || product.id || 'item'}-${index}`}
            className="keen-slider__slide shrink-0 box-border w-[240px] sm:w-[260px] lg:w-[280px]"
          >
            <Link href={`/product/${product._id || product.id || index}`} className="block">
              <Card
                productId={String(product._id || product.id || index)}
                productImg={getPrimaryImage(product)}
                productName={product.name || 'منتج'}
                productCategory={product.category || 'غير محدد'}
                productPrice={String(product.price || 0)}
                product={mapToUiProduct(product)}
                hasOffer={Boolean((product as { hasOffer?: boolean }).hasOffer || product.isOffer)}
                IsKG={product.IsKG}
                IsTON={product.IsTON}
                IsLITER={product.IsLITER}
                IsCUBIC_METER={product.IsCUBIC_METER}
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
                showQualityGrade={false}
                showMinimalMarbleInfo
                showActionButton={false}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);