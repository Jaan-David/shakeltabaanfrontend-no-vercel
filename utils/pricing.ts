export type PriceUnitKey = "fixed" | "square" | "cubic" | "linear";

export type PricingMode = "offer" | "fixed" | "range" | "request";

export interface PricingInput {
  price?: number | string | null;
  offerPrice?: number | string | null;
  pricePerSquareMeter?: number | string | null;
  offerSquarePrice?: number | string | null;
  pricePerCubicMeter?: number | string | null;
  offerCubicPrice?: number | string | null;
  pricePerLinearMeter?: number | string | null;
  offerLinearPrice?: number | string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  priceOnRequest?: boolean;
  customPriceLabel?: string | null;
}

export interface ResolvePricingOptions {
  preferredOrder?: PriceUnitKey[];
  currencyLabel?: string;
  requestLabel?: string;
  rangeSeparator?: string;
  treatCubicAsSquare?: boolean;
}

export interface ResolvedPricing {
  mode: PricingMode;
  label: string;
  display: string;
  oldDisplay?: string;
  unitKey?: PriceUnitKey;
  unitLabel?: string;
  price?: number;
  oldPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  hasOffer: boolean;
}

const DEFAULT_ORDER: PriceUnitKey[] = ["square", "cubic", "linear", "fixed"];

const UNIT_LABELS: Record<PriceUnitKey, string> = {
  fixed: "",
  square: "م²",
  cubic: "م³",
  linear: "م طولي",
};

export const normalizePriceValue = (value?: number | string | null): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const formatPriceNumber = (value: number): string => {
  return value.toLocaleString("ar-EG", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = (value: number, currencyLabel = "ج"): string => {
  return `${formatPriceNumber(value)} ${currencyLabel}`;
};

export const formatPriceWithUnit = (
  value: number,
  unitLabel: string,
  currencyLabel = "ج"
): string => {
  if (!unitLabel) return formatCurrency(value, currencyLabel);
  return `${formatPriceNumber(value)} ${currencyLabel} / ${unitLabel}`;
};

const formatRange = (
  minPrice: number,
  maxPrice: number,
  currencyLabel = "ج",
  separator = " - "
): string => {
  return `${formatPriceNumber(minPrice)}${separator}${formatPriceNumber(maxPrice)} ${currencyLabel}`;
};

export const resolveProductPricing = (
  input: PricingInput,
  options?: ResolvePricingOptions
): ResolvedPricing => {
  const currencyLabel = options?.currencyLabel ?? "ج";
  const requestLabel = input.customPriceLabel?.trim() || options?.requestLabel || "السعر عند الطلب";
  const preferredOrder = options?.preferredOrder?.length ? options.preferredOrder : DEFAULT_ORDER;
  const treatCubicAsSquare = options?.treatCubicAsSquare ?? true;

  const squareBaseRaw = input.pricePerSquareMeter ?? (treatCubicAsSquare ? input.pricePerCubicMeter : null);
  const squareOfferRaw = input.offerSquarePrice ?? (treatCubicAsSquare ? input.offerCubicPrice : null);

  const fixedPrices: Record<PriceUnitKey, number | null> = {
    fixed: normalizePriceValue(input.price),
    square: normalizePriceValue(squareBaseRaw),
    cubic: normalizePriceValue(input.pricePerCubicMeter),
    linear: normalizePriceValue(input.pricePerLinearMeter),
  };

  const offerPrices: Record<PriceUnitKey, number | null> = {
    fixed: normalizePriceValue(input.offerPrice),
    square: normalizePriceValue(squareOfferRaw),
    cubic: normalizePriceValue(input.offerCubicPrice),
    linear: normalizePriceValue(input.offerLinearPrice),
  };

  for (const key of preferredOrder) {
    const offer = offerPrices[key];
    if (!offer) continue;

    const base = fixedPrices[key];
    const oldDisplay = base && base > offer ? formatPriceWithUnit(base, UNIT_LABELS[key], currencyLabel) : undefined;

    return {
      mode: "offer",
      label: "السعر",
      display: formatPriceWithUnit(offer, UNIT_LABELS[key], currencyLabel),
      oldDisplay,
      unitKey: key,
      unitLabel: UNIT_LABELS[key] || undefined,
      price: offer,
      oldPrice: base ?? undefined,
      hasOffer: true,
    };
  }

  for (const key of preferredOrder) {
    const base = fixedPrices[key];
    if (!base) continue;

    return {
      mode: "fixed",
      label: "السعر",
      display: formatPriceWithUnit(base, UNIT_LABELS[key], currencyLabel),
      unitKey: key,
      unitLabel: UNIT_LABELS[key] || undefined,
      price: base,
      hasOffer: false,
    };
  }

  const minPrice = normalizePriceValue(input.minPrice);
  const maxPrice = normalizePriceValue(input.maxPrice);

  if (
    minPrice &&
    maxPrice &&
    maxPrice >= minPrice &&
    !input.priceOnRequest
  ) {
    return {
      mode: "range",
      label: "نطاق السعر",
      display: formatRange(minPrice, maxPrice, currencyLabel, options?.rangeSeparator ?? " - "),
      minPrice,
      maxPrice,
      hasOffer: false,
    };
  }

  return {
    mode: "request",
    label: "السعر",
    display: requestLabel,
    hasOffer: false,
  };
};
