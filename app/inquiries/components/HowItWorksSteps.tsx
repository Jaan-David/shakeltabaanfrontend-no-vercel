import { CheckCircle2, Factory, FileText } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "اكتب طلبك وارفع الصور",
    description: "صف احتياجك بدقة وارفق صور تساعد الموردين على الفهم.",
  },
  {
    icon: Factory,
    title: "استلم عروض الأسعار من المصانع",
    description: "الموردون يرسلون أفضل العروض حسب المواصفات المطلوبة.",
  },
  {
    icon: CheckCircle2,
    title: "اختر العرض المناسب وابدأ التنفيذ",
    description: "قارن العروض وابدأ التواصل المباشر بسهولة.",
  },
];

export default function HowItWorksSteps() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {steps.map((step) => (
        <div
          key={step.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <step.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
        </div>
      ))}
    </section>
  );
}
