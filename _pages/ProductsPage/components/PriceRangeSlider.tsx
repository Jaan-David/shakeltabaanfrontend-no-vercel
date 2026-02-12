import type { ChangeEvent } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  isDisabled?: boolean;
  onChange: (nextMin: number, nextMax: number) => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ar-EG").format(Math.round(value));

export default function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  isDisabled,
  onChange,
}: PriceRangeSliderProps) {
  const range = Math.max(max - min, 1);
  const minPercent = ((valueMin - min) / range) * 100;
  const maxPercent = ((valueMax - min) / range) * 100;

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMin = Math.min(Number(event.target.value), valueMax);
    onChange(nextMin, valueMax);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMax = Math.max(Number(event.target.value), valueMin);
    onChange(valueMin, nextMax);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>من {formatPrice(valueMin)}</span>
        <span>إلى {formatPrice(valueMax)}</span>
      </div>
      <div className="relative h-9">
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-slate-100" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-blue-600"
          style={{
            left: `${Math.min(minPercent, maxPercent)}%`,
            width: `${Math.max(maxPercent - minPercent, 0)}%`,
          }}
        />
        <input
          aria-label="الحد الأدنى للسعر"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMinChange}
          disabled={isDisabled}
          className="absolute left-0 top-0 h-9 w-full appearance-none bg-transparent accent-blue-600"
        />
        <input
          aria-label="الحد الأقصى للسعر"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMaxChange}
          disabled={isDisabled}
          className="absolute left-0 top-0 h-9 w-full appearance-none bg-transparent accent-blue-600"
        />
      </div>
    </div>
  );
}
