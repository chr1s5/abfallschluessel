import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEintrag,
  getAlleSchluessels,
  getVerwandte,
  isValidSchluesselId,
  type AvvEintragMitPartner,
} from "@/lib/db";

// Revalidate alle 24h (ISR)
export const revalidate = 86400;

// ─── Static Generation ────────────────────────────────────────────────────────
// Alle 842 Seiten zur Build-Zeit generieren → maximale Performance + SEO

export async function generateStaticParams() {
  const ids = await getAlleSchluessels();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isValidSchluesselId(id)) return { title: "Nicht gefunden" };
  const eintrag = await getEintrag(id);
  if (!eintrag) return { title: "Nicht gefunden" };

  const title = `AVV ${eintrag.schluessel}${eintrag.ist_gefaehrlich ? "*" : ""} – ${eintrag.bezeichnung}`;
  const description = `Abfallschlüssel ${eintrag.schluessel}: ${eintrag.ist_gefaehrlich ? "gefährlicher Abfall" : "nicht gefährlich"}, Kapitel ${eintrag.kapitel_nr}${eintrag.erklaerung ? ". " + eintrag.erklaerung.slice(0, 120) + "…" : "."}`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net"}/avv/${id}` },
  };
}

// ─── Komponenten ──────────────────────────────────────────────────────────────

function GefaehrlichBadge({ gefaehrlich }: { gefaehrlich: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "5px 14px", borderRadius: "4px",
      fontSize: "0.78rem", fontWeight: 600,
      background: gefaehrlich ? "var(--danger-pale)" : "var(--safe-pale)",
      color: gefaehrlich ? "var(--danger)" : "var(--safe)",
      border: `1px solid ${gefaehrlich ? "var(--danger-muted)" : "var(--safe-muted)"}`,
    }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: "currentColor", display: "inline-block",
      }} />
      {gefaehrlich ? "Gefährlicher Abfall" : "Nicht gefährlich"}
    </span>
  );
}

// ─── Hauptseite ───────────────────────────────────────────────────────────────

export default async function AvvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidSchluesselId(id)) notFound();
  const eintrag = await getEintrag(id);
  if (!eintrag) notFound();

  const verwandte = await getVerwandte(eintrag.gruppe_nr, eintrag.schluessel_id);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net";

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: eintrag.bezeichnung,
    identifier: eintrag.schluessel,
    description: eintrag.erklaerung ?? undefined,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Europäisches Abfallverzeichnis (AVV)",
      url: `${baseUrl}/katalog`,
    },
    url: `${baseUrl}/avv/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "32px 0 0",
      }}>
        <div className="px" style={{ maxWidth: "1100px" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "0.75rem", color: "var(--text-muted)",
            flexWrap: "wrap", marginBottom: "24px",
          }}>
            {[
              ["Katalog", "/katalog"],
              [`Kapitel ${eintrag.kapitel_nr}`, `/kapitel/${eintrag.kapitel_nr}`],
              [eintrag.gruppe_nr, `/gruppe/${eintrag.gruppe_nr.replace(" ", "")}`],
            ].map(([label, href]) => (
              <span key={href} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link href={href} className="avv-breadcrumb" style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
                >{label}</Link>
                <span style={{ color: "var(--border-mid)" }}>›</span>
              </span>
            ))}
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{eintrag.bezeichnung}</span>
          </nav>

          {/* Title row */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: "20px",
            flexWrap: "wrap", marginBottom: "28px",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                color: eintrag.ist_gefaehrlich ? "var(--danger)" : "var(--navy)",
                letterSpacing: "0.04em", fontWeight: 500, lineHeight: 1,
                marginBottom: "10px",
              }}>
                {eintrag.schluessel}{eintrag.ist_gefaehrlich && "*"}
              </div>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 400, letterSpacing: "-0.01em",
              }}>
                {eintrag.bezeichnung}
              </h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
              <GefaehrlichBadge gefaehrlich={eintrag.ist_gefaehrlich} />
            </div>
          </div>

          {/* Tabs (visuell, Navigation folgt später) */}
          <div style={{
            display: "flex", borderTop: "1px solid var(--border)", marginTop: "4px",
          }}>
            {["Übersicht", "Bundesländer", "FAQ", "API"].map((t, i) => (
              <div key={t} style={{
                padding: "11px 18px", fontSize: "0.82rem",
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? "var(--navy)" : "var(--text-muted)",
                borderBottom: i === 0 ? "2px solid var(--navy)" : "2px solid transparent",
                cursor: "pointer", marginBottom: "-1px",
              }}>{t}</div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="px" style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "40px",
        padding: "40px max(24px, calc((100vw - 1100px) / 2))",
        alignItems: "start",
      }}>

        {/* ── Linke Spalte ────────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>

          {/* Erklärung */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)", fontSize: "1.2rem",
              fontWeight: 400, letterSpacing: "-0.01em", marginBottom: "14px",
            }}>Erklärung</h2>
            {eintrag.erklaerung ? (
              <p style={{
                fontSize: "0.92rem", lineHeight: 1.75,
                color: "var(--text-mid)", fontWeight: 300,
              }}>{eintrag.erklaerung}</p>
            ) : (
              <p style={{
                fontSize: "0.88rem", color: "var(--text-muted)",
                fontStyle: "italic",
              }}>
                Erklärung wird noch ergänzt. Verbindlich ist die Bezeichnung gemäß AVV.
              </p>
            )}
            <div style={{
              marginTop: "16px", padding: "12px 16px",
              borderLeft: "3px solid var(--border)",
              fontSize: "0.75rem", color: "var(--text-muted)",
              background: "var(--bg)", borderRadius: "0 4px 4px 0",
            }}>
              Alle Angaben ohne Gewähr. Verbindlich ist die amtliche Fassung der
              Abfallverzeichnis-Verordnung (BGBl. I S. 1533).
            </div>
          </section>

          {/* Spiegeleintrag */}
          {eintrag.ist_spiegeleintrag && eintrag.partner && (
            <section style={{ marginBottom: "40px" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)", fontSize: "1.2rem",
                fontWeight: 400, letterSpacing: "-0.01em", marginBottom: "14px",
              }}>Spiegeleintrag</h2>
              <Link href={`/avv/${eintrag.partner.schluessel_id}`} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "18px 20px",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${eintrag.ist_gefaehrlich ? "var(--safe)" : "var(--danger)"}`,
                borderRadius: "var(--radius)",
                background: "var(--surface)", transition: "background 0.15s",
              }}
              className="avv-spiegel"
              >
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                  color: eintrag.partner.ist_gefaehrlich ? "var(--danger)" : "var(--navy)",
                  flexShrink: 0,
                }}>
                  {eintrag.partner.schluessel}{eintrag.partner.ist_gefaehrlich && "*"}
                </span>
                <span style={{ fontSize: "0.88rem", color: "var(--text)" }}>
                  {eintrag.partner.bezeichnung}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {eintrag.ist_gefaehrlich ? "nicht gefährliche Variante" : "gefährliche Variante"}
                </span>
              </Link>
              <p style={{
                fontSize: "0.78rem", color: "var(--text-muted)",
                marginTop: "10px", lineHeight: 1.6,
              }}>
                Spiegeleinträge sind Paare aus einer gefährlichen und einer nicht gefährlichen
                Abfallart. Die Zuordnung hängt von den tatsächlich enthaltenen Stoffen ab.
              </p>
            </section>
          )}

          {/* Bundesland-Hinweise (Placeholder) */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)", fontSize: "1.2rem",
              fontWeight: 400, letterSpacing: "-0.01em", marginBottom: "14px",
            }}>Bundesland-Hinweise</h2>
            <div style={{
              padding: "24px", border: "1px dashed var(--border-mid)",
              borderRadius: "var(--radius)", textAlign: "center",
              color: "var(--text-muted)", fontSize: "0.85rem",
            }}>
              Bundesland-spezifische Regelungen werden sukzessive ergänzt.
              <br />
              <Link href="/bundesland" style={{ color: "var(--navy)", marginTop: "8px", display: "inline-block" }}>
                Zur Bundesland-Übersicht →
              </Link>
            </div>
          </section>
        </div>

        {/* ── Rechte Sidebar ──────────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Klassifikations-Karte */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid var(--border)",
              fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>Klassifikation</div>
            {([
              ["Schlüssel",
                <span key="s" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                  {eintrag.schluessel}{eintrag.ist_gefaehrlich && "*"}
                </span>
              ],
              ["Kapitel", `${eintrag.kapitel_nr}`],
              ["Gruppe", eintrag.gruppe_nr],
              ["Gefährlichkeit", eintrag.ist_gefaehrlich ? "⚠ Gefährlich *" : "✓ Nicht gefährlich"],
              ["Spiegeleintrag", eintrag.ist_spiegeleintrag ? "Ja" : "Nein"],
              ...(eintrag.u_faktor ? [["U-Faktor (BY)", `${eintrag.u_faktor} t/m³`]] : []),
            ] as [string, React.ReactNode][]).map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: "12px",
                padding: "11px 18px", borderBottom: "1px solid #f5f5f3",
                fontSize: "0.8rem",
              }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{k}</span>
                <span style={{ color: "var(--text)", fontWeight: 500, textAlign: "right", lineHeight: 1.4 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Synonyme */}
          {eintrag.synonyme.length > 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "18px",
            }}>
              <div style={{
                fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px",
              }}>Synonyme</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {eintrag.synonyme.map((s) => (
                  <span key={s} style={{
                    fontSize: "0.78rem", padding: "4px 10px",
                    background: "var(--navy-pale)", color: "var(--navy)",
                    borderRadius: "3px", border: "1px solid var(--navy-muted)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Verwandte Schlüssel */}
          {verwandte.length > 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 18px", borderBottom: "1px solid var(--border)",
                fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>Gleiche Gruppe</div>
              {verwandte.map((r) => (
                <Link key={r.schluessel_id} href={`/avv/${r.schluessel_id}`} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "11px 18px", borderBottom: "1px solid #f5f5f3",
                  transition: "background 0.1s",
                }}
                className="avv-related"
                >
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                    color: r.ist_gefaehrlich ? "var(--danger)" : "var(--navy)",
                    flexShrink: 0,
                  }}>
                    {r.schluessel}{r.ist_gefaehrlich && "*"}
                  </span>
                  <span style={{
                    fontSize: "0.78rem", color: "var(--text-mid)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{r.bezeichnung}</span>
                </Link>
              ))}
            </div>
          )}

          {/* API-Schnellzugriff */}
          <div style={{
            background: "var(--navy)", borderRadius: "var(--radius)",
            padding: "18px", color: "#fff",
          }}>
            <div style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", opacity: 0.55, marginBottom: "10px",
            }}>API-Zugriff</div>
            <code style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              display: "block",
              background: "rgba(255,255,255,0.1)",
              padding: "10px 12px", borderRadius: "4px",
              wordBreak: "break-all", lineHeight: 1.5,
            }}>
              GET /api/v1/avv/{eintrag.schluessel_id}
            </code>
            <Link href="/api-docs" style={{
              display: "inline-block", marginTop: "10px",
              fontSize: "0.74rem", color: "rgba(255,255,255,0.6)",
              transition: "color 0.15s",
            }}>API-Dokumentation →</Link>
          </div>
        </aside>
      </div>

      {/* Responsive + hover effects */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
        .avv-breadcrumb:hover { color: var(--navy) !important; }
        .avv-spiegel:hover { background: var(--navy-pale) !important; }
        .avv-related:hover { background: var(--navy-pale) !important; }
      `}</style>
    </>
  );
}
