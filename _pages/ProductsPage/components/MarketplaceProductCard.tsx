"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { resolveProductPricing } from "@/utils/pricing";
import { CustomMedia } from "@/components/UI/Image/Images";
import Alert from "@/components/UI/Alert/alert";
import { useFavorites } from "@/services/favorites/FavoritesContext";
import type { Product as ApiProduct } from "@/services/api/products";
import styles from "./MarketplaceProductCard.module.css";

const PLACEHOLDER_SRC = "/acessts/NoImage.jpg";

type MarketplaceProductCardProps = {
  product: ApiProduct;
  imageSrc: string;
  hasOffer: boolean;
};

const toPriceNumber = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
};

export default function MarketplaceProductCard({
  product,
  imageSrc,
  hasOffer,
}: MarketplaceProductCardProps) {
  const router = useRouter();
  const { toggle, isFavorite } = useFavorites();

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [useContainFit, setUseContainFit] = useState(false);

  const productId = String(product._id || product.id || "");
  const favoriteKey = productId || product.name || imageSrc;
  const isLoved = isFavorite(favoriteKey);

  const supplierName =
    product.organizationName || product.organizationId || "مورد معتمد";

  const ratingValue = toPriceNumber(product.averageRate);
  const ratingCount = toPriceNumber(product.reviewSummary?.totalReviews);

  const priceState = useMemo(() => {
    return resolveProductPricing(
      {
        price: product.price,
        offerPrice: product.offerPrice,
        pricePerSquareMeter: product.pricePerSquareMeter ?? product.pricePerCubicMeter,
        offerSquarePrice: product.offerSquarePrice ?? product.offerCubicPrice,
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
  }, [product]);

  const badgeItems = useMemo(() => {
    const badges: Array<{ label: string; tone: "info" | "neutral" }> = [];

    if (product.withInstallation) {
      badges.push({ label: "تركيب متاح", tone: "info" });
    }

    if (product.qualityGrade) {
      const qualityLabel = product.qualityGrade === "first" ? "فرز أول" : product.qualityGrade;
      badges.push({ label: qualityLabel, tone: "neutral" });
    }

    if (product.color) {
      badges.push({ label: product.color, tone: "neutral" });
    }

    return badges.slice(0, 3);
  }, [product.withInstallation, product.qualityGrade, product.color]);

  useEffect(() => {
    setUseContainFit(false);
  }, [imageSrc]);

  const onImageLoad = useCallback((event: any) => {
    const target = (event?.currentTarget || event?.target) as
      | HTMLImageElement
      | null;
    if (!target) return;

    const naturalWidth = target.naturalWidth || 0;
    const naturalHeight = target.naturalHeight || 0;
    if (!naturalWidth || !naturalHeight) return;

    const isPortrait = naturalHeight > naturalWidth;
    const isSmall = naturalWidth < 420 || naturalHeight < 320;
    setUseContainFit(isPortrait || isSmall);
  }, []);

  const goToDetails = useCallback(() => {
    const slug = encodeURIComponent(productId || product.name || "");
    router.push(`/product/${slug}`);
  }, [productId, product.name, router]);

  const onFavoriteToggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      const { UserStorage } = require("@/services/auth/login");
      const user = UserStorage.getUser();

      if (!user) {
        setShowLoginAlert(true);
        return;
      }

      toggle({
        id: favoriteKey,
        name: product.name || "منتج",
        price: toPriceNumber(product.price),
        image: imageSrc,
      });
    },
    [favoriteKey, imageSrc, product.name, product.price, toggle]
  );

  const onItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToDetails();
      }
    },
    [goToDetails]
  );

  return (
    <>
      <article
        className={styles.card}
        role="button"
        tabIndex={0}
        onClick={goToDetails}
        onKeyDown={onItemKeyDown}
        aria-label={`فتح تفاصيل ${product.name || "المنتج"}`}
      >
        <div className={styles.imageBox}>
          <button
            type="button"
            className={`${styles.favoriteBtn} ${isLoved ? styles.favoriteBtnActive : ""}`}
            onClick={onFavoriteToggle}
            aria-label={isLoved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <Heart fill={isLoved ? "currentColor" : "none"} />
          </button>

          {hasOffer && <span className={styles.offerBadge}>عرض</span>}

          <span className={styles.categoryBadge}>{product.category || "غير محدد"}</span>

          <CustomMedia
            src={imageSrc || PLACEHOLDER_SRC}
            alt={product.name || "صورة المنتج"}
            fill
            objectFit={useContainFit ? "contain" : "cover"}
            className={styles.imageMedia}
            imageClassName={`${styles.image} ${useContainFit ? styles.imageContain : ""}`}
            fallbackSrc={PLACEHOLDER_SRC}
            loading="lazy"
            decoding="async"
            onLoad={onImageLoad}
          />
        </div>

        <div className={styles.body}>
          <h3 className={styles.name} title={product.name || "منتج"}>
            {product.name || "منتج"}
          </h3>

          <div className={styles.metaRow}>
            <span className={styles.supplier} title={supplierName}>
              {supplierName}
            </span>
            <span className={styles.rating}>
              <Star />
              {ratingValue.toFixed(1)}
              {ratingCount > 0 ? ` (${ratingCount})` : ""}
            </span>
          </div>

          <div className={styles.badgesRow}>
            {badgeItems.map((badge) => (
              <span
                key={badge.label}
                className={`${styles.smallBadge} ${
                  badge.tone === "neutral" ? styles.smallBadgeNeutral : ""
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>{priceState.label}</div>
            {priceState.mode === "offer" && priceState.oldDisplay ? (
              <div className={styles.oldPrice}>{priceState.oldDisplay}</div>
            ) : null}
            <div className={styles.priceValue}>{priceState.display}</div>
          </div>
        </div>
      </article>

      {showLoginAlert && (
        <Alert
          message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
          setClose={() => setShowLoginAlert(false)}
          buttons={[
            {
              label: "إلغاء",
              onClick: () => setShowLoginAlert(false),
              variant: "ghost",
            },
            {
              label: "تسجيل الدخول",
              onClick: () => {
                setShowLoginAlert(false);
                router.push(
                  "/login?redirect=" + encodeURIComponent(window.location.pathname)
                );
              },
              variant: "primary",
            },
          ]}
          type="warning"
        />
      )}
    </>
  );
}
