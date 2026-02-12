import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set([
  "shakeltabaanstorage.blob.core.windows.net",
]);

export async function GET(request: NextRequest) {
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

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const rangeHeader = request.headers.get("range");

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "*/*",
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const cacheControl = upstream.headers.get("cache-control") || "public, max-age=300";
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
