"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { ArrowLeft, HelpCircle, Star, Zap, Users, BookOpen } from "lucide-react";
import { getPrimaryMedia } from "@/utils/media";
import Card from "@/components/UI/Card/Card";
import CategoriesGrid from "@/_pages/CategoriesPage/CategoriesGrid";
import { Category as CategoryType } from '@/services/product/categories';
import { productService } from '@/services/api/products';
import { ProfileService } from '@/services/profile/profile';
import { isUserAuthenticated } from '@/services/auth/login';

const PartnersSection = dynamicImport(
  () => import("@/_pages/HomePage/PartnersSection"),
  { ssr: false }
);

export const dynamic = 'force-dynamic';

export default function HomeContent() {
  const router = useRouter();
  
  const heroImage = {
    src: "/slider/1.jpg",
    alt: "صورة الرخام الرئيسية",
  };

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [userName, setUserName] = useState<string>('منصة شق الثعبان');
  const isMounted = useRef(false);

  const fixedCategories: CategoryType[] = [
    { id: "جرانيت مستورد", name: "جرانيت مستورد" },
    { id: "جرانيت مصرى", name: "جرانيت مصرى" },
    { id: "رخام مستورد", name: "رخام مستورد" },
    { id: "رخام مصرى", name: "رخام مصرى" },
    { id: "كوارتز", name: "كوارتز" },
    { id: "رخام مصنع", name: "رخام مصنع" },
    { id: "اعمال النحت", name: "اعمال النحت" },
  ];

  useEffect(() => {
    isMounted.current = true;
    const fetchUserProfile = async () => {
      // Only fetch profile if user is authenticated
      if (!isUserAuthenticated()) {
        return;
      }

      try {
        const response = await ProfileService.getProfile();
        const profileData = response?.data?.user;

        if (isMounted.current && profileData?.firstName) {
          const lastName = profileData.lastName ? ` ${profileData.lastName}` : '';
          setUserName(`مرحباً ${profileData.firstName}${lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
    
    if (isMounted.current) {
      setCategories(fixedCategories);
      setCategoriesLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Navigate to products page
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO SECTION ============ */}
      <HeroSection heroImage={heroImage} userName={userName} />

      {/* ============ CTA REQUEST SECTION ============ */}
      <CTARequestSection />

      {/* ============ CATEGORIES SECTION ============ */}
      <CategoriesSection
        categories={categories}
        categoriesLoading={categoriesLoading}
        onCategoryClick={handleCategoryClick}
      />

      {/* ============ MARBLE USES GUIDE SECTION ============ */}
      <MarbleUsesGuideSection />

      {/* ============ PARTNERS SECTION ============ */}
      <PartnersSection />
    </div>
  );
}

// ============ HERO SECTION COMPONENT ============
function HeroSection({
  heroImage,
  userName,
}: {
  heroImage: { src: string; alt: string };
  userName: string;
}) {
  return (
    <section
      className="relative w-full mb-8 sm:mb-12 md:mb-16 overflow-hidden bg-gradient-to-b from-blue-600 to-blue-500"
      aria-labelledby="hero-title"
    >
      {/* Background Image with Overlay */}
      <div className="relative w-full min-h-[56svh] max-h-[85svh] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          quality={60}
        />

        {/* Dark Gradient Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-bl from-black/80 via-black/55 to-black/35" />

        {/* Content Card */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 py-6"
          dir="rtl"
        >
          <div className="w-full max-w-sm sm:max-w-2xl space-y-3 sm:space-y-5 text-center">
            <div className="rounded-2xl bg-white/8 backdrop-blur-md px-4 py-5 sm:px-7 sm:py-7 shadow-lg border border-white/15 motion-safe:animate-fade-in">
            <h1
              id="hero-title"
              className="text-4xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-snug"
            >
              {userName || "منصة شق الثعبان"}
            </h1>

            <p className="mt-2 text-sm sm:text-lg text-white/85 drop-shadow-md max-w-sm sm:max-w-xl mx-auto">
              أفضل أنواع الرخام والجرانيت والكوارتز بأسعار منافسة وجودة عالية
            </p>

            {/* CTA Buttons */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center">
              {(() => {
                const baseButtonClass =
                  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 w-full sm:w-auto min-h-[50px] px-5 sm:px-8 py-3 sm:py-4 whitespace-nowrap sm:min-w-[190px] active:scale-[0.98]";
                const primaryClass =
                  `${baseButtonClass} bg-blue-600 hover:bg-blue-700 !text-white hover:!text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5`;
                const secondaryClass =
                  `${baseButtonClass} bg-white/10 hover:bg-white/15 !text-white hover:!text-white border border-white/50 shadow-sm hover:shadow-md text-sm sm:text-base`;
                const guidanceClass =
                  "inline-flex items-center justify-center gap-2 !text-white/95 hover:!text-white underline-offset-4 hover:underline transition-all duration-200 text-base sm:text-base px-2 py-1 active:scale-[0.98] mt-1 sm:mt-0";

                return (
                  <>
                    <Link href="/products" className={primaryClass}>
                      <Zap size={18} />
                      تصفح المنتجات
                    </Link>
                    <button
                      onClick={() => {
                        const element = document.getElementById('special-requests');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={secondaryClass}
                    >
                      <Star size={18} />
                      طلب خاص
                    </button>
                    <Link href="/marble-info" className={guidanceClass}>
                      ازاي تختار نوع رخامتك؟
                      <HelpCircle size={16} />
                    </Link>
                  </>
                );
              })()}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CTA REQUEST SECTION ============
interface CTAMode {
  type: 'supply' | 'installation';
  title: string;
  description: string;
  buttonText: string;
  buttonRoute: string;
  supportText: string;
  items: string[];
  buttonIcon?: string;
}

const CTA_MODES: Record<'supply' | 'installation', CTAMode> = {
  supply: {
    type: 'supply',
    title: 'اطلب خاماتك بالمواصفات',
    description: 'حدد احتياجاتك بدقة (المقاسات – الكمية – النوع – التشطيب) ونوصل طلبك مباشرةً لأفضل شركات التوريد.',
    buttonText: 'اطلب خامات أو توريد خاص',
    buttonRoute: '/inquiries',
    supportText: 'مناسب للمشاريع والكميات الكبيرة أو المقاسات الخاصة',
    items: [
      'تحديد مقاسات خاصة',
      'كميات كبيرة للمشاريع',
      'أفضل أسعار السوق',
      'استلام عروض خلال 24 ساعة',
    ],
  },
  installation: {
    type: 'installation',
    title: 'اطلب صنايعي لتنفيذ شغلك',
    description: 'حدد احتياجاتك بدقة (الموقع – نوع العمل – المساحة) ونوصل طلبك مباشرةً لأفضل الصنايعية المتخصصة.',
    buttonText: 'اطلب صنايعي لتنفيذ شغلك',
    buttonRoute: '/service-requests',
    supportText: 'لو محتاج تنفيذ أو تركيب في موقعك',
    items: [
      'تنفيذ احترافي وفني',
      'عمال متخصصين موثوقين',
      'ضمان على العمل',
      'استلام عروض خلال 24 ساعة',
    ],
  },
};

function CTARequestSection() {
  const [activeMode, setActiveMode] = useState<'supply' | 'installation'>('supply');
  const mode = CTA_MODES[activeMode];

  return (
    <section id="special-requests" className="px-4 py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-slate-50 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 md:p-12 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          
          {/* Segmented Toggle */}
          <div className="mb-8 flex items-center justify-center" dir="rtl">
            <div className="inline-flex rounded-full bg-slate-100 p-1 shadow-sm">
              <button
                onClick={() => setActiveMode('supply')}
                className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
                  activeMode === 'supply'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                aria-pressed={activeMode === 'supply'}
              >
                توريد خامات
              </button>
              <button
                onClick={() => setActiveMode('installation')}
                className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
                  activeMode === 'installation'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                aria-pressed={activeMode === 'installation'}
              >
                تنفيذ وتركيب
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:gap-12 md:grid-cols-2 items-center">
            
            {/* Content */}
            <div className="flex flex-col gap-6" dir="rtl">
              {/* Main Title */}
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-3xl sm:text-4xl md:text-[2.5rem] font-bold text-slate-900 leading-tight">
                  {mode.title}
                </h2>
                
                {/* Description - Improved Copy */}
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-3.5">
                {mode.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    {/* Check Icon */}
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-1 group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {/* Text */}
                    <span className="text-sm sm:text-base text-slate-700 font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="pt-3 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Zap size={16} className="text-blue-600 flex-shrink-0" />
                  <span>استجابة سريعة</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-blue-600 flex-shrink-0" />
                  <span>موثوق</span>
                </div>
              </div>
            </div>

            {/* CTA Area */}
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Primary CTA Button */}
              <Link
                href={mode.buttonRoute}
                className="group relative inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px] sm:min-h-[56px]"
                aria-label={mode.buttonText}
              >
                <span className="text-base sm:text-lg font-semibold">{mode.buttonText}</span>
                <ArrowLeft
                  size={20}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              {/* Micro-copy Under Button */}
              <p className="text-xs sm:text-sm text-slate-500 text-right leading-relaxed">
                {mode.supportText}
              </p>

              {/* Secondary CTA For Other Mode */}
              {activeMode === 'supply' ? (
                <Link
                  href="/service-requests"
                  className="group relative inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border-2 border-slate-300 hover:border-blue-400 text-slate-900 hover:text-blue-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px] sm:min-h-[56px] mt-2"
                  aria-label="أو اطلب صنايعي"
                >
                  <span className="text-base sm:text-lg">أو اطلب صنايعي</span>
                </Link>
              ) : (
                <Link
                  href="/inquiries"
                  className="group relative inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border-2 border-slate-300 hover:border-blue-400 text-slate-900 hover:text-blue-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px] sm:min-h-[56px] mt-2"
                  aria-label="أو اطلب خامات"
                >
                  <span className="text-base sm:text-lg">أو اطلب خامات</span>
                </Link>
              )}

              {/* Support Footer */}
              <p className="text-xs text-slate-500 text-center pt-3 border-t border-slate-200 mt-3">
                بدون أي التزامات • رد خلال 24 ساعة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CATEGORIES SECTION ============
function CategoriesSection({
  categories,
  categoriesLoading,
  onCategoryClick,
}: {
  categories: CategoryType[];
  categoriesLoading: boolean;
  onCategoryClick: (id: string, name: string) => void;
}) {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4" aria-labelledby="categories-title">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 sm:mb-12 md:mb-16 text-center space-y-2 sm:space-y-3">
          <h2 id="categories-title" className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            اكتشف المنتجات
          </h2>
          <p className="text-lg sm:text-xl text-slate-600">
            استكشف أنواع الرخام والجرانيت المختلفة
          </p>
          <p className="text-sm sm:text-base text-slate-500">
            اختر من الفئات أدناه لاكتشاف منتجاتنا الرائعة
          </p>
        </div>

        {/* Grid */}
        <CategoriesGrid
          categories={categories}
          onCategoryClick={onCategoryClick}
          isLoading={categoriesLoading}
        />
      </div>
    </section>
  );
}

// ============ MARBLE USES GUIDE SECTION ============
function MarbleUsesGuideSection() {
  const marbleGuides = [
    {
      title: "رخام المطابخ",
      description: "اختر أفضل أنواع الرخام والكوارتز والجرانيت لمطبخك بأسعار منافسة",
      link: "/marble-uses/rokhama-almatabekh",
      icon: "🍳",
    },
    {
      title: "أرضيات رخام",
      description: "دليل شامل لأنواع الرخام المناسبة لأرضيات المنازل والعقارات",
      link: "/marble-uses/ardiat-rokham",
      icon: "🏠",
    },
    {
      title: "الرخام في الحمامات",
      description: "حلول مثالية للحمامات بتصاميم عصرية وراقية وتشطيبات فاخرة",
      link: "/marble-uses/rokham-hammam",
      icon: "🚿",
    },
    {
      title: "رخام السلالم",
      description: "أنواع رخام متينة وآمنة للسلالم بتصاميم عصرية",
      link: "/marble-uses/rokham-salalem",
      icon: "🪜",
    },
    {
      title: "المطابخ المودرن",
      description: "تصاميم مطابخ عصرية مع خامات حديثة وألوان متنوعة",
      link: "/marble-uses/khammat-matbekh-maodern",
      icon: "✨",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-slate-50 to-white" aria-labelledby="guides-title">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 sm:mb-12 md:mb-16 text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h2 id="guides-title" className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
              دليل استخدام الرخام
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-slate-600">
            أدلة شاملة لاختيار أفضل أنواع الرخام لحاجاتك
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {marbleGuides.map((guide, index) => (
            <Link
              key={index}
              href={guide.link}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{guide.icon}</div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {guide.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>اعرف أكثر</span>
                <ArrowLeft size={16} />
              </div>

              {/* Hover Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}