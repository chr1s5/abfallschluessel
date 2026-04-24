import type { Metadata } from "next";
import Link from "next/link";
import { searchAvv } from "@/lib/db";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

// ─── Dynamic Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const base: Metadata = { robots: "noindex, nofollow" };

  if (!query || query.length < 2) {
    return {
      ...base,
      title: "Suche | avv.valeoro.net",
      description: "Volltextsuche im AVV-Abfallverzeichnis",
    };
  }

  const results = await searchAvv(query, 50);
  const count = results.length;

  return {
    ...base,
    title: `Suche: '${query}' — ${count} Ergebnis${count !== 1 ? "se" : ""} | avv.valeoro.net`,
    description: `${count} Ergebnis${count !== 1 ? "se" : ""} für '${query}' im AVV-Abfallverzeichnis`,
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function Suchseite({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  // No valid query
  if (!query || query.length < 2) {
    return (
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 0 60px",
        minHeight: "50vh",
      }}>
        <div className="px" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            marginBottom: "16px",
          }}>
            Suche im Abfallverzeichnis
          </h1>
          <p style={{
            fontSize: "0.92rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}>
            Bitte gib mindestens 2 Zeichen ein, um nach AVV-Schlüsseln, Bezeichnungen oder Synonymen zu suchen.
          </p>
          {/* Search form */}
          <form action="/suche" method="get" style={{ marginTop: "32px" }}>
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "stretch",
            }}>
              <input
                name="q"
                type="search"
                placeholder="z.B. Beton, 17 01, Hydrauliköl..."
                autoFocus
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: "0.92rem",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  background: "var(--navy)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Suchen
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // Fetch up to 50 results (max supported by searchAvv)
  const allResults = await searchAvv(query, 50);
  const totalCount = allResults.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Slice for current page
  const start = (page - 1) * PAGE_SIZE;
  const results = allResults.slice(start, start + PAGE_SIZE);

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 0 0",
      }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: "24px",
          }}>
            <Link href="/" style={{
              color: "var(--text-muted)",
              transition: "color 0.15s",
            }}
            className="suche-breadcrumb"
            >
              Startseite
            </Link>
            <span style={{ color: "var(--border-mid)" }}>›</span>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Suche</span>
          </nav>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            marginBottom: "8px",
          }}>
            {totalCount > 0
              ? <>{totalCount} Ergebnis{totalCount !== 1 ? "se" : ""} f&uuml;r &lsquo;{query}&rsquo;</>
              : <>Keine Ergebnisse f&uuml;r &lsquo;{query}&rsquo;</>
            }
          </h1>

          {/* Search form inline */}
          <form action="/suche" method="get" style={{ marginTop: "20px", marginBottom: "28px", maxWidth: "600px" }}>
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "stretch",
            }}>
              <input
                name="q"
                type="search"
                defaultValue={query}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "0.88rem",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "var(--navy)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Suchen
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 0 60px" }}>
        <div className="px" style={{ maxWidth: "1100px" }}>

          {/* No results */}
          {totalCount === 0 && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
            }}>
              <p style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}>
                Keine AVV-Schlüssel gefunden.
              </p>
              <p style={{
                fontSize: "0.85rem",
                color: "var(--text-faint)",
                lineHeight: 1.6,
              }}>
                Versuche es mit einem anderen Suchbegriff, einer Schlüsselnummer (z.B. 17 01) oder einem Teil der Bezeichnung.
              </p>
            </div>
          )}

          {/* Result list */}
          {results.length > 0 && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}>
              {results.map((r, i) => (
                <Link
                  key={r.schluessel_id}
                  href={`/avv/${r.schluessel_id}`}
                  className={`suche-result${i < 5 ? ` animate-fade-up delay-${i + 1}` : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    background: "var(--surface)",
                    transition: "background 0.1s",
                    textDecoration: "none",
                  }}
                >
                  {/* Schlüssel badge */}
                  <span
                    className={`badge-schluessel ${r.ist_gefaehrlich ? "gefaehrlich" : "normal"}`}
                  >
                    {r.schluessel}{r.ist_gefaehrlich && "*"}
                  </span>

                  {/* Bezeichnung + Kapitel info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "var(--text)",
                      lineHeight: 1.35,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {r.bezeichnung}
                    </div>
                    <div style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "3px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}>
                      <span>Kapitel {r.kapitel_nr}</span>
                      <span style={{
                        width: "1px",
                        height: "10px",
                        background: "var(--border)",
                        display: "inline-block",
                      }} />
                      <span>{r.kapitel_name}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span style={{
                    fontSize: "0.7rem",
                    color: "var(--text-faint)",
                    flexShrink: 0,
                  }}>
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Truncation note */}
          {totalCount === 50 && (
            <p style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginTop: "16px",
              fontStyle: "italic",
            }}>
              Es werden maximal 50 Ergebnisse angezeigt. Verfeinere deine Suche für genauere Ergebnisse.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Seitennavigation"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "4px",
                marginTop: "32px",
              }}
            >
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={`/suche?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  style={{
                    padding: "8px 14px",
                    fontSize: "0.82rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    transition: "background 0.1s",
                  }}
                  className="suche-page-btn"
                >
                  &larr; Zur&uuml;ck
                </Link>
              ) : (
                <span style={{
                  padding: "8px 14px",
                  fontSize: "0.82rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg)",
                  color: "var(--text-faint)",
                  cursor: "default",
                }}>
                  &larr; Zur&uuml;ck
                </span>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/suche?q=${encodeURIComponent(query)}&page=${p}`}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    border: `1px solid ${p === page ? "var(--navy)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    background: p === page ? "var(--navy)" : "var(--surface)",
                    color: p === page ? "#fff" : "var(--text)",
                    fontWeight: p === page ? 600 : 400,
                    transition: "background 0.1s",
                  }}
                  className={p === page ? "" : "suche-page-btn"}
                >
                  {p}
                </Link>
              ))}

              {/* Next */}
              {page < totalPages ? (
                <Link
                  href={`/suche?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  style={{
                    padding: "8px 14px",
                    fontSize: "0.82rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    transition: "background 0.1s",
                  }}
                  className="suche-page-btn"
                >
                  Weiter &rarr;
                </Link>
              ) : (
                <span style={{
                  padding: "8px 14px",
                  fontSize: "0.82rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg)",
                  color: "var(--text-faint)",
                  cursor: "default",
                }}>
                  Weiter &rarr;
                </span>
              )}
            </nav>
          )}
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          form div[style*="flex"] {
            flex-direction: column;
          }
          a[style*="gap: 16px"] {
            gap: 10px !important;
          }
        }
        .suche-breadcrumb:hover { color: var(--navy) !important; }
        .suche-result:hover { background: var(--navy-pale) !important; }
        .suche-page-btn:hover { background: var(--navy-pale) !important; }
      `}</style>
    </>
  );
}
