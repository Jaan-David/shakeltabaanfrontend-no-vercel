import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.json(
    { clientId },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
