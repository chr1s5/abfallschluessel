import { NextRequest, NextResponse } from "next/server";
import { searchAvv } from "@/lib/db";

// Diese Route braucht Node.js Runtime (postgres.js läuft nicht auf Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.max(1, Math.min(parseInt(limitRaw ?? "20", 10) || 20, 50));

  // Input-Validierung: 2-100 Zeichen
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 100) {
    return NextResponse.json(
      { error: "Query zu lang (max. 100 Zeichen)" },
      { status: 400 }
    );
  }

  // TODO post-launch: Rate Limiting pro IP
  // const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  // const { success } = await ratelimit.limit(ip);
  // if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  try {
    const results = await searchAvv(q, limit);
    return NextResponse.json(
      { results, query: q, count: results.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Suche fehlgeschlagen" },
      { status: 500 }
    );
  }
}

// CORS Preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
