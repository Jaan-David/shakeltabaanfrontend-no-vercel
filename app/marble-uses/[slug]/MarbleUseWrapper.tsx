"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { marbleUseCategories, type MarbleUseCategory } from "../data";

const renderSection = (section: MarbleUseCategory["sections"][number]) => (
  <div
    key={section.title}
    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)]"
  >
    <h2 className="text-2xl font-semibold text-slate-900 mb-3">
      {section.title}
    </h2>
    <div className="space-y-3 text-slate-600 leading-relaxed">
      {section.content.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
    {section.bullets && section.bullets.length > 0 && (
      <ul className="mt-4 grid gap-2 text-sm text-slate-700">
        {section.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

interface MarbleUseWrapperProps {
  slug: string;
}

export default function MarbleUseWrapper({ slug }: MarbleUseWrapperProps) {
  const router = useRouter();
  
  const category = marbleUseCategories.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  const handleOrderNow = () => {
    router.push(
      `/inquiries?marbleType=${encodeURIComponent(category.title)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <section className="relative isolate h-[260px] overflow-hidden md:h-[360px]">
        <Image
          src={category.heroImage}
          alt={category.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-end px-4 pb-10">
          <div className="max-w-2xl text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-200">
              استخدامات الرخام
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">
              {category.title}
            </h1>
            <p className="mt-4 text-base text-slate-100 md:text-lg">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {category.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.06)]"
            >
              {highlight}
            </div>
          ))}
        </div>

        {/* Order Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleOrderNow}
            className="relative group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <span className="text-lg">⭐</span>
            <span>اطلب الآن</span>
            <svg
              className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform"
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
          </button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {category.sections.map(renderSection)}
        </div>

        {/* Image Gallery */}
        {category.sections.some((s) => s.images && s.images.length > 0) && (
          <div className="mt-16 border-t border-slate-300 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              معرض الصور
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.sections
                .flatMap((section) => section.images || [])
                .map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 shadow-[0_10px_25px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] hover:-translate-y-2"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={image}
                        alt={`${category.title} صورة ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
