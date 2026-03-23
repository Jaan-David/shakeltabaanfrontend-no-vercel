interface QuickFilterItem {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface QuickFilterChipsProps {
  items: QuickFilterItem[];
}

export default function QuickFilterChips({ items }: QuickFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
            item.isActive
              ? "border-transparent bg-slate-800/90 text-slate-50 shadow-[0_8px_16px_rgba(15,23,42,0.18)]"
              : "border-transparent bg-white text-slate-500 shadow-[0_6px_14px_rgba(15,23,42,0.08)] hover:text-slate-700"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
