"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type EntrySlim = {
  schluessel: string;
  schluessel_id: string;
  kapitel_nr: string;
  kapitel_name: string;
  gruppe_nr: string;
  bezeichnung: string;
  ist_gefaehrlich: boolean;
  ist_spiegeleintrag: boolean;
};

type KapitelInfo = {
  kapitel_nr: string;
  kapitel_name: string;
  eintraege_gesamt: number;
  eintraege_gefaehrlich: number;
};

function KatalogFilter({
  entries,
  kapitel,
}: {
  entries: EntrySlim[];
  kapitel: KapitelInfo[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial state from URL params
  const kapitelFilter = searchParams.get("kapitel") ?? "";
  const gefaehrlichFilter = searchParams.get("gefaehrlich") ?? "";
  const spiegelFilter = searchParams.get("spiegel") ?? "";

  const [kapitelValue, setKapitelValue] = useState(kapitelFilter);
  const [gefaehrlichValue, setGefaehrlichValue] = useState(gefaehrlichFilter);
  const [spiegelValue, setSpiegelValue] = useState(spiegelFilter);

  const updateUrl = useCallback(
    (params: { kapitel?: string; gefaehrlich?: string; spiegel?: string }) => {
      const next = new URLSearchParams(searchParams.toString());

      const k = params.kapitel ?? kapitelValue;
      const g = params.gefaehrlich ?? gefaehrlichValue;
      const s = params.spiegel ?? spiegelValue;

      if (k) next.set("kapitel", k);
      else next.delete("kapitel");

      if (g) next.set("gefaehrlich", g);
      else next.delete("gefaehrlich");

      if (s) next.set("spiegel", s);
      else next.delete("spiegel");

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname, kapitelValue, gefaehrlichValue, spiegelValue]
  );

  const handleKapitelChange = useCallback(
    (value: string) => {
      setKapitelValue(value);
      updateUrl({ kapitel: value });
    },
    [updateUrl]
  );

  const handleGefaehrlichChange = useCallback(
    (value: string) => {
      setGefaehrlichValue(value);
      updateUrl({ gefaehrlich: value });
    },
    [updateUrl]
  );

  const handleSpiegelChange = useCallback(
    (value: string) => {
      setSpiegelValue(value);
      updateUrl({ spiegel: value });
    },
    [updateUrl]
  );

  const handleClearFilters = useCallback(() => {
    setKapitelValue("");
    setGefaehrlichValue("");
    setSpiegelValue("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const filtered = useMemo(() => {
    let result = entries;

    if (kapitelValue) {
      result = result.filter((e) => e.kapitel_nr === kapitelValue);
    }
    if (gefaehrlichValue === "ja") {
      result = result.filter((e) => e.ist_gefaehrlich);
    } else if (gefaehrlichValue === "nein") {
      result = result.filter((e) => !e.ist_gefaehrlich);
    }
    if (spiegelValue === "ja") {
      result = result.filter((e) => e.ist_spiegeleintrag);
    } else if (spiegelValue === "nein") {
      result = result.filter((e) => !e.ist_spiegeleintrag);
    }

    return result;
  }, [entries, kapitelValue, gefaehrlichValue, spiegelValue]);

  const hasFilters = kapitelValue || gefaehrlichValue || spiegelValue;

  const selectStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.82rem",
    padding: "8px 32px 8px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--surface)",
    color: "var(--text)",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    cursor: "pointer",
    minWidth: "160px",
  };

  return (
    <>
      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 0",
        }}
      >
        <div className="px" style={{ maxWidth: "1100px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Kapitel filter */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              Kapitel
              <select
                value={kapitelValue}
                onChange={(e) => handleKapitelChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">Alle Kapitel</option>
                {kapitel.map((k) => (
                  <option key={k.kapitel_nr} value={k.kapitel_nr}>
                    {k.kapitel_nr} — {k.kapitel_name}
                  </option>
                ))}
              </select>
            </label>

            {/* Gefährlich filter */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              Gefährlich
              <select
                value={gefaehrlichValue}
                onChange={(e) => handleGefaehrlichChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">Alle</option>
                <option value="ja">Gefährlich *</option>
                <option value="nein">Nicht gefährlich</option>
              </select>
            </label>

            {/* Spiegeleintrag filter */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
              }}
            >
              Spiegeleintrag
              <select
                value={spiegelValue}
                onChange={(e) => handleSpiegelChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">Alle</option>
                <option value="ja">Nur Spiegeleinträge</option>
                <option value="nein">Keine Spiegeleinträge</option>
              </select>
            </label>

            {/* Clear button */}
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--navy)",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap" as const,
                  alignSelf: "flex-end",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--navy-pale)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                Filter zurücksetzen
              </button>
            )}

            {/* Count */}
            <div
              style={{
                marginLeft: "auto",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                alignSelf: "flex-end",
                whiteSpace: "nowrap" as const,
                paddingBottom: "2px",
              }}
            >
              {filtered.length.toLocaleString("de")}{" "}
              {filtered.length === 1 ? "Eintrag" : "Einträge"}
              {hasFilters && (
                <span style={{ color: "var(--text-faint)" }}>
                  {" "}
                  von {entries.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "24px 0 60px" }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          {/* Desktop table wrapper */}
          <div
            className="katalog-table-wrap"
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.84rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["Schlüssel", "Bezeichnung", "Kapitel", "Gefährlich"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          borderBottom: "1px solid var(--border)",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr
                    key={e.schluessel_id}
                    style={{
                      background:
                        i % 2 === 0 ? "var(--surface)" : "var(--bg)" /* zebra */,
                    }}
                  >
                    {/* Schlüssel */}
                    <td
                      style={{
                        padding: "9px 16px",
                        borderBottom: "1px solid #f2f2f0",
                      }}
                    >
                      <Link href={`/avv/${e.schluessel_id}`}>
                        <span
                          className={`badge-schluessel ${
                            e.ist_gefaehrlich ? "gefaehrlich" : "normal"
                          }`}
                        >
                          {e.schluessel}
                          {e.ist_gefaehrlich && "*"}
                        </span>
                      </Link>
                    </td>

                    {/* Bezeichnung */}
                    <td
                      style={{
                        padding: "9px 16px",
                        borderBottom: "1px solid #f2f2f0",
                        color: "var(--text)",
                        lineHeight: 1.4,
                      }}
                    >
                      <Link
                        href={`/avv/${e.schluessel_id}`}
                        style={{
                          transition: "color 0.15s",
                          color: "var(--text)",
                        }}
                        onMouseEnter={(ev) =>
                          (ev.currentTarget.style.color = "var(--navy)")
                        }
                        onMouseLeave={(ev) =>
                          (ev.currentTarget.style.color = "var(--text)")
                        }
                      >
                        {e.bezeichnung}
                      </Link>
                    </td>

                    {/* Kapitel */}
                    <td
                      style={{
                        padding: "9px 16px",
                        borderBottom: "1px solid #f2f2f0",
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      <Link
                        href={`/kapitel/${e.kapitel_nr}`}
                        style={{
                          color: "var(--text-muted)",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(ev) =>
                          (ev.currentTarget.style.color = "var(--navy)")
                        }
                        onMouseLeave={(ev) =>
                          (ev.currentTarget.style.color = "var(--text-muted)")
                        }
                      >
                        {e.kapitel_nr}
                      </Link>
                    </td>

                    {/* Gefährlich */}
                    <td
                      style={{
                        padding: "9px 16px",
                        borderBottom: "1px solid #f2f2f0",
                      }}
                    >
                      {e.ist_gefaehrlich ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.74rem",
                            fontWeight: 500,
                            color: "var(--danger)",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--danger)",
                              display: "inline-block",
                            }}
                          />
                          Gefährlich
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center" as const,
                        color: "var(--text-muted)",
                        fontSize: "0.88rem",
                      }}
                    >
                      Keine Einträge gefunden.
                      <br />
                      <button
                        onClick={handleClearFilters}
                        style={{
                          marginTop: "12px",
                          fontSize: "0.82rem",
                          color: "var(--navy)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        Filter zurücksetzen
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Responsive: stack table into cards ──────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .katalog-table-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .katalog-table-wrap table {
            min-width: 580px;
          }
        }
      `}</style>
    </>
  );
}

export function KatalogClient({
  entries,
  kapitel,
}: {
  entries: EntrySlim[];
  kapitel: KapitelInfo[];
}) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
          }}
        >
          Katalog wird geladen…
        </div>
      }
    >
      <KatalogFilter entries={entries} kapitel={kapitel} />
    </Suspense>
  );
}
