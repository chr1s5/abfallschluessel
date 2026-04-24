import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bundesländer — AVV-Regelungen nach Land",
  description:
    "Übersicht aller 16 Bundesländer mit länderspezifischen AVV-Regelungen, Vollzugshilfen und zuständigen Behörden.",
  alternates: { canonical: "/bundesland" },
};

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

export default function BundeslandPage() {
  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "56px 0 48px",
      }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          <p className="section-label">Bundesländer</p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 400, lineHeight: 1.15,
            letterSpacing: "-0.02em", color: "var(--text)",
            marginBottom: "14px",
          }}>
            AVV-Regelungen nach{" "}
            <em style={{ color: "var(--navy)" }}>Bundesland</em>
          </h1>
          <p style={{
            fontSize: "0.92rem", color: "var(--text-muted)",
            lineHeight: 1.65, maxWidth: "560px",
          }}>
            Länderspezifische Erlasse, Vollzugshilfen und Zuordnungen der
            zuständigen Landesbehörden für alle 16 Bundesländer.
          </p>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 0 64px" }}>
        <div className="px">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}>
            {BUNDESLAENDER.map((bl) => (
              <Link
                key={bl.kz}
                href={`/bundesland/${bl.kz}`}
                style={{
                  display: "block",
                  padding: "24px 24px",
                  background: "var(--surface)",
                  transition: "background 0.12s",
                }}
              >
                {/* Kürzel-Badge */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginBottom: "10px",
                }}>
                  {bl.kz}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginBottom: "6px",
                }}>
                  {bl.name}
                </div>

                {/* Behörde */}
                <div style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginBottom: "14px",
                }}>
                  {bl.behoerde}
                </div>

                {/* Placeholder */}
                <div style={{
                  fontSize: "0.72rem",
                  color: "var(--text-faint)",
                  fontStyle: "italic",
                }}>
                  Regelungen werden ergänzt
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
