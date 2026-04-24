import { NextRequest, NextResponse } from "next/server";
import { getEintrag, isValidSchluesselId } from "@/lib/db";

export const runtime = "nodejs";

// ─── CORS Headers ──────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// ─── GET /api/v1/avv/[id] ─────────────────────────────────────────────────────
// Einzelnen AVV-Eintrag mit Spiegelpartner abrufen

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO post-launch: Rate Limiting pro IP
  // const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  // const { success } = await ratelimit.limit(ip);
  // if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const { id } = await params;

    // Validate 6-digit schluessel_id
    if (!isValidSchluesselId(id)) {
      return NextResponse.json(
        { error: "Ungueltige Schluessel-ID. Erforderlich: exakt 6 Ziffern." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const eintrag = await getEintrag(id);

    if (!eintrag) {
      return NextResponse.json(
        { error: `AVV-Eintrag ${id} nicht gefunden.` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Strip internal fields from response
    const { id: _dbId, fts_vector: _fts, spiegel_partner_id: _spid, ...publicData } = eintrag as Record<string, unknown> & {
      id: number;
      fts_vector?: unknown;
      spiegel_partner_id?: string | null;
    };
    void _dbId; void _fts; void _spid;

    const etag = `"${eintrag.schluessel_id}"`;

    return NextResponse.json(
      { data: publicData },
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
    console.error("AVV detail error:", err);
    return NextResponse.json(
      { error: "Interner Serverfehler beim Abrufen des AVV-Eintrags." },
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
