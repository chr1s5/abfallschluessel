"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      {/* Large 500 number */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(5rem, 14vw, 9rem)",
          fontWeight: 400,
          color: "var(--danger)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          opacity: 0.15,
          userSelect: "none",
        }}
      >
        500
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
        Unerwarteter Fehler
      </h1>

      {/* Sub-text */}
      <p
        style={{
          fontSize: "0.92rem",
          color: "var(--text-muted)",
          maxWidth: "420px",
          lineHeight: 1.7,
          fontWeight: 300,
          marginBottom: "12px",
        }}
      >
        Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.
      </p>

      {/* Error digest for reference */}
      {error.digest && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--text-faint)",
            letterSpacing: "0.06em",
            marginBottom: "32px",
          }}
        >
          Ref: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => reset()}
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
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          Erneut versuchen
        </button>
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
            color: "var(--navy)",
            background: "var(--navy-pale)",
            border: "1px solid var(--navy-muted)",
            borderRadius: "var(--radius)",
            transition: "background 0.15s",
          }}
        >
          Startseite
        </Link>
      </div>
    </div>
  );
}
