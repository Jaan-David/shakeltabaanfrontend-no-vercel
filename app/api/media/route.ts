import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, getRequestIp } from "@/lib/server/rateLimit";

const configuredHosts = (process.env.MEDIA_PROXY_ALLOWED_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const ALLOWED_HOSTS = new Set([
  "shakeltabaanstorage.blob.core.windows.net",
  ...configuredHosts,
]);

const isAllowedHost = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(normalized)) return true;
  return normalized.endsWith(".blob.core.windows.net");
};

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request.headers);
  const limit = await applyRateLimit(`media:${ip}`, 120, 60_000);

  if (!limit.success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfterSeconds),
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return new Response("Missing url", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!isAllowedHost(target.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  // Redirect directly to CDN to avoid routing large media through serverless functions.
  const redirect = NextResponse.redirect(target.toString(), 307);
  redirect.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
  );
  return redirect;
}
