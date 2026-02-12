import React from 'react';

interface PriceRowProps {
  label: string;
  price?: string | number | null;
  offerPrice?: string | number | null;
  unitLabel: string;
  size?: 'primary' | 'secondary';
  showPlaceholder?: boolean;
}

const normalizePrice = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return Number.isFinite(value) && value > 0 ? value : null;
};

const formatPrice = (value: number): string => value.toLocaleString('ar-EG');

export default function PriceRow({
  label,
  price,
  offerPrice,
  unitLabel,
  size = 'primary',
  showPlaceholder = false,
}: PriceRowProps) {
  const basePrice = normalizePrice(price);
  const discountedPrice = normalizePrice(offerPrice);

  if (!basePrice && !discountedPrice) {
    if (!showPlaceholder) return null;
    
    // Show placeholder when price is unavailable
    const labelSize = size === 'primary' ? 'text-sm' : 'text-xs';
    return (
      <div className="flex items-start justify-between gap-3 py-2 opacity-50">
        <div className="flex-shrink-0">
          <p className={`${labelSize} font-semibold text-slate-600`}>{label}</p>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-slate-400">—</p>
        </div>
      </div>
    );
  }

  const showOffer = !!(basePrice && discountedPrice && discountedPrice < basePrice);
  const displayPrice = showOffer ? discountedPrice : (basePrice ?? discountedPrice);

  const savingsPercent = showOffer && basePrice
    ? Math.round(((basePrice - (discountedPrice || 0)) / basePrice) * 100)
    : 0;

  const priceSize = size === 'primary' ? 'text-2xl' : 'text-xl';
  const labelSize = size === 'primary' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-shrink-0">
        <p className={`${labelSize} font-semibold text-slate-600`}>{label}</p>
      </div>
      <div className="text-left flex flex-col gap-1.5">
        {showOffer && basePrice && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-400 line-through font-medium">
              {formatPrice(basePrice)} ج.م
            </p>
            {savingsPercent > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                -{savingsPercent}%
              </span>
            )}
          </div>
        )}
        <div className="flex items-baseline gap-1.5">
          <p className={`${priceSize} font-black ${
            showOffer ? 'text-red-600' : 'text-blue-600'
          }`}>
            {formatPrice(displayPrice ?? 0)}
          </p>
          <span className="text-xs font-semibold text-slate-500">ج.م / {unitLabel}</span>
        </div>
      </div>
    </div>
  );
}
