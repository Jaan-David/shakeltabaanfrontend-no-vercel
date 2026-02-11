"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Nav/Header";
import Footer from "@/pages/HomePage/sections/FooterSection/Footer";
import FloatingChat from "@/components/UI/FloatingChat/FloatingChat";

interface Props {
  children: React.ReactNode;
}

const AppShell: React.FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const noHeaderFooterPaths = [
    "/login",
    "/active-code",
    "/register",
    "/reset-password",
  ];

  const shouldShowHeaderFooter = !noHeaderFooterPaths.some((path) =>
    pathname?.startsWith(path)
  );

  const shouldShowFloatingChat = ![
    "/login",
    "/active-code",
    "/register",
    "/reset-password",
  ].some((path) => pathname?.startsWith(path));

  return (
    <>
      {shouldShowHeaderFooter && isMounted && <Header />}
      <main className={shouldShowHeaderFooter ? "pt-[72px]" : ""}>
        {children}
      </main>
      {shouldShowHeaderFooter && <Footer />}
      {shouldShowFloatingChat && <FloatingChat />}
    </>
  );
};

export default AppShell;
