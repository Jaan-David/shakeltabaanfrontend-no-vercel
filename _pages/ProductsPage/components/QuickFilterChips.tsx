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
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
            item.isActive
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
