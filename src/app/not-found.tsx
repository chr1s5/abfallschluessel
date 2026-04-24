import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Seite nicht gefunden",
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      {/* Large 404 number */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(5rem, 14vw, 9rem)",
          fontWeight: 400,
          color: "var(--navy)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          opacity: 0.15,
          userSelect: "none",
        }}
      >
        404
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
          fontWeight: 400,
          color: "var(--text)",
          marginTop: "16px",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
        }}
      >
        Seite nicht gefunden
      </h1>

      {/* Sub-text */}
      <p
        style={{
          fontSize: "0.92rem",
          color: "var(--text-muted)",
          maxWidth: "420px",
          lineHeight: 1.7,
          fontWeight: 300,
          marginBottom: "36px",
        }}
      >
        Die angeforderte Seite existiert nicht oder wurde verschoben.
        Suche nach einem AVV-Schlüssel oder kehre zur Startseite zurück.
      </p>

      {/* Action links */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 22px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.84rem",
            fontWeight: 500,
            color: "#fff",
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            transition: "background 0.15s",
          }}
        >
          Startseite
        </Link>
        <Link
          href="/katalog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 22px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.84rem",
            fontWeight: 500,
            color: "var(--navy)",
            background: "var(--navy-pale)",
            border: "1px solid var(--navy-muted)",
            borderRadius: "var(--radius)",
            transition: "background 0.15s",
          }}
        >
          AVV-Katalog
        </Link>
      </div>
    </div>
  );
}
