"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomMedia } from "@/components/UI/Image/Images";
import PriceRow from "@/components/UI/Price/PriceRow";
import { cartService, checkProductUnitConflict } from "@/services/api/cart";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import Alert from "@/components/UI/Alert/alert";

// Import the FavoritesContext directly but mark it as client-side only
let FavoritesContext: any;

if (typeof window !== 'undefined') {
  FavoritesContext = require('@/services/favorites/FavoritesContext');
}

type Props = {
  id?: number | string;
  title?: string;
  description?: string;
  price?: number;
  imageList?: string[]; 
  rating?: number;
  ratingCount?: number;
  category?: string;
  stockQty?: number;
  isUNIT?: boolean;
  isKG?: boolean;
  isTON?: boolean;
  isLITER?: boolean;
  isCUBIC_METER?: boolean;
  // Marble/Granite specific fields
  pricePerLinearMeter?: number;
  pricePerCubicMeter?: number;
  offerLinearPrice?: number | null;
  offerCubicPrice?: number | null;
  color?: string;
  qualityGrade?: string;
  isOffer?: boolean;
  advProduct?: string[];
  organizationId?: string;
  organizationName?: string;
  createdBy?: string;
  averageRate?: number;
  createdAt?: string;
  updatedAt?: string;
  withInstallation?: boolean;
  minAmount?: number;
};

// Helper function to calculate price based on unit conversion
const calculatePriceForUnit = (basePrice: number, baseUnit: string, targetUnit: string): number => {
  // Define conversion rules
  const conversions: { [key: string]: { [key: string]: number } } = {
    'kg': {
      'kg': 1,
      'ton': 1000,  // 1 ton = 1000 kg, so price * 1000
    },
    'liter': {
      'liter': 1,
      'cubic_meter': 1000,  // 1 cubic meter = 1000 liters, so price * 1000
    },
  };

  // If same unit, return base price
  if (baseUnit === targetUnit) {
    return basePrice;
  }

  // Check if conversion exists
  if (conversions[baseUnit] && conversions[baseUnit][targetUnit]) {
    return basePrice * conversions[baseUnit][targetUnit];
  }

  // Default: return base price if no conversion rule exists
  return basePrice;
};

// Helper function to get base unit (the smallest unit available)
const getBaseUnit = (props: {
  isUNIT?: boolean;
  isKG?: boolean;
  isTON?: boolean;
  isLITER?: boolean;
  isCUBIC_METER?: boolean;
}): string => {
  // Prioritize smaller units as base
  if (props.isKG || props.isTON) return 'kg'; // KG is the base for weight
  if (props.isLITER || props.isCUBIC_METER) return 'liter'; // Liter is the base for volume
  if (props.isUNIT) return 'unit';
  return 'unit';
};

const Overview: React.FC<Props> = ({
  id = 0,
  title = "Product Title",
  description = "",
  price = 0,
  imageList = ["/placeholder-product.jpg"],
  rating = 0,
  ratingCount = 0,
  category = "غير محدد",
  stockQty = 0,
  isUNIT = false,
  isKG = false,
  isTON = false,
  isLITER = false,
  isCUBIC_METER = false,
  pricePerLinearMeter,
  pricePerCubicMeter,
  offerLinearPrice = null,
  offerCubicPrice = null,
  color,
  qualityGrade,
  isOffer = false,
  advProduct = [],
  organizationId,
  organizationName,
  createdBy,
  averageRate,
  createdAt,
  updatedAt,
  withInstallation,
  minAmount,
}) => {
  const safeMinAmount = useMemo(() => {
    const parsed = Number(minAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return 1;
    return parsed;
  }, [minAmount]);

  const [quantityInput, setQuantityInput] = useState<string>(String(safeMinAmount));
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const hasLinearPrice = [pricePerLinearMeter, offerLinearPrice]
    .some((value) => Number(value) > 0);
  const hasCubicPrice = [pricePerCubicMeter, offerCubicPrice]
    .some((value) => Number(value) > 0);
  const hasMarbleUnits = hasLinearPrice || hasCubicPrice;
  const hasAnyPrice = useMemo(() => {
    return [pricePerCubicMeter, offerCubicPrice, pricePerLinearMeter, offerLinearPrice]
      .some((value) => Number(value) > 0);
  }, [pricePerCubicMeter, offerCubicPrice, pricePerLinearMeter, offerLinearPrice]);
  const [selectedUnitType, setSelectedUnitType] = useState<'linear' | 'cubic'>(
    hasLinearPrice ? 'linear' : 'cubic'
  );

  const parsedQuantity = Number(quantityInput);
  const quantityValue = Number.isFinite(parsedQuantity) ? parsedQuantity : NaN;
  const isQuantityValid = Number.isFinite(quantityValue) && quantityValue >= safeMinAmount;
  
  // Define available units based on props - show related units together
  const unitOptions = React.useMemo(() => {
    const options: Array<{key: string, label: string}> = [];
    
    // If KG is available, also add TON option
    if (isKG) {
      options.push({ key: 'kg', label: 'كيلو' });
      options.push({ key: 'ton', label: 'طن' });
    }
    // If TON is available without KG, still add both
    else if (isTON) {
      options.push({ key: 'kg', label: 'كيلو' });
      options.push({ key: 'ton', label: 'طن' });
    }
    
    // If LITER is available, also add CUBIC_METER option
    if (isLITER) {
      options.push({ key: 'liter', label: 'لتر' });
      options.push({ key: 'cubic_meter', label: 'متر مكعب' });
    }
    // If CUBIC_METER is available without LITER, still add both
    else if (isCUBIC_METER) {
      options.push({ key: 'liter', label: 'لتر' });
      options.push({ key: 'cubic_meter', label: 'متر مكعب' });
    }
    
    // Add UNIT if specified
    if (isUNIT) {
      options.push({ key: 'unit', label: 'قطعة' });
    }
    
    return options.length > 0 ? options : [{ key: 'unit', label: 'قطعة' }];
  }, [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  useEffect(() => {
    setQuantityInput((prev) => {
      if (!prev) return String(safeMinAmount);
      const current = Number(prev);
      if (!Number.isFinite(current) || current < safeMinAmount) {
        return String(safeMinAmount);
      }
      return prev;
    });
    setQuantityError(null);
  }, [safeMinAmount]);

  const handleQuantityChange = (value: string) => {
    setQuantityInput(value);

    if (!value) {
      setQuantityError(null);
      return;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      setQuantityError(`الحد الأدنى للطلب: ${safeMinAmount} م²`);
      return;
    }

    if (numeric < safeMinAmount) {
      setQuantityError(`الحد الأدنى للطلب: ${safeMinAmount} م²`);
      return;
    }

    setQuantityError(null);
  };

  const handleQuantityBlur = () => {
    if (!quantityInput) {
      setQuantityInput(String(safeMinAmount));
      setQuantityError(null);
      return;
    }

    const numeric = Number(quantityInput);
    if (!Number.isFinite(numeric) || numeric < safeMinAmount) {
      setQuantityInput(String(safeMinAmount));
      setQuantityError(null);
    }
  };

  // Get the base unit for price calculation
  const baseUnit = useMemo(() => getBaseUnit({ isUNIT, isKG, isTON, isLITER, isCUBIC_METER }), 
    [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  const [selectedUnit, setSelectedUnit] = useState<string>(unitOptions[0]?.key || 'unit');
  
  // Calculate displayed price based on selected unit
  const displayedPrice = useMemo(() => {
    return calculatePriceForUnit(price, baseUnit, selectedUnit);
  }, [price, baseUnit, selectedUnit]);

  // Update selected unit if the first unit changes
  useEffect(() => {
    if (unitOptions.length > 0 && !unitOptions.some(u => u.key === selectedUnit)) {
      setSelectedUnit(unitOptions[0].key);
    }
  }, [unitOptions, selectedUnit]);

  useEffect(() => {
    if (hasLinearPrice) {
      setSelectedUnitType('linear');
    } else if (hasCubicPrice) {
      setSelectedUnitType('cubic');
    }
  }, [hasLinearPrice, hasCubicPrice]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loved, setLoved] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    
    cartService.getCart().catch(error => {
      console.error("Failed to fetch cart for validation:", error);
    });
  }, []);
  
  const favoritesContext = FavoritesContext ? FavoritesContext.useFavorites() : null;
  
  useEffect(() => {
    if (isClient && favoritesContext && id) {
      const { isFavorite } = favoritesContext;
      const favoriteStatus = isFavorite(id);
      setIsFavoriteState(favoriteStatus);
      setLoved(favoriteStatus);
    }
  }, [id, isClient, favoritesContext]);

  const availableUnits = React.useMemo(() => {
    const units: { [key: string]: string } = {};
    
    // If KG is available, also add TON option
    if (isKG) {
      units.kg = 'كيلو';
      units.ton = 'طن';
    }
    // If TON is available without KG, still add both
    else if (isTON) {
      // units.kg = 'كيلو';
      units.ton = 'طن';
    }
    
    // If LITER is available, also add CUBIC_METER option
    if (isLITER) {
      units.liter = 'لتر';
      units.cubic_meter = 'متر مكعب';
    }
    // If CUBIC_METER is available without LITER, still add both
    else if (isCUBIC_METER) {
      // units.liter = 'لتر';
      units.cubic_meter = 'متر مكعب';
    }
    
    // Add UNIT if specified
    if (isUNIT) {
      units.unit = 'قطعة';
    }
    
    return Object.keys(units).length > 0 ? units : { unit: 'قطعة' };
  }, [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  const handleUnitSelect = (key: string) => {
    if (key in availableUnits) {
      setSelectedUnit(key);
    }
  };

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  }, [imageList.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageList.length) % imageList.length
    );
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  }, [imageList.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  }, []);

  useEffect(() => {
    if (imageList.length <= 1 || isHovering || isManualNavigation) return;

    const autoPlayInterval = setInterval(() => {
      nextImage();
    }, 3000);

    return () => clearInterval(autoPlayInterval);
  }, [imageList.length, isHovering, isManualNavigation, nextImage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (imageList.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevImage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageList.length, nextImage, prevImage]);

  const handleAddToCart = async () => {
    if (stockQty === 0 || isAdding) return;
    
    const unitTypeToSend = hasMarbleUnits ? selectedUnitType : 'linear';
    const hasConflict = checkProductUnitConflict(String(id), unitTypeToSend);
    if (hasConflict) {
      return;
    }

    if (!isQuantityValid) {
      setQuantityError(`الحد الأدنى للطلب: ${safeMinAmount} م²`);
      return;
    }

    const quantityToSend = quantityValue;

    try {
      setIsAdding(true);
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const cartItemKey = `cart_item_${id}`;
      localStorage.setItem(cartItemKey, JSON.stringify({
        unitType: unitTypeToSend,
        unit: selectedUnit,
        quantity: quantityToSend
      }));

      await cartService.addToCart({
        productId: String(id),
        itemQty: quantityToSend,
        unitType: unitTypeToSend
      });
      
      await cartService.getCart();
      router.push("/cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isMounted) return;
    
    if (!isAuthenticated()) {
      setShowLoginAlert(true);
      return;
    }
    
    if (!favoritesContext) {
      setShowLoginAlert(true);
      return;
    }
    
    const newLovedState = !loved;
    setLoved(newLovedState);
    
    try {
      const { toggle } = favoritesContext;
      toggle({ 
        id, 
        name: title, 
        price, 
        image: imageList[0] || '/acessts/NoImage.jpg' 
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setLoved(!newLovedState);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    router.push(
      "/login?redirect=" + encodeURIComponent(window.location.pathname)
    );
  };

  const handleLoginCancel = () => {
    setShowLoginAlert(false);
  };

  return (
    <section className="bg-white max-w-6xl mx-auto rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 lg:order-2">
          <div
            className="w-full aspect-[16/9] lg:aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center relative border border-slate-200"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {!isMounted ? (
              <div className="h-full w-full animate-pulse bg-slate-200" />
            ) : (
              <CustomMedia
                src={imageList[currentImageIndex] || "/acessts/placeholder.svg"}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                fill
                objectFit="contain"
                priority={true}
                fallbackSrc="/acessts/placeholder.svg"
                className="w-full h-full transition-transform duration-700 ease-in-out hover:scale-105"
              />
            )}

            {imageList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {imageList.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {imageList.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative aspect-square rounded-lg border overflow-hidden transition-all ${
                    index === currentImageIndex
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <CustomMedia
                    src={img || "/acessts/placeholder.svg"}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    objectFit="cover"
                    fallbackSrc="/acessts/placeholder.svg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 lg:order-1 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {title}
            </h1>
            <button
              aria-label={loved ? "remove from wishlist" : "add to wishlist"}
              onClick={toggleFavorite}
              className={`p-2 rounded-full border transition-colors ${
                loved ? "text-blue-600 border-blue-600" : "text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              <Heart className={`w-5 h-5 ${loved ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-600">
              {category}
            </span>
            {isOffer && (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-sm font-semibold shadow-sm">
                عرض خاص
              </span>
            )}
          </div>

          {withInstallation === true && (
            <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200">
                    <span className="text-sm font-semibold text-green-700">✓</span>
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold text-green-900">
                    متاح تركيب بسعر منفصل
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    يتم تحديد سعر التركيب حسب الموقع ونوع الشغل.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(organizationName || organizationId) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">المورد</p>
              <p className="text-base font-semibold text-slate-900">
                {organizationName || organizationId}
              </p>
              {organizationId && organizationName && (
                <p className="mt-1 text-xs text-slate-500">معرف المورد: {organizationId}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
              <span className="text-slate-500">الفرز:</span> {qualityGrade ? (qualityGrade === 'first' ? 'أولى' : qualityGrade) : 'غير متاح'}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
              <span className="text-slate-500">اللون:</span> {color || 'غير متاح'}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-500">الاسعار</div>
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <span>★</span>
                <span className="text-slate-600">{rating.toFixed(1)}</span>
                <span className="text-slate-400">({ratingCount})</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <PriceRow
                label="سعر المتر المربع"
                price={pricePerCubicMeter}
                offerPrice={offerCubicPrice}
                unitLabel="م مربع"
                size="primary"
              />
              <PriceRow
                label="سعر المتر الطولي"
                price={pricePerLinearMeter}
                offerPrice={offerLinearPrice}
                unitLabel="م طولي"
                size="secondary"
              />
              {!hasAnyPrice && (
                <div className="text-sm text-slate-500">السعر عند الطلب</div>
              )}
            </div>

            {withInstallation && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <p className="text-sm font-semibold text-blue-700">خدمة التركيب متاحة</p>
                <p className="mt-1 text-xs text-slate-600">
                  سعر التركيب يحدد حسب الموقع والتفاصيل. سيتم التواصل لتحديد السعر النهائي.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={stockQty === 0 || isAdding}
                onClick={handleAddToCart}
              >
                أضف إلى السلة
              </button>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="quantity-input" className="text-sm text-slate-500">
                    الكمية
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="quantity-input"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={safeMinAmount}
                      value={quantityInput}
                      onChange={(event) => handleQuantityChange(event.target.value)}
                      onBlur={handleQuantityBlur}
                      className="w-28 sm:w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-describedby="quantity-hint"
                    />
                    <span className="text-sm font-semibold text-slate-600">م²</span>
                  </div>
                </div>
                <div id="quantity-hint" className="mt-2 text-xs text-slate-500">
                  الحد الأدنى للطلب: {safeMinAmount} م²
                </div>
                {quantityError && (
                  <div className="mt-1 text-xs text-rose-600">{quantityError}</div>
                )}
              </div>

              {!hasMarbleUnits && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(availableUnits).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleUnitSelect(key)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        selectedUnit === key
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {hasMarbleUnits && (
                <div className="flex flex-wrap gap-3">
                  {hasLinearPrice && (
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="radio"
                        checked={selectedUnitType === 'linear'}
                        onChange={() => setSelectedUnitType('linear')}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      المتر الطولي
                    </label>
                  )}
                  {hasCubicPrice && (
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="radio"
                        checked={selectedUnitType === 'cubic'}
                        onChange={() => setSelectedUnitType('cubic')}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      المتر مربع
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {description && (
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}

          {advProduct && advProduct.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-slate-900 font-bold text-sm mb-2">مميزات المنتج</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                {advProduct.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
          )}

          {(averageRate !== undefined || createdAt || updatedAt) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-slate-900 font-bold text-sm mb-2">معلومات إضافية</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {averageRate !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">متوسط التقييم:</span>
                    <span className="text-slate-900 font-semibold">{averageRate.toFixed(1)} / 5</span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ الإضافة:</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                )}
                {updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">آخر تحديث:</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(updatedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                )}
              </div>
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
              label: "إلغاء",
              onClick: handleLoginCancel,
              variant: "ghost",
            },
            {
              label: "تسجيل الدخول",
              onClick: handleLoginConfirm,
              variant: "primary",
            },
          ]}
          type="warning"
        />
      )}
    </section>
  );
};

export default React.memo(Overview);