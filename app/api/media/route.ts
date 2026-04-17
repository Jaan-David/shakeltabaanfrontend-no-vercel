import { NextRequest } from "next/server";
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

  const rangeHeader = request.headers.get("range");

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "*/*",
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    },
    cache: "force-cache",
    next: {
      revalidate: 3600,
    },
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const cacheControl =
    upstream.headers.get("cache-control") ||
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";
  const contentRange = upstream.headers.get("content-range");
  const acceptRanges = upstream.headers.get("accept-ranges") || "bytes";
  const contentLength = upstream.headers.get("content-length");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      ...(contentRange ? { "Content-Range": contentRange } : {}),
      ...(acceptRanges ? { "Accept-Ranges": acceptRanges } : {}),
      ...(contentLength ? { "Content-Length": contentLength } : {}),
    },
  });
}
