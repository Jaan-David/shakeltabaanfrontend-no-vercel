"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useKeenSlider } from "keen-slider/react";
import Link from "next/link";
import {
  Product as ApiProduct,
  productService,
  ProductFilters,
} from "@/services/api/products";
import { getPrimaryMedia } from "@/utils/media";
import { resolveProductPricing } from "@/utils/pricing";

const RelatedProducts: React.FC<{ currentProductId?: string }> = ({
  currentProductId,
}) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const start = useCallback(() => {
    if (timerRef.current) return;
    const slider = instanceRef.current;
    if (!slider) return;
    timerRef.current = setInterval(() => slider.next(), 2500);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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

  const getResolvedPricing = (product: ApiProduct) => {
    return resolveProductPricing(
      {
        price: product.price,
        offerPrice: product.offerPrice,
        pricePerSquareMeter: product.pricePerSquareMeter,
        offerSquarePrice: product.offerSquarePrice,
        pricePerCubicMeter: product.pricePerCubicMeter,
        offerCubicPrice: product.offerCubicPrice,
        pricePerLinearMeter: product.pricePerLinearMeter,
        offerLinearPrice: product.offerLinearPrice,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        priceOnRequest: product.priceOnRequest,
        customPriceLabel: product.customPriceLabel,
      },
      {
        preferredOrder: ["square", "linear", "fixed", "cubic"],
        treatCubicAsSquare: true,
      }
    );
  };

  const fetchRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ProductFilters = {
        limit: 8,
        ...(currentProductId && { excludeId: currentProductId }),
      };

      const response = await productService.getProducts(filters);
      setProducts(response?.data || []);
    } catch {
      setError("حدث خطأ أثناء تحميل المنتجات المتعلقة");
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
  }, [start, stop]);

  if (loading)
    return <div className="mt-12 text-slate-600">جاري التحميل...</div>;

  if (error)
    return <div className="mt-12 text-red-500">{error}</div>;

  if (!products.length) return null;

  return (
    <div className="mt-10 sm:mt-12 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">منتجات قد تعجبك</h2>

      <div className="w-full overflow-hidden -mx-4 sm:mx-0">
        <div
          ref={sliderRef}
          className="keen-slider px-4 sm:px-0"
          onMouseEnter={stop}
          onMouseLeave={start}
        >
          {products.map((product, index) => {
            const pricing = getResolvedPricing(product);

            return (
              <div
                key={`${product._id || product.id}-${index}`}
                className="keen-slider__slide min-w-0 flex-shrink-0 h-auto"
              >
                <Link
                  href={`/product/${product._id || product.id}`}
                  className="block h-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={getPrimaryImage(product)}
                      alt={product.name || "منتج"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1 px-1 pb-1 text-right">
                    <p className="truncate text-xs text-slate-500">
                      {product.organizationName || product.organizationId || "مورد معتمد"}
                    </p>
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-900 sm:text-base">
                      {product.name || "منتج"}
                    </h3>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-slate-500">{pricing.label}</p>
                      {pricing.mode === "offer" && pricing.oldDisplay && (
                        <p className="text-[11px] text-slate-400 line-through">{pricing.oldDisplay}</p>
                      )}
                      <p className="text-sm font-semibold text-slate-800 sm:text-[15px]">
                        {pricing.display}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-slate-500 sm:text-sm">
                      <span>★</span>
                      <span>{(product.averageRate || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);