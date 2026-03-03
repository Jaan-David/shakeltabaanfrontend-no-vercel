"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  buildProductFaqByCategory,
  buildProductBadgesByCategory,
  getCategoryContentById,
  getCategoryRelatedLinks,
} from "@/lib/categoryContentMap";

export type Spec = { label: string; value: string };

type Product = {
  name?: string;
  category?: string;
  color?: string;
  origin?: string;
  withInstallation?: boolean;
  qualityGrade?: string;
  isOffer?: boolean;
};

type Props = {
  specs?: Spec[];
  product?: Product;
};

const AccordionItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-sm h-fit">
      <button
        onClick={onClick}
        className="w-full px-4 py-3 text-right flex items-start justify-between gap-3"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 text-right flex-1">
          {question}
        </h3>
        <ChevronDown
          size={20}
          className={`text-slate-500 transition-transform duration-300 ml-3 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-4 pb-4 text-right text-sm sm:text-base text-slate-600 leading-7">
          {answer}
        </p>
      </div>
    </div>
  );
};

const RelatedLinks: React.FC<{ category?: string }> = ({ category }) => {
  const relatedLinks = useMemo(() => getCategoryRelatedLinks(category), [category]);

  const grouped = useMemo(() => {
    return relatedLinks.reduce<Record<string, typeof relatedLinks>>((acc, link) => {
      if (!acc[link.group]) acc[link.group] = [];
      acc[link.group].push(link);
      return acc;
    }, {});
  }, [relatedLinks]);

  return (
    <section className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 mt-8" dir="rtl">
      <h3 className="text-right text-lg font-bold text-slate-900 mb-5">
        روابط تساعدك في اختيار أفضل
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(grouped).map(([groupTitle, items]) => (
          <div key={groupTitle} className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">{groupTitle}</h4>
            <ul className="space-y-2.5">
              {items.map((link) => (
                <li key={`${groupTitle}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-sm sm:text-base text-slate-700 hover:text-blue-700 underline-offset-4 hover:underline transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const Specs: React.FC<Props> = ({ specs, product }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const categoryContent = useMemo(
    () => getCategoryContentById(product?.category),
    [product?.category]
  );

  const faqList = useMemo(
    () =>
      buildProductFaqByCategory({
        category: product?.category,
        productName: product?.name,
        color: product?.color,
        origin: product?.origin,
        withInstallation: product?.withInstallation,
      }),
    [
      product?.category,
      product?.name,
      product?.color,
      product?.origin,
      product?.withInstallation,
    ]
  );

  const categoryBadges = useMemo(
    () =>
      buildProductBadgesByCategory({
        category: product?.category,
        withInstallation: product?.withInstallation,
        isOffer: product?.isOffer,
      }),
    [product?.category, product?.withInstallation, product?.isOffer]
  );

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  if (!specs?.length && !product?.name && faqList.length === 0) {
    return null;
  }

  return (
    <>
      {specs && specs.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6" dir="rtl">
          <h2 className="text-right text-lg sm:text-xl font-bold text-slate-900 mb-4">
            مواصفات المنتج
          </h2>
          <ul className="text-right list-disc list-inside space-y-2.5 text-slate-600 leading-relaxed">
            {specs.map((s, idx) => {
              const line = s.value?.trim() ? `${s.value}` : `${s.label}`;
              return (
                <li key={idx} className="marker:text-slate-400">
                  <span className="text-sm sm:text-base">{line}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {categoryContent && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6" dir="rtl">
          <h2 className="text-right text-lg sm:text-xl font-bold text-slate-900 mb-2">
            {categoryContent.title}
          </h2>
          <p className="text-right text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
            {categoryContent.shortDescription}
          </p>
          <p className="text-right text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
            {categoryContent.longDescription}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">أهم المميزات</h3>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {categoryContent.keyFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">أفضل الاستخدامات</h3>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {categoryContent.bestUsedFor.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
              <span className="text-slate-500">التحمل:</span> {categoryContent.durabilityLevel}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
              <span className="text-slate-500">السعر:</span> {categoryContent.priceLevel}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
              <span className="text-slate-500">الصيانة:</span> {categoryContent.maintenanceLevel}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
              <span className="text-slate-500">النوع:</span> {categoryContent.originType === "natural" ? "طبيعي" : "هندسي"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryBadges.map((badge) => (
              <span key={badge} className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 text-xs sm:text-sm">
                {badge}
              </span>
            ))}
          </div>
        </section>
      )}

      {faqList.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6" dir="rtl">
          <div className="mb-6">
            <h2 className="text-right text-lg sm:text-xl font-bold text-slate-900 mb-2">
              الأسئلة الشائعة
            </h2>
            <p className="text-right text-sm sm:text-base text-slate-600">
              إجابات مبنية على فئة المنتج وخصائصه الفعلية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {faqList.map((item, idx) => (
              <AccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndexes.includes(idx)}
                onClick={() => toggleAccordion(idx)}
              />
            ))}
          </div>
        </section>
      )}

      {product?.name && getCategoryRelatedLinks(product.category).length > 0 && (
        <RelatedLinks category={product.category} />
      )}
    </>
  );
};

export default React.memo(Specs);
