"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";
import {
  Product as ApiProduct,
  productService,
  ProductFilters,
} from "@/services/api/products";
import type { Product as UiProduct } from "@/services/product/products";
import Card from "@/components/UI/Card/Card";
import { getPrimaryMedia } from "@/utils/media";

const RelatedProducts: React.FC = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    slides: { perView: 1.2, spacing: 12, origin: "auto" },
    breakpoints: {
      "(min-width: 480px)": { slides: { perView: 2, spacing: 12, origin: "auto" } },
      "(min-width: 768px)": { slides: { perView: 3, spacing: 16, origin: "auto" } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 16, origin: "auto" } },
      "(min-width: 1280px)": { slides: { perView: 6, spacing: 16, origin: "auto" } },
    },
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = setInterval(() => slider.next(), 2500);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const BASE_IMAGE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1";

  const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";

  const getPrimaryImage = (p: ApiProduct): string => {
    const first = getPrimaryMedia(
      [
        ...(Array.isArray(p.imageList) ? p.imageList : []),
        ...(Array.isArray(p.images) ? p.images : []),
        p.image,
      ],
      PLACEHOLDER_SRC
    );

    if (first.startsWith("http")) return first.replace("http://", "https://");

    return `${BASE_IMAGE_URL}${first.startsWith("/") ? "" : "/"}${first}`;
  };

  const mapToUiProduct = (p: ApiProduct): UiProduct => {
    const imageUrl = getPrimaryImage(p);

    return {
      ...p,
      id: p._id || p.id || "",
      image: imageUrl,
      images: [imageUrl],
      imageList: [imageUrl],
      inStock: typeof p.stockQty === "number" ? p.stockQty > 0 : true,
      stockQuantity: p.stockQty,
      stockQty: p.stockQty,
    } as UiProduct;
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: ProductFilters = { limit: 8 };
      const response = await productService.getProducts(filters);
      setProducts(response?.data || []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  if (loading) {
    return <div className="mt-12 text-black60">جاري التحميل...</div>;
  }

  return (
    <div className="mt-10 sm:mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">منتجات قد تعجبك</h2>

      <div
        ref={sliderRef}
        className="keen-slider px-3 sm:px-0"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {products.map((product, index) => (
          <div
            key={`${product._id || product.id}-${index}`}
            className="keen-slider__slide flex h-auto"
          >
            <Link href={`/product/${product._id || product.id}`} className="block w-full">
              <Card
                productId={String(product._id || product.id || index)}
                productImg={getPrimaryImage(product)}
                productName={product.name || "منتج"}
                productCategory={product.category || "غير محدد"}
                productPrice={String(product.price || 0)}
                product={mapToUiProduct(product)}
                hasOffer={Boolean(
                  (product as { hasOffer?: boolean }).hasOffer || product.isOffer
                )}
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