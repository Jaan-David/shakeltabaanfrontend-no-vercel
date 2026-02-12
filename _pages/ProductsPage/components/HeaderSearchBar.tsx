import type { ChangeEvent } from "react";

interface HeaderSearchBarProps {
  value: string;
  placeholder?: string;
  ariaLabel?: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function HeaderSearchBar({
  value,
  placeholder = "ابحث عن رخام، جرانيت، كوارتز...",
  ariaLabel = "بحث المنتجات",
  onChange,
  onClear,
}: HeaderSearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path
            d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-blue-400"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="مسح البحث"
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-700"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="m18 6-12 12M6 6l12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
