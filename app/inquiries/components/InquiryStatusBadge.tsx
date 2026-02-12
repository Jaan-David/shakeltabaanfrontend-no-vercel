interface InquiryStatusBadgeProps {
  status: "active" | "accepted" | "ended";
}

const statusConfig = {
  active: {
    label: "نشط",
    className: "border border-blue-200 bg-blue-50 text-blue-700",
  },
  accepted: {
    label: "مقبول",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  ended: {
    label: "منتهي",
    className: "border border-slate-200 bg-slate-100 text-slate-700",
  },
};

export default function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
