import type { ReactNode } from "react";

interface FilterSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function FilterSection({
  title,
  description,
  children,
}: FilterSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {description ? (
          <p className="text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
