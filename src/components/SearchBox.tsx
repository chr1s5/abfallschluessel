"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { SearchResult } from "@/lib/db";

function SchluesselBadge({
  schluessel,
  gefaehrlich,
}: {
  schluessel: string;
  gefaehrlich: boolean;
}) {
  return (
    <span className={`badge-schluessel ${gefaehrlich ? "gefaehrlich" : "normal"}`}>
      {schluessel}
      {gefaehrlich && <span>*</span>}
    </span>
  );
}

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keyboard shortcut: "/" opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(timerRef.current);
  }, [query, search]);

  const showDropdown = focused && query.length >= 2;

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    if (e.key === "Enter" && selected >= 0 && results[selected]) {
      window.location.href = `/avv/${results[selected].schluessel_id}`;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Search box */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "var(--surface)",
        border: `2px solid ${focused ? "var(--navy)" : "var(--border-mid)"}`,
        borderRadius: "var(--radius)",
        padding: "0 16px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused
          ? "0 0 0 4px rgba(26,42,108,0.08)"
          : "var(--shadow-sm)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={focused ? "var(--navy)" : "#aaa"} strokeWidth="2.5"
          style={{ flexShrink: 0, transition: "stroke 0.2s" }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={handleKeyDown}
          placeholder='Schlüssel oder Bezeichnung — z.B. „Beton" oder „17 01"'
          aria-label="AVV-Schlüssel suchen"
          aria-autocomplete="list"
          style={{
            flex: 1, border: "none", background: "transparent",
            padding: "15px 0", fontSize: "0.95rem",
            color: "var(--text)", width: "100%",
          }}
        />

        {loading ? (
          <div style={{
            width: "16px", height: "16px", borderRadius: "50%",
            border: "2px solid var(--navy-muted)",
            borderTopColor: "var(--navy)",
            animation: "spin 0.6s linear infinite",
            flexShrink: 0,
          }} />
        ) : (
          <kbd style={{
            fontFamily: "var(--font-mono)", fontSize: "0.65rem",
            color: "#aaa", border: "1px solid var(--border)",
            borderRadius: "3px", padding: "2px 6px",
            background: "var(--bg)", flexShrink: 0,
          }}>/</kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div role="listbox" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 50, overflow: "hidden",
          animation: "fadeIn 0.12s ease",
        }}>
          {results.length === 0 && !loading && (
            <div style={{
              padding: "16px 20px", color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}>
              Kein Eintrag gefunden f&uuml;r &bdquo;{query}&ldquo;
            </div>
          )}

          {results.map((item, i) => (
            <Link
              key={item.schluessel_id}
              href={`/avv/${item.schluessel_id}`}
              role="option"
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "12px 18px",
                borderBottom: "1px solid #f5f5f3",
                transition: "background 0.1s",
                background: i === selected ? "var(--navy-pale)" : "transparent",
              }}
              onMouseEnter={() => setSelected(i)}
            >
              <SchluesselBadge
                schluessel={item.schluessel}
                gefaehrlich={item.ist_gefaehrlich}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.88rem", fontWeight: 450,
                  color: "var(--text)", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.bezeichnung}
                </div>
                <div style={{
                  fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px",
                }}>
                  Kapitel {item.kapitel_nr} · {item.gruppe_nr}
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="var(--border-mid)" strokeWidth="2"
                style={{ flexShrink: 0, marginTop: "4px" }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}

          {results.length > 0 && (
            <Link href={`/suche?q=${encodeURIComponent(query)}`} style={{
              display: "block", padding: "10px 18px",
              background: "#f8f8fc", fontSize: "0.78rem",
              color: "var(--navy)", fontWeight: 600,
              borderTop: "1px solid var(--border)",
              letterSpacing: "0.02em",
            }}>
              Alle Ergebnisse f&uuml;r &bdquo;{query}&ldquo; &rarr;
            </Link>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
