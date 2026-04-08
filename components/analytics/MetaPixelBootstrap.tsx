"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    __META_PIXEL_INITIALIZED__?: boolean;
    __META_PIXEL_SCRIPT_ADDED__?: boolean;
    __META_PIXEL_LAST_PATH__?: string;
  }
}

const PIXEL_ID = "1299741602300581";
const PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

export default function MetaPixelBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Official fbq stub: queue calls until fbevents.js is loaded.
    if (typeof window.fbq !== "function") {
      const fbqStub = function (...args: unknown[]) {
        (fbqStub.queue = fbqStub.queue || []).push(args);
      } as ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void;
        queue?: unknown[];
        push?: (...args: unknown[]) => void;
        loaded?: boolean;
        version?: string;
      };

      fbqStub.push = fbqStub;
      fbqStub.loaded = true;
      fbqStub.version = "2.0";
      fbqStub.queue = [];

      window.fbq = fbqStub;
      if (!window._fbq) {
        window._fbq = fbqStub;
      }
    }

    if (!window.__META_PIXEL_SCRIPT_ADDED__) {
      const script = document.createElement("script");
      script.async = true;
      script.src = PIXEL_SRC;
      script.onload = () => {
        if (typeof window.console?.debug === "function") {
          window.console.debug("[Meta Pixel] fbevents.js loaded");
        }
      };
      script.onerror = () => {
        if (typeof window.console?.warn === "function") {
          window.console.warn("[Meta Pixel] Failed to load fbevents.js");
        }
      };

      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }

      window.__META_PIXEL_SCRIPT_ADDED__ = true;
    }

    if (!window.__META_PIXEL_INITIALIZED__) {
      window.fbq?.("init", PIXEL_ID);
      window.__META_PIXEL_INITIALIZED__ = true;
      if (typeof window.console?.debug === "function") {
        window.console.debug("[Meta Pixel] Initialized");
      }
    }

    window.setTimeout(() => {
      if (typeof window.console?.debug === "function") {
        window.console.debug("[Meta Pixel] fbq available:", typeof window.fbq === "function");
      }
    }, 1200);
  }, []);

  return null;
}
