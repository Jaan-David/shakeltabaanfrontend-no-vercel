import FilterSection from "./FilterSection";

type RatingOption = 0 | 3 | 4 | 4.5;

interface FilterSidebarProps {
  search: string;
  category: string;
  organization: string;
  ratingMin: RatingOption;
  hasOffer: boolean;
  categories: string[];
  organizations: string[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onRatingChange: (value: RatingOption) => void;
  onHasOfferChange: (value: boolean) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  search,
  category,
  organization,
  ratingMin,
  hasOffer,
  categories,
  organizations,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onOrganizationChange,
  onRatingChange,
  onHasOfferChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="space-y-4">
      <FilterSection title="البحث" description="اكتب اسم المنتج أو وصفه">
        <label className="block text-xs font-semibold text-slate-700">
          كلمة البحث
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث عن منتج..."
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
        />
      </FilterSection>

      <FilterSection title="التصنيف والمنظمة">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">كل التصنيفات</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              المنظمة
            </label>
            <select
              value={organization}
              onChange={(event) => onOrganizationChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">كل المنظمات</option>
              {organizations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="التقييم والعروض">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              أقل تقييم
            </label>
            <select
              value={ratingMin}
              onChange={(event) =>
                onRatingChange(Number(event.target.value) as RatingOption)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value={0}>الكل</option>
              <option value={3}>3 نجوم وأكثر</option>
              <option value={4}>4 نجوم وأكثر</option>
              <option value={4.5}>4.5 نجمة وأكثر</option>
            </select>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <span>عروض فقط</span>
            <span className="relative inline-flex h-5 w-9 items-center">
              <input
                type="checkbox"
                checked={hasOffer}
                onChange={(event) => onHasOfferChange(event.target.checked)}
                className="peer sr-only"
                aria-label="عروض فقط"
              />
              <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600" />
              <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-4" />
            </span>
          </label>
        </div>
      </FilterSection>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
        <span>عدد النتائج: {resultCount}</span>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          إعادة الضبط
        </button>
      </div>
    </div>
  );
}
