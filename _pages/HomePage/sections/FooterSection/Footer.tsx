import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import FooterColumn from './components/FooterColumn';
import FooterSocials from './components/FooterSocials';

// Dynamically import FloatingChat with SSR disabled
const FloatingChat = dynamic(
  () => import('@/components/UI/FloatingChat/FloatingChat'),
  { ssr: false }
);

type FooterSection = 'about' | 'links' | 'categories' | 'contact' | null;

const Footer = () => {
  const [openSection, setOpenSection] = useState<FooterSection>(null);

  const handleSectionToggle = (section: FooterSection) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isOpen = (section: FooterSection) => openSection === section;

  return (
    <footer className="relative w-full overflow-hidden bg-slate-900" dir="rtl">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-12 px-4 py-8 sm:py-12">
        
        {/* DESKTOP: 4-Column Grid */}
        <div className="hidden sm:grid gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* About Column */}
          <FooterColumn title="عن المنصة">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/logo2.png"
                alt="منصة شق الثعبان"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <span className="text-lg font-semibold text-white">منصة شق الثعبان</span>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              سوق احترافي للرخام والجرانيت والكوارتز يربطك بالموردين الموثوقين وأفضل الأسعار.
            </p>
            <div className="flex flex-wrap gap-2">
              {['موردين موثوقين', 'عروض متعددة', 'طلبات خاصة'].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </FooterColumn>

          {/* Quick Links Column */}
          <FooterColumn title="روابط سريعة">
            <nav className="flex flex-col gap-3 text-sm">
              <Link
                className="text-slate-300 transition hover:text-blue-400 font-medium"
                href="/"
              >
                الرئيسية
              </Link>
              <Link
                className="text-slate-300 transition hover:text-blue-400 font-medium"
                href="/products"
              >
                المنتجات
              </Link>
              <Link
                className="text-slate-300 transition hover:text-blue-400 font-medium"
                href="/inquiries"
              >
                طلباتك الخاصة
              </Link>
              <Link
                className="text-slate-300 transition hover:text-blue-400 font-medium"
                href="/marble-info"
              >
                ازاي تختار
              </Link>
              <Link
                className="text-slate-300 transition hover:text-blue-400 font-medium"
                href="/about"
              >
                من نحن
              </Link>
            </nav>
          </FooterColumn>

          {/* Categories Column */}
          <FooterColumn title="الفئات">
            <ul className="flex flex-col gap-3 text-sm text-slate-300">
              <li>
                <Link
                  className="transition hover:text-blue-400 font-medium"
                  href="/products?category=رخام%20مصري"
                >
                  رخام مصري
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-blue-400 font-medium"
                  href="/products?category=جرانيت%20مصري"
                >
                  جرانيت مصري
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-blue-400 font-medium"
                  href="/products?category=رخام%20مستورد"
                >
                  رخام مستورد
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-blue-400 font-medium"
                  href="/products?category=جرانيت%20مستورد"
                >
                  جرانيت مستورد
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-blue-400 font-medium"
                  href="/products?category=كوارتز"
                >
                  كوارتز
                </Link>
              </li>
            </ul>
          </FooterColumn>

          {/* Contact Column */}
          <FooterColumn title="تواصل معنا">
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <a
                className="transition hover:text-blue-400 font-medium"
                href="tel:+201204246538"
              >
                📞 +201204246538
              </a>
              <a
                className="transition hover:text-blue-400 font-medium"
                href="mailto:info@shak-elt3ban.com"
              >
                📧 info@shak-elt3ban.com
              </a>
              <a
                className="transition hover:text-blue-400 font-medium"
                href="https://wa.me/201204246538"
              >
                💬 واتساب مباشر
              </a>
            </div>
            <FooterSocials />
          </FooterColumn>
        </div>

        {/* MOBILE: Accordion System */}
        <div className="sm:hidden space-y-3">
          
          {/* About Section */}
          <AccordionSection
            title="عن المنصة"
            isOpen={isOpen('about')}
            onToggle={() => handleSectionToggle('about')}
          >
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/logo2.png"
                alt="منصة شق الثعبان"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-base font-semibold text-white">منصة شق الثعبان</span>
            </div>
            <p className="text-sm leading-6 text-slate-300 mb-4">
              سوق احترافي للرخام والجرانيت والكوارتز يربطك بالموردين الموثوقين.
            </p>
            <div className="flex flex-wrap gap-2">
              {['موردين موثوقين', 'عروض متعددة', 'طلبات خاصة'].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </AccordionSection>

          {/* Links Section */}
          <AccordionSection
            title="روابط سريعة"
            isOpen={isOpen('links')}
            onToggle={() => handleSectionToggle('links')}
          >
            <nav className="flex flex-col gap-3">
              {[
                { label: 'الرئيسية', href: '/' },
                { label: 'المنتجات', href: '/products' },
                { label: 'طلباتك الخاصة', href: '/inquiries' },
                { label: 'ازاي تختار', href: '/marble-info' },
                { label: 'من نحن', href: '/about' },
              ].map((item) => (
                <Link
                  key={item.href}
                  className="text-slate-300 transition hover:text-blue-400 font-medium text-sm"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </AccordionSection>

          {/* Categories Section */}
          <AccordionSection
            title="الفئات"
            isOpen={isOpen('categories')}
            onToggle={() => handleSectionToggle('categories')}
          >
            <ul className="flex flex-col gap-3">
              {[
                { name: 'رخام مصري', query: 'رخام%20مصري' },
                { name: 'جرانيت مصري', query: 'جرانيت%20مصري' },
                { name: 'رخام مستورد', query: 'رخام%20مستورد' },
                { name: 'جرانيت مستورد', query: 'جرانيت%20مستورد' },
                { name: 'كوارتز', query: 'كوارتز' },
              ].map((cat) => (
                <li key={cat.query}>
                  <Link
                    className="text-slate-300 transition hover:text-blue-400 font-medium text-sm"
                    href={`/products?category=${cat.query}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          {/* Contact Section */}
          <AccordionSection
            title="تواصل معنا"
            isOpen={isOpen('contact')}
            onToggle={() => handleSectionToggle('contact')}
          >
            <div className="flex flex-col gap-3 mb-4">
              <a
                className="text-slate-300 transition hover:text-blue-400 font-medium text-sm flex items-center gap-2"
                href="tel:+201204246538"
              >
                📞 +201204246538
              </a>
              <a
                className="text-slate-300 transition hover:text-blue-400 font-medium text-sm flex items-center gap-2"
                href="mailto:info@shak-elt3ban.com"
              >
                📧 info@shak-elt3ban.com
              </a>
              <a
                className="text-slate-300 transition hover:text-blue-400 font-medium text-sm flex items-center gap-2"
                href="https://wa.me/201204246538"
              >
                💬 واتساب مباشر
              </a>
            </div>
            <FooterSocials />
          </AccordionSection>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400 space-y-2">
          <p>© 2026 جميع الحقوق محفوظة لمنصة شق الثعبان</p>
          <p>رقم التسجيل الضريبى: ٧٧٣٩٠٢٦٥١</p>
          <div className="flex justify-center text-xs pt-2">
            <Link href="/policies" className="hover:text-slate-300 transition">
              سياسات المنصه
            </Link>
          </div>
        </div>
      </div>

      <FloatingChat isOpen={false} onOpenChange={() => {}} />
    </footer>
  );
};

// ============ ACCORDION SECTION COMPONENT ============
function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 sm:py-3 bg-slate-800 hover:bg-slate-700 transition-colors text-white font-semibold text-left"
        aria-expanded={isOpen}
        aria-controls={`accordion-${title}`}
      >
        <span className="text-sm sm:text-base">{title}</span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={`accordion-${title}`}
          className="px-4 py-4 bg-slate-850 text-slate-300 text-center"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default React.memo(Footer);