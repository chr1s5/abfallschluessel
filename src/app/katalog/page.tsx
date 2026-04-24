import type { Metadata } from "next";
import Link from "next/link";
import { getKapitelUebersicht, getKapitel, type AvvEintrag } from "@/lib/db";
import { KatalogClient } from "./KatalogClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "AVV-Katalog — Alle 842 Abfallschlüssel | avv.valeoro.net",
  description:
    "Vollständiger Katalog aller 842 AVV-Abfallschlüssel nach Europäischem Abfallkatalog. Filterbar nach Kapitel, Gefährlichkeit und Spiegeleintrag.",
  openGraph: {
    title: "AVV-Katalog — Alle 842 Abfallschlüssel",
    description:
      "Vollständiger Katalog aller 842 AVV-Abfallschlüssel nach Europäischem Abfallkatalog.",
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net"
    }/katalog`,
  },
};

export default async function KatalogPage() {
  const kapitelUebersicht = await getKapitelUebersicht();

  // Fetch all entries from all chapters in parallel
  const allEntriesPromises = kapitelUebersicht.map((k) =>
    getKapitel(k.kapitel_nr)
  );
  const chapterResults = await Promise.all(allEntriesPromises);
  const allEntries: AvvEintrag[] = chapterResults.flat();

  // Serialize for client component — convert arrays to JSON-safe format
  const serializedEntries = allEntries.map((e) => ({
    schluessel: e.schluessel,
    schluessel_id: e.schluessel_id,
    kapitel_nr: e.kapitel_nr,
    kapitel_name: e.kapitel_name,
    gruppe_nr: e.gruppe_nr,
    bezeichnung: e.bezeichnung,
    ist_gefaehrlich: e.ist_gefaehrlich,
    ist_spiegeleintrag: e.ist_spiegeleintrag,
  }));

  const serializedKapitel = kapitelUebersicht.map((k) => ({
    kapitel_nr: k.kapitel_nr,
    kapitel_name: k.kapitel_name,
    eintraege_gesamt: k.eintraege_gesamt,
    eintraege_gefaehrlich: k.eintraege_gefaehrlich,
  }));

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "40px 0 0",
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
              marginBottom: "24px",
            }}
          >
            <Link
              href="/"
              className="katalog-breadcrumb"
              style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
            >
              Startseite
            </Link>
            <span style={{ color: "var(--border-mid)" }}>›</span>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>
              Vollständiger Katalog
            </span>
          </nav>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: "8px",
            }}
          >
            AVV-Abfallkatalog
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              maxWidth: "600px",
              marginBottom: "32px",
            }}
          >
            Alle {allEntries.length} Abfallschlüssel des Europäischen
            Abfallverzeichnisses — filterbar nach Kapitel, Gefährlichkeit und
            Spiegeleintrag.
          </p>
        </div>
      </header>

      {/* ── Filter + Table ────────────────────────────────────────────────── */}
      <KatalogClient entries={serializedEntries} kapitel={serializedKapitel} />
    
      {/* CSS hover effects */}
      <style>{`
        .katalog-breadcrumb:hover { color: var(--navy) !important; }
      `}</style>
</>
  );
}
