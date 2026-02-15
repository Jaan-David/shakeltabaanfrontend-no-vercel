import HeaderSearchBar from "./HeaderSearchBar";
import QuickFilterChips from "./QuickFilterChips";

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating_desc" | "newest";

interface ProductsHeaderProps {
  title: string;
  subtitle: string;
  search: string;
  resultCount: number;
  hasOffer: boolean;
  sortBy: SortOption;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onHasOfferChange: (value: boolean) => void;
  onSortChange: (value: SortOption) => void;
}

export default function ProductsHeader({
  title,
  subtitle,
  search,
  resultCount,
  hasOffer,
  sortBy,
  onSearchChange,
  onClearSearch,
  onHasOfferChange,
  onSortChange,
}: ProductsHeaderProps) {
  const chips = [
    {
      label: "رخام",
      isActive: search === "رخام",
      onClick: () => onSearchChange(search === "رخام" ? "" : "رخام"),
    },
    {
      label: "جرانيت",
      isActive: search === "جرانيت",
      onClick: () => onSearchChange(search === "جرانيت" ? "" : "جرانيت"),
    },
    {
      label: "كوارتز",
      isActive: search === "كوارتز",
      onClick: () => onSearchChange(search === "كوارتز" ? "" : "كوارتز"),
    },
    {
      label: "عروض",
      isActive: hasOffer,
      onClick: () => onHasOfferChange(!hasOffer),
    },
    {
      label: "الأكثر مبيعاً",
      isActive: sortBy === "rating_desc",
      onClick: () =>
        onSortChange(sortBy === "rating_desc" ? "relevance" : "rating_desc"),
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 shadow-sm md:px-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] lg:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-slate-600 md:text-base">{subtitle}</p>
        </div>

        <div className="lg:order-none">
          <div className="sticky top-16 z-10 sm:top-[110px] lg:static">
            <HeaderSearchBar
              value={search}
              onChange={onSearchChange}
              onClear={onClearSearch}
            />
          </div>
        </div>

        <div className="flex items-center justify-start lg:justify-end">
          <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700">
            {resultCount} منتج
          </span>
        </div>
      </div>

      <div className="mt-4">
        <QuickFilterChips items={chips} />
      </div>
    </section>
  );
}
