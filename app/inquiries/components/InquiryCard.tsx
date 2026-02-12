import InquiryStatusBadge from "./InquiryStatusBadge";
import type { Inquiry } from "@/services/api/inquiry";

interface InquiryCardProps {
  inquiry: Inquiry;
  onViewDetails: () => void;
  onViewOffers: () => void;
}

export default function InquiryCard({ inquiry, onViewDetails, onViewOffers }: InquiryCardProps) {
  const title = inquiry.name?.trim() || "طلب خاص";
  const hasOffers = inquiry.reply.length > 0;
  const offerCount = inquiry.reply.length;
  const previewImage = inquiry.imageList?.[0];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h3>
            <InquiryStatusBadge status={inquiry.status} />
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600 md:text-base">
            {inquiry.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>تاريخ الإرسال: {new Date(inquiry.createdAt).toLocaleDateString("ar-EG")}</span>
            <span>عدد العروض: {offerCount}</span>
            <span className={hasOffers ? "text-emerald-600" : "text-slate-400"}>
              {hasOffers ? "تم استلام عروض" : "بانتظار عروض الموردين"}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-row items-center gap-3 md:w-auto md:flex-col">
          <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {previewImage ? (
              <img
                src={previewImage}
                alt="معاينة الطلب"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/acessts/NoImage.jpg";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                بدون صور
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 md:w-32">
            <button
              onClick={onViewDetails}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              عرض التفاصيل
            </button>
            <button
              onClick={onViewOffers}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              مشاهدة العروض
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
