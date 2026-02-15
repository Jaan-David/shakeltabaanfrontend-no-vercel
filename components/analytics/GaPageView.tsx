"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GtagEventParams = {
  page_path: string;
  page_location: string;
  page_title: string;
};

type GtagFunction = (event: "event", action: "page_view", params: GtagEventParams) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

const GA_MEASUREMENT_ID = "G-8V17H7W98Z";

export default function GaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    const pageLocation = `${window.location.origin}${pagePath}`;
    const pageTitle = document.title;

    // Guard in case gtag is not ready yet.
    if (typeof window.gtag !== "function") return;

    // Send GA4 page_view event on route change.
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: pageTitle,
    });
  }, [pathname, searchParams]);

  return null;
}
