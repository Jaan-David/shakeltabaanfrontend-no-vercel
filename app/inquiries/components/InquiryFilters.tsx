const filters = [
  { value: "all", label: "الكل" },
  { value: "active", label: "نشط" },
  { value: "accepted", label: "مقبول" },
  { value: "ended", label: "منتهي" },
] as const;

interface InquiryFiltersProps {
  activeStatus: "all" | "active" | "accepted" | "ended";
  onChange: (status: "all" | "active" | "accepted" | "ended") => void;
  count: number;
}

export default function InquiryFilters({ activeStatus, onChange, count }: InquiryFiltersProps) {
  return (
    <div className="flex flex-1 items-center gap-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
            activeStatus === filter.value
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          {filter.label}
        </button>
      ))}
      <span className="ms-auto inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {count} نتيجة
      </span>
    </div>
  );
}
