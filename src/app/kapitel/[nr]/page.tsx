import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKapitel, isValidKapitelNr, type AvvEintrag } from "@/lib/db";

export const revalidate = 3600;
export const runtime = "nodejs";

// ─── Static Generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    nr: String(i + 1).padStart(2, "0"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nr: string }>;
}): Promise<Metadata> {
  const { nr } = await params;
  if (!isValidKapitelNr(nr)) return { title: "Nicht gefunden" };

  const eintraege = await getKapitel(nr);
  if (eintraege.length === 0) return { title: "Nicht gefunden" };

  const kapitelName = eintraege[0].kapitel_name;
  const title = `Kapitel ${nr} — ${kapitelName} | avv.valeoro.net`;
  const description = `Alle Abfallschlüssel aus Kapitel ${nr} (${kapitelName}) des Europäischen Abfallverzeichnisses (AVV). ${eintraege.length} Einträge mit Gruppenübersicht.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net"}/kapitel/${nr}`,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByGruppe(eintraege: AvvEintrag[]): Map<string, { gruppe_name: string; eintraege: AvvEintrag[] }> {
  const map = new Map<string, { gruppe_name: string; eintraege: AvvEintrag[] }>();
  for (const e of eintraege) {
    if (!map.has(e.gruppe_nr)) {
      map.set(e.gruppe_nr, { gruppe_name: e.gruppe_name, eintraege: [] });
    }
    map.get(e.gruppe_nr)!.eintraege.push(e);
  }
  return map;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function KapitelPage({
  params,
}: {
  params: Promise<{ nr: string }>;
}) {
  const { nr } = await params;
  if (!isValidKapitelNr(nr)) notFound();

  const eintraege = await getKapitel(nr);
  if (eintraege.length === 0) notFound();

  const kapitelName = eintraege[0].kapitel_name;
  const gruppen = groupByGruppe(eintraege);
  const gefaehrlichCount = eintraege.filter((e) => e.ist_gefaehrlich).length;

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="animate-fade-up"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 0",
        }}
      >
        <div className="px" style={{ maxWidth: "1100px" }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <Link
              href="/"
              className="kapitel-breadcrumb"
              style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
            >
              Home
            </Link>
            <span style={{ color: "var(--border-mid)" }}>›</span>
            <span style={{ color: "var(--text-muted)" }}>Kapitel</span>
            <span style={{ color: "var(--border-mid)" }}>›</span>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{nr}</span>
          </nav>

          {/* Title + Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                  color: "var(--navy)",
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                  lineHeight: 1,
                  marginBottom: "10px",
                }}
              >
                Kapitel {nr}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
              >
                {kapitelName}
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                {eintraege.length} Einträge
              </span>
              {gefaehrlichCount > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: "var(--danger-pale)",
                    color: "var(--danger)",
                    border: "1px solid var(--danger-muted)",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "currentColor",
                      display: "inline-block",
                    }}
                  />
                  {gefaehrlichCount} gefährlich
                </span>
              )}
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                {gruppen.size} Gruppen
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main
        className="px"
        style={{
          maxWidth: "1100px",
          padding: "40px max(24px, calc((100vw - 1100px) / 2))",
        }}
      >
        {Array.from(gruppen.entries()).map(([gruppeNr, { gruppe_name, eintraege: gruppeEintraege }], groupIdx) => (
          <section
            key={gruppeNr}
            className={`animate-fade-up delay-${Math.min(groupIdx + 1, 5)}`}
            style={{
              marginBottom: "36px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            {/* Group Header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "var(--bg)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.88rem",
                  color: "var(--navy)",
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                }}
              >
                {gruppeNr}
              </span>
              <span
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  fontWeight: 500,
                }}
              >
                {gruppe_name}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                {gruppeEintraege.length} Einträge
              </span>
            </div>

            {/* Entries */}
            <div>
              {gruppeEintraege.map((eintrag) => (
                <Link
                  key={eintrag.schluessel_id}
                  href={`/avv/${eintrag.schluessel_id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 20px",
                    borderBottom: "1px solid #f5f5f3",
                    background: eintrag.ist_gefaehrlich ? "var(--danger-pale)" : "transparent",
                    borderLeft: eintrag.ist_gefaehrlich
                      ? "3px solid var(--danger-muted)"
                      : "3px solid transparent",
                    transition: "background 0.1s",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  className={eintrag.ist_gefaehrlich ? "kapitel-entry-gefaehrlich" : "kapitel-entry-normal"}
                >
                  <span
                    className={`badge-schluessel ${eintrag.ist_gefaehrlich ? "gefaehrlich" : "normal"}`}
                  >
                    {eintrag.schluessel}
                    {eintrag.ist_gefaehrlich && "*"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-mid)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}
                  >
                    {eintrag.bezeichnung}
                  </span>
                  {eintrag.ist_spiegeleintrag && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        flexShrink: 0,
                        fontStyle: "italic",
                      }}
                    >
                      Spiegel
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Responsive + hover effects */}
      <style>{`
        @media (max-width: 768px) {
          section > div:first-child {
            flex-wrap: wrap;
          }
        }
        .kapitel-breadcrumb:hover { color: var(--navy) !important; }
        .kapitel-entry-normal:hover { background: var(--navy-pale) !important; }
      `}</style>
    </>
  );
}
