type MetaEventParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
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

export function trackMetaEvent(eventName: string, params?: MetaEventParams): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.fbq !== "function") return false;

  try {
    if (params && Object.keys(params).length > 0) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }

    if (isDebugEnabled() && typeof window.console?.debug === "function") {
      window.console.debug("[Meta Pixel] Event fired", { eventName, params });
    }

    return true;
  } catch (error) {
    if (isDebugEnabled() && typeof window.console?.warn === "function") {
      window.console.warn("[Meta Pixel] Failed to fire event", { eventName, params, error });
    }
    return false;
  }
}
