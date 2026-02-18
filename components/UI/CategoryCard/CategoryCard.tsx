"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  href?: string;
  marbleType: string;
  detailsLabel?: string;
  onDetailsClick?: () => void;
  orderLabel?: string;
  onOrderClick: () => void;
}

export default function CategoryCard({
  title,
  description,
  image,
  href,
  marbleType,
  detailsLabel,
  onDetailsClick,
  orderLabel,
  onOrderClick,
}: CategoryCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug">
            {title}
          </h3>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {marbleType}
          </span>
        </div>
        <p className="mb-6 text-sm text-slate-600 leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3">
          {onDetailsClick ? (
            <button
              type="button"
              onClick={onDetailsClick}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {detailsLabel || "تفاصيل أكثر"}
              <span aria-hidden="true">→</span>
            </button>
          ) : href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              اعرف المزيد
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-500">تفاصيل أكثر</span>
          )}
          <button
            type="button"
            onClick={onOrderClick}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={`${orderLabel || "اطلب الآن"} ${marbleType}`}
          >
            {orderLabel || "اطلب الآن"}
          </button>
        </div>
      </div>
    </article>
  );
}
