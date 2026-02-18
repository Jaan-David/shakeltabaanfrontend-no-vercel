"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  href?: string;
<<<<<<< HEAD
  marbleType?: string;
  onOrderClick?: (marbleType: string) => void;
=======
  marbleType: string;
  detailsLabel?: string;
  onDetailsClick?: () => void;
  orderLabel?: string;
  onOrderClick: () => void;
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f
}

export default function CategoryCard({
  title,
  description,
  image,
  href,
  marbleType,
<<<<<<< HEAD
  onOrderClick,
}: CategoryCardProps) {
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href && marbleType && onOrderClick) {
      e.preventDefault();
      onOrderClick(marbleType);
    }
  };

  return (
    <Link
      href={href || "#"}
      onClick={handleCardClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 hover:-translate-y-2"
      aria-label={title}
    >
      {/* Enhanced Shadow with gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />
      
      {/* Shadow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-100 to-slate-100 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 -z-10" />
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
=======
  detailsLabel,
  onDetailsClick,
  orderLabel,
  onOrderClick,
}: CategoryCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full">
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f
        <Image
          src={image}
          alt={title}
          fill
<<<<<<< HEAD
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={false}
        />
        
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-6 relative z-20">
        <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 group-hover:text-slate-700 transition-colors duration-300">
          {description}
        </p>
        
        {/* CTA */}
        <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-all duration-300">
          <span>{href ? "اكتشف المزيد" : "اطلب الآن"}</span>
          <svg
            className="w-4 h-4 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
=======
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
>>>>>>> 591654581c9211810a9184a2bee06a356166f53f
  );
}
