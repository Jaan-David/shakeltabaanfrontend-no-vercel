import { ShieldCheck, Sparkles, Users } from "lucide-react";

interface InquiriesHeaderProps {
  title: string;
  subtitle: string;
}

const trustItems = [
  {
    icon: ShieldCheck,
    label: "بياناتك محفوظة ومشفرة",
  },
  {
    icon: Users,
    label: "تواصل مباشر مع مقدمي الخدمة",
  },
  {
    icon: Sparkles,
    label: "اختيارات متعددة بسرعة",
  },
];

export default function InquiriesHeader({ title, subtitle }: InquiriesHeaderProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
          <p className="mt-2 text-base text-slate-600 md:text-lg">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              <item.icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
