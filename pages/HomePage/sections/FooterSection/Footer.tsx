import React, { useState } from 'react';
import ContactSection from '@/pages/HomePage/sections/FooterSection/Sections/ContactSection/ContactSection';
import QuickLinks from '@/pages/HomePage/sections/FooterSection/Sections/QuickLinksSection/QuickLinks';
import CategoriesSection from '@/pages/HomePage/sections/FooterSection/Sections/CategoriesSection/CategoriesSection';
import AboutUsSection from '@/pages/HomePage/sections/FooterSection/Sections/AboutUsSection/AboutUsSection';
import dynamic from 'next/dynamic';

// Dynamically import FloatingChat with SSR disabled
const FloatingChat = dynamic(
  () => import('@/components/UI/FloatingChat/FloatingChat'),
  { ssr: false }
);

const Footer = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleContactClick = () => {
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <footer className="relative w-full min-h-[300px] md:min-h-[400px] overflow-hidden bg-[#0F172A]">
      {/* Background - Deep Navy Blue for strong luxury contrast */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-full h-full bg-[#0F172A]"></div>
      </div>
      <div className="absolute top-0 left-1/2 w-[90%] h-px bg-white/10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col mt-[-20px]" >
        
        {/* Main Footer Content */}
        <div className="w-full lg:w-[93%] mx-auto flex-1 flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-4 py-8">
          <AboutUsSection /> 
          <CategoriesSection />
          <QuickLinks onContactClick={handleContactClick} />
          <ContactSection />
        </div>
           
        {/* Copyright */}
        <div className="w-full py-4 border-t border-white/10 text-center mb-[120px] relative">
          <div className="absolute top-0 left-1/2 w-[90%] h-px bg-white/10 -translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-white font-beiruti font-medium text-sm">
            2026 جميع الحقوق محفوظة
          </p>
          <p className="text-white font-beiruti font-medium text-sm mt-2">
            رقم التسجيل الضريبى: ٧٧٣٩٠٢٦٥١
          </p>
        </div>
      </div>
      
      {/* Floating Chat */}
      <FloatingChat 
        isOpen={isChatOpen} 
        onOpenChange={handleChatClose}
      />
    </footer>
  );
};

export default React.memo(Footer);


