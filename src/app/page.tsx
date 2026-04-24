import type { Metadata } from "next";
import Link from "next/link";
import { getKapitelUebersicht } from "@/lib/db";
import { SearchBox } from "@/components/SearchBox";

export const metadata: Metadata = {
  title: "AVV Abfallverzeichnis — Vollständige Suche & Lexikon",
  description:
    "Alle 842 AVV-Schlüssel nach Europäischem Abfallkatalog. Volltextsuche, Bundesland-Regelungen, Spiegeleinträge und offene API. Kostenlos, aktuell, werbefrei.",
};

export default async function HomePage() {
  const kapitel = await getKapitelUebersicht();
  const gesamtGefaehrlich = kapitel.reduce((s, k) => s + k.eintraege_gefaehrlich, 0);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "72px 0 60px", position: "relative", overflow: "hidden",
      }}>
        {/* Hintergrund-Glow */}
        <div aria-hidden style={{
          position: "absolute", top: "-100px", right: "-80px",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, #eef1ff 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div className="px" style={{ position: "relative", maxWidth: "1100px" }}>
          <div style={{ maxWidth: "700px" }}>

            {/* Badge */}
            <div className="animate-fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 12px", marginBottom: "28px",
              border: "1px solid var(--navy-muted)", borderRadius: "4px",
              background: "var(--navy-pale)",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "var(--navy)", display: "inline-block",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                color: "var(--navy)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Stand: 30.06.2020 · {kapitel.reduce((s,k)=>s+k.eintraege_gesamt,0)} Schlüssel
              </span>
            </div>

            <h1 className="animate-fade-up delay-1" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.1rem, 5vw, 3.5rem)",
              fontWeight: 400, lineHeight: 1.1,
              letterSpacing: "-0.025em", color: "var(--text)",
              marginBottom: "20px",
            }}>
              Das vollständige<br />
              <em style={{ color: "var(--navy)" }}>Abfallverzeichnis</em><br />
              für Deutschland.
            </h1>

            <p className="animate-fade-up delay-2" style={{
              fontSize: "0.98rem", color: "var(--text-muted)",
              lineHeight: 1.7, maxWidth: "540px",
              marginBottom: "40px", fontWeight: 300,
            }}>
              Alle AVV-Schlüssel nach Europäischem Abfallkatalog — mit
              Volltextsuche, Bundesland-spezifischen Regelungen,
              Spiegeleinträgen und offenem API-Zugang.
            </p>

            {/* Search */}
            <div className="animate-fade-up delay-3" style={{ maxWidth: "600px" }}>
              <SearchBox />
            </div>

            {/* Quick suggestions */}
            <div className="animate-fade-up delay-4" style={{
              display: "flex", gap: "20px", marginTop: "16px",
              flexWrap: "wrap",
            }}>
              {[
                ["17 01 01", "Beton"],
                ["20 03 01", "Siedlungsabfall"],
                ["13 01 01", "Hydrauliköl"],
              ].map(([key, label]) => (
                <Link key={key} href={`/avv/${key.replace(/\s/g, "")}`} style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: "var(--navy)", opacity: 0.6,
                  letterSpacing: "0.04em", transition: "opacity 0.15s",
                }}
                className="home-suggestion"
                >
                  ↗ {key} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section style={{
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px", background: "var(--border)",
        }}>
          {[
            { value: kapitel.reduce((s,k)=>s+k.eintraege_gesamt,0), label: "Abfallarten", sub: "vollständig erfasst" },
            { value: gesamtGefaehrlich, label: "Gefährliche", sub: "mit Sternchen *" },
            { value: 130, label: "Spiegelpaare", sub: "verknüpft & erklärt" },
            { value: 16, label: "Bundesländer", sub: "länderspez. Regeln" },
          ].map(({ value, label, sub }) => (
            <div key={label} style={{
              background: "var(--surface)", padding: "28px 28px",
            }}>
              <div style={{
                width: "28px", height: "3px",
                background: "var(--navy)", borderRadius: "1px", marginBottom: "14px",
              }} />
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.6rem", fontWeight: 400,
                color: "var(--navy)", lineHeight: 1, letterSpacing: "-0.02em",
              }}>{value.toLocaleString("de")}</div>
              <div style={{
                fontSize: "0.78rem", fontWeight: 600,
                color: "var(--text)", marginTop: "8px",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>{label}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kapitel-Grid ──────────────────────────────────────────────── */}
      <section style={{ padding: "60px 0" }}>
        <div className="px">
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", marginBottom: "32px",
          }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.55rem", fontWeight: 400,
                letterSpacing: "-0.015em",
              }}>Kapitel-Übersicht</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {kapitel.length} Herkunftsbereiche nach Europäischem Abfallkatalog
              </p>
            </div>
            <Link href="/katalog" style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: "var(--navy)", whiteSpace: "nowrap",
            }}>
              Vollständiger Katalog →
            </Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
            gap: "1px", background: "var(--border)",
            border: "1px solid var(--border)",
          }}>
            {kapitel.map((k) => (
              <Link key={k.kapitel_nr} href={`/kapitel/${k.kapitel_nr}`} style={{
                display: "block", padding: "20px 22px",
                background: "var(--surface)", transition: "background 0.12s",
              }}
              className="home-card"
              >
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                  color: "var(--navy)", letterSpacing: "0.1em",
                  fontWeight: 600, marginBottom: "8px",
                }}>KAP. {k.kapitel_nr}</div>
                <div style={{
                  fontSize: "0.88rem", fontWeight: 500,
                  lineHeight: 1.35,
                  // Kürze lange Namen
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                }}>
                  {k.kapitel_name.split("(")[0].trim()}
                </div>
                <div style={{
                  fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "10px",
                  display: "flex", gap: "8px",
                }}>
                  <span>{k.eintraege_gesamt} Einträge</span>
                  {k.eintraege_gefaehrlich > 0 && (
                    <span style={{ color: "var(--danger)", opacity: 0.7 }}>
                      {k.eintraege_gefaehrlich}*
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (dark) ───────────────────────────────────────────── */}
      <section style={{
        background: "var(--navy)", color: "#fff", padding: "56px 0",
      }}>
        <div className="px" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
        }}>
          {[
            { icon: "⌕", title: "Volltextsuche", text: "Schlüssel, Bezeichnung oder Synonym — mit Tippfehlertoleranz. Drücke / um sofort zu suchen." },
            { icon: "◈", title: "Klassifizierungs-Wizard", text: "Unbekannter Abfall? Geführte Zuordnung in wenigen Schritten — mit Gefährlichkeitsprüfung." },
            { icon: "⊞", title: "Bundesland-Regelungen", text: "Länderspezifische Erlasse, Vollzugshilfen und Bayern-Umrechnungsfaktoren." },
            { icon: "⟨/⟩", title: "Offene API", text: "Alle 842 Schlüssel maschinenlesbar. Kostenlos bis 100 Anfragen/Tag." },
          ].map((f) => (
            <div key={f.title}>
              <div style={{ fontSize: "1.1rem", opacity: 0.45, marginBottom: "14px" }}>{f.icon}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "0.8rem", lineHeight: 1.7, opacity: 0.6, fontWeight: 300 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CSS hover effects */}
      <style>{`
        .home-suggestion:hover { opacity: 1 !important; }
        .home-card:hover { background: var(--navy-pale) !important; }
      `}</style>
    </>
  );
}
