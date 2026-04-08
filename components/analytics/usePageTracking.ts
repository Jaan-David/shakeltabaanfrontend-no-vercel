"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __META_PIXEL_INITIALIZED__?: boolean;
  }
}

function isDebugEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  try {
    return window.localStorage.getItem("meta_pixel_debug") === "1";
  } catch {
    return false;
  }
}

export default function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window === "undefined") return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    const firePageView = () => {
      if (typeof window.fbq !== "function") return false;

      if ((window as Window & { __META_PIXEL_LAST_PATH__?: string }).__META_PIXEL_LAST_PATH__ === pagePath) {
        return true;
      }

      // SPA route-change PageView tracking.
      window.fbq("track", "PageView");
      (window as Window & { __META_PIXEL_LAST_PATH__?: string }).__META_PIXEL_LAST_PATH__ = pagePath;

      if (isDebugEnabled() && typeof window.console?.debug === "function") {
        window.console.debug("[Meta Pixel] PageView fired", { pagePath });
      }

      return true;
    };

    // Try immediately, then retry once if script has not finished loading yet.
    if (firePageView()) return;

    const retryTimer = window.setTimeout(() => {
      firePageView();
    }, 800);

    return () => {
      window.clearTimeout(retryTimer);
    };
  }, [pathname, searchParams]);
}
