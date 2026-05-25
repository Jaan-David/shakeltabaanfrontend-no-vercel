import { useState } from "react";
import Image from "next/image";
import InquiryStatusBadge from "../../inquiries/components/InquiryStatusBadge";
import type { Inquiry } from "@/services/api/inquiry";
import { Api } from "@/services/api/endpoints";

const API_IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || Api)
  .replace(/\/app\/v1\/?$/, "")
  .replace(/\/+$/, "");

const resolveInquiryImage = (value?: string | null): string | null => {
  if (!value?.trim()) return null;

  const normalized = value.trim().replace(/\\/g, "/");
  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return encodeURI(normalized);
  }

  const cleaned = normalized.replace(/^\/+/, "").replace(/^public\//i, "");
  if (!cleaned) return null;

  return encodeURI(`${API_IMAGE_BASE_URL}/${cleaned}`);
};

interface ServiceRequestCardProps {
  request: Inquiry;
  onViewDetails: () => void;
  onViewOffers: () => void;
}

export default function ServiceRequestCard({ request, onViewDetails, onViewOffers }: ServiceRequestCardProps) {
  const firstLine = request.description?.trim().split('\n')[0];
  const title = firstLine || "طلب خدمة";
  const replies = Array.isArray(request.reply) ? request.reply : [];
  const hasOffers = replies.length > 0;
  const offerCount = replies.length;
  const previewImage = resolveInquiryImage(request.imageList?.[0]);
  const [previewError, setPreviewError] = useState(false);
  const previewSrc = previewError ? "/acessts/NoImage.jpg" : previewImage;
  const details = [
    request.materialType?.trim() || "غير محدد",
    typeof request.quantity === "number" ? `الكمية: ${request.quantity}` : null,
    typeof request.installationRequired === "boolean" ? `التركيب: ${request.installationRequired ? "نعم" : "لا"}` : null,
    request.address?.trim() ? request.address.trim() : null,
  ].filter(Boolean) as string[];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h3>
            <InquiryStatusBadge status={request.status} />
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600 md:text-base">
            {request.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>تاريخ الإرسال: {new Date(request.createdAt).toLocaleDateString("ar-EG")}</span>
            <span>عدد العروض: {offerCount}</span>
            <span className={hasOffers ? "text-emerald-600" : "text-slate-400"}>
              {hasOffers ? "تم استلام عروض" : "بانتظار عروض من مقدمي الخدمة"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.slice(0, 4).map((detail) => (
              <span key={detail} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {detail}
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-row items-center gap-3 md:w-auto md:flex-col">
          <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt="معاينة الطلب"
                width={80}
                height={80}
                sizes="80px"
                className="h-full w-full object-cover"
                onError={() => setPreviewError(true)}
                unoptimized
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
