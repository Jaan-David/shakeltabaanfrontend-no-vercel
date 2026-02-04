"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from 'next/link';
import { Product, productService, ProductFilters } from '@/services/api/products';
import { CustomImage } from '../Image/Images';

const RelatedProducts: React.FC<{ currentProductId?: string }> = ({ currentProductId }) => {
  const [products, setProducts] = useState<Product[]>([]);
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
  const BASE_IMAGE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shk2t-t3ban.fly.dev/app/v1';

  // Safely pick a primary image with fallback
  const PLACEHOLDER_SRC = '/acessts/NoImage.jpg';
  const getPrimaryImage = (p: Product): string => {
    // Check if imageList exists and has valid images
    if (p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0) {
      const firstValidImage = p.imageList.find((img) => typeof img === 'string' && img.trim() !== '');

      if (firstValidImage) {
        // Handle relative URLs by prepending the base URL
        const imageUrl = firstValidImage.startsWith('http')
          ? firstValidImage
          : `${BASE_IMAGE_URL}${firstValidImage.startsWith('/') ? '' : '/'}${firstValidImage}`;

        return imageUrl;
      }
    }

    return PLACEHOLDER_SRC;
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
        <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
        <div className="text-black60">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black87 mb-6">منتجات قد تعجبك</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if no products are available
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">منتجات قد تعجبك</h2>
      <div
        ref={sliderRef}
        className="keen-slider"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product) => (
          <div key={product._id} className="keen-slider__slide">
            <Link href={`/product/${product._id}`} className="block">
              <div className="bg-slate-800 rounded-[20px] shadow-sm border border-white/10 p-4 mx-1 hover:shadow-md transition-shadow cursor-pointer relative" role="link" aria-label={product.name}>
                {/* Offer Badge */}
                {product.isOffer && (
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-black text-xs font-extrabold px-3 py-1 rounded-md border-2 border-red-700 shadow-lg">
                    عرض خاص
                  </div>
                )}
                
                <div className="relative w-full aspect-square bg-card rounded-lg mb-3 overflow-hidden">
                  <CustomImage
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    fill
                    objectFit="cover"
                    fallbackSrc={PLACEHOLDER_SRC}
                  />
                </div>
                <h3 className="font-medium text-white text-sm mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                
                {/* Organization Info */}
                {(product.organizationName || product.organizationId) && (
                  <div className="mb-2 text-xs bg-blue-900/40 border border-blue-500/50 rounded px-2 py-1">
                    <div className="text-blue-300 font-semibold">
                      {product.organizationName || product.organizationId}
                    </div>
                  </div>
                )}
                
                {/* Price Display - Marble/Granite Fields */}
                {(product.pricePerCubicMeter || product.pricePerLinearMeter) ? (
                  <div className="flex flex-col gap-1">
                    {product.pricePerLinearMeter && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">المتر الطولي:</span>
                        {product.offerLinearPrice !== null && product.offerLinearPrice !== undefined && Number(product.offerLinearPrice) > 0 ? (
                          <>
                            <span className="text-xs text-gray-500 line-through">{Number(product.pricePerLinearMeter).toLocaleString()} ج.م</span>
                            <span className="text-sm font-bold text-red-500">{Number(product.offerLinearPrice).toLocaleString()} ج.م</span>
                          </>
                        ) : (
                          <span className="text-primary font-bold">{Number(product.pricePerLinearMeter).toLocaleString()} ج.م</span>
                        )}
                      </div>
                    )}
                    {product.pricePerCubicMeter && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">المتر المكعب:</span>
                        {product.offerCubicPrice !== null && product.offerCubicPrice !== undefined && Number(product.offerCubicPrice) > 0 ? (
                          <>
                            <span className="text-xs text-gray-500 line-through">{Number(product.pricePerCubicMeter).toLocaleString()} ج.م</span>
                            <span className="text-sm font-bold text-red-500">{Number(product.offerCubicPrice).toLocaleString()} ج.م</span>
                          </>
                        ) : (
                          <span className="text-primary font-bold">{Number(product.pricePerCubicMeter).toLocaleString()} ج.م</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-primary font-bold">{product.price.toLocaleString()} ج.م</div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);