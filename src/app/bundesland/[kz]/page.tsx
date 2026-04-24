import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const BUNDESLAENDER = [
  { kz: "BB", name: "Brandenburg", behoerde: "LfU Brandenburg" },
  { kz: "BE", name: "Berlin", behoerde: "SenUVK Berlin" },
  { kz: "BW", name: "Baden-Württemberg", behoerde: "LUBW" },
  { kz: "BY", name: "Bayern", behoerde: "LfU Bayern" },
  { kz: "HB", name: "Bremen", behoerde: "Senator für Umwelt" },
  { kz: "HE", name: "Hessen", behoerde: "HLNUG" },
  { kz: "HH", name: "Hamburg", behoerde: "BUKEA" },
  { kz: "MV", name: "Mecklenburg-Vorpommern", behoerde: "LUNG MV" },
  { kz: "NI", name: "Niedersachsen", behoerde: "NLWKN" },
  { kz: "NW", name: "Nordrhein-Westfalen", behoerde: "LANUV NRW" },
  { kz: "RP", name: "Rheinland-Pfalz", behoerde: "LfU RLP" },
  { kz: "SH", name: "Schleswig-Holstein", behoerde: "LLUR SH" },
  { kz: "SL", name: "Saarland", behoerde: "LUA Saarland" },
  { kz: "SN", name: "Sachsen", behoerde: "LfULG Sachsen" },
  { kz: "ST", name: "Sachsen-Anhalt", behoerde: "LAU Sachsen-Anhalt" },
  { kz: "TH", name: "Thüringen", behoerde: "TLUG Thüringen" },
] as const;

type Kz = (typeof BUNDESLAENDER)[number]["kz"];

export async function generateStaticParams(): Promise<{ kz: Kz }[]> {
  return BUNDESLAENDER.map((bl) => ({ kz: bl.kz }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kz: string }>;
}): Promise<Metadata> {
  const { kz } = await params;
  const bl = BUNDESLAENDER.find((b) => b.kz === kz);
  if (!bl) return { title: "Bundesland nicht gefunden" };

  return {
    title: `AVV-Regelungen ${bl.name} (${bl.kz})`,
    description: `Länderspezifische AVV-Regelungen für ${bl.name}. Zuständige Behörde: ${bl.behoerde}. Erlasse, Vollzugshilfen und Zuordnungen.`,
    alternates: { canonical: `/bundesland/${bl.kz}` },
  };
}

export default async function BundeslandDetailPage({
  params,
}: {
  params: Promise<{ kz: string }>;
}) {
  const { kz } = await params;
  const bl = BUNDESLAENDER.find((b) => b.kz === kz);
  if (!bl) notFound();

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="px" style={{
        paddingTop: "20px", paddingBottom: "0",
        fontSize: "0.75rem", color: "var(--text-muted)",
      }}>
        <div style={{ maxWidth: "1100px", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/" style={{ color: "var(--text-muted)", transition: "color 0.15s" }}>
            Home
          </Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <Link href="/bundesland" style={{ color: "var(--text-muted)", transition: "color 0.15s" }}>
            Bundesländer
          </Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--text)" }}>{bl.name}</span>
        </div>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "48px 0 44px",
      }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "8px" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              color: "var(--navy)",
              background: "var(--navy-pale)",
              border: "1px solid var(--navy-muted)",
              borderRadius: "var(--radius-sm)",
              padding: "3px 10px",
              fontWeight: 600,
            }}>
              {bl.kz}
            </span>
            <p className="section-label" style={{ marginBottom: 0 }}>
              Bundesland
            </p>
          </div>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 400, lineHeight: 1.15,
            letterSpacing: "-0.02em", color: "var(--text)",
            marginBottom: "12px",
          }}>
            AVV-Regelungen{" "}
            <em style={{ color: "var(--navy)" }}>{bl.name}</em>
          </h1>

          <p style={{
            fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6,
          }}>
            Zuständige Landesbehörde: <strong style={{ color: "var(--text)" }}>{bl.behoerde}</strong>
          </p>
        </div>
      </section>

      {/* ── Regulations Table (Placeholder) ─────────────────────────────── */}
      <section style={{ padding: "48px 0 64px" }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem", fontWeight: 400,
            letterSpacing: "-0.01em", marginBottom: "20px",
          }}>
            Regelungen &amp; Erlasse
          </h2>

          <div style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 200px",
              gap: "1px",
              background: "var(--border)",
            }}>
              <div style={{
                background: "var(--navy)", color: "#fff",
                padding: "10px 14px",
                fontSize: "0.72rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                AVV-Schlüssel
              </div>
              <div style={{
                background: "var(--navy)", color: "#fff",
                padding: "10px 14px",
                fontSize: "0.72rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Regelung / Erlass
              </div>
              <div style={{
                background: "var(--navy)", color: "#fff",
                padding: "10px 14px",
                fontSize: "0.72rem", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Art
              </div>
            </div>

            {/* Empty state */}
            <div style={{
              background: "var(--surface)",
              padding: "48px 24px",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "0.88rem",
                color: "var(--text-muted)",
                marginBottom: "8px",
                fontStyle: "italic",
              }}>
                Regelungen werden sukzessive ergänzt
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: "var(--text-faint)",
              }}>
                Die länderspezifischen Erlasse und Vollzugshilfen für{" "}
                {bl.name} werden aktuell aufbereitet.
              </div>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: "32px" }}>
            <Link
              href="/bundesland"
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--navy)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Alle Bundesländer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
