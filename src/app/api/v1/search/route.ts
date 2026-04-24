import { NextRequest, NextResponse } from "next/server";
import { searchAvv } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── CORS Headers ──────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// ─── GET /api/v1/search?q=...&limit=... ────────────────────────────────────────
// Volltext- und Schluessel-Suche in AVV-Eintraegen

export async function GET(request: NextRequest) {
  // TODO post-launch: Rate Limiting pro IP
  // const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  // const { success } = await ratelimit.limit(ip);
  // if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const limitRaw = request.nextUrl.searchParams.get("limit");
    const limit = Math.max(1, Math.min(parseInt(limitRaw ?? "20", 10) || 20, 50));

    // Validate query length: 2-100 characters
    if (q.length < 2) {
      return NextResponse.json(
        { error: "Suchbegriff muss mindestens 2 Zeichen lang sein." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (q.length > 100) {
      return NextResponse.json(
        { error: "Suchbegriff zu lang (max. 100 Zeichen)." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const results = await searchAvv(q, limit);

    return NextResponse.json(
      {
        results,
        query: q,
        count: results.length,
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Suche fehlgeschlagen." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ─── OPTIONS Preflight ─────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
