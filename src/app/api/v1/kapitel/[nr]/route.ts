import { NextRequest, NextResponse } from "next/server";
import { getKapitel, isValidKapitelNr } from "@/lib/db";

export const runtime = "nodejs";

// ─── CORS Headers ──────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// ─── GET /api/v1/kapitel/[nr] ──────────────────────────────────────────────────
// Alle Eintraege eines AVV-Kapitels abrufen

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nr: string }> }
) {
  // TODO post-launch: Rate Limiting pro IP
  // const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  // const { success } = await ratelimit.limit(ip);
  // if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const { nr } = await params;

    // Validate 2-digit kapitel_nr (01-20)
    if (!isValidKapitelNr(nr)) {
      return NextResponse.json(
        { error: "Ungueltige Kapitel-Nummer. Erforderlich: 2 Ziffern (01-20)." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const eintraege = await getKapitel(nr);

    // Derive kapitel_name from first entry (all share the same chapter)
    const kapitelName = eintraege.length > 0 ? eintraege[0].kapitel_name : "";

    // Strip internal fields (fts_vector etc.) from each entry
    const cleaned = eintraege.map((eintrag) => {
      const { fts_vector, ...publicData } = eintrag as typeof eintrag & {
        fts_vector?: unknown;
      };
      return publicData;
    });

    const etag = `"kapitel-${nr}-${eintraege.length}"`;

    return NextResponse.json(
      {
        data: cleaned,
        kapitel_nr: nr,
        kapitel_name: kapitelName,
        count: cleaned.length,
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          ETag: etag,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Kapitel error:", err);
    return NextResponse.json(
      { error: "Interner Serverfehler beim Abrufen des Kapitels." },
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
