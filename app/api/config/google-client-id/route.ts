import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, getRequestIp } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request.headers);
  const limit = await applyRateLimit(`google-client-id:${ip}`, 30, 60_000);

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    "";

  if (!clientId) {
    return NextResponse.json(
      { message: "Google Client ID is not configured" },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }

  return NextResponse.json(
    { clientId },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
