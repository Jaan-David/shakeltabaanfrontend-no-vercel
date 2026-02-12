import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import FooterColumn from './components/FooterColumn';
import FooterSocials from './components/FooterSocials';

// Dynamically import FloatingChat with SSR disabled
const FloatingChat = dynamic(
  () => import('@/components/UI/FloatingChat/FloatingChat'),
  { ssr: false }
);

const Footer = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <footer className="relative w-full overflow-hidden bg-slate-900" dir="rtl">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
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
          </FooterColumn>

          <FooterColumn title="روابط سريعة">
            <nav className="flex flex-col gap-2 text-sm">
              <Link className="text-slate-300 transition hover:text-white" href="/">
                الرئيسية
              </Link>
              <Link className="text-slate-300 transition hover:text-white" href="/products">
                المنتجات
              </Link>
              <Link className="text-slate-300 transition hover:text-white" href="/inquiries">
                طلباتك الخاصة
              </Link>
              <Link className="text-slate-300 transition hover:text-white" href="/marble-info">
                ازاي تختار
              </Link>
              <Link className="text-slate-300 transition hover:text-white" href="/about">
                من نحن
              </Link>
            </nav>
          </FooterColumn>

          <FooterColumn title="الفئات">
            <ul className="flex flex-col gap-2 text-sm text-slate-300">
              <li>
                <Link className="transition hover:text-white" href="/products?category=رخام%20مصري">
                  رخام مصري
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/products?category=جرانيت%20مصري">
                  جرانيت مصري
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/products?category=رخام%20مستورد">
                  رخام مستورد
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/products?category=جرانيت%20مستورد">
                  جرانيت مستورد
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/products?category=كوارتز">
                  كوارتز
                </Link>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn title="تواصل معنا">
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <a className="transition hover:text-white" href="tel:+201204246538">
                +201204246538
              </a>
              <a className="transition hover:text-white" href="mailto:info@shak-elt3ban.com">
                info@shak-elt3ban.com
              </a>
              <a className="transition hover:text-white" href="https://wa.me/201204246538">
                واتساب مباشر
              </a>
            </div>
            <FooterSocials />
          </FooterColumn>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
          <p>2026 جميع الحقوق محفوظة</p>
          <p className="mt-2">رقم التسجيل الضريبى: ٧٧٣٩٠٢٦٥١</p>
        </div>
      </div>

      <FloatingChat isOpen={isChatOpen} onOpenChange={handleChatClose} />
    </footer>
  );
};

export default React.memo(Footer);


