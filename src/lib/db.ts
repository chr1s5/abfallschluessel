import postgres from "postgres";

// ─── Serverless-optimierte Connection ────────────────────────────────────────
// WICHTIG: Auf Vercel Serverless max: 1 und PgBouncer-kompatibel (prepare: false)
// DATABASE_URL muss der POOLED Connection String von Neon sein:
// postgresql://user:pass@ep-xxx-POOLER.eu-central-1.aws.neon.tech/neondb?sslmode=require
//
// KEIN throw bei fehlender DATABASE_URL — Next.js führt diesen Code beim Build
// aus (Static Generation). Ein module-level throw würde den Build crashen und
// alle Routen mit 404 belegen. Stattdessen geben Query-Funktionen [] / null zurück.

if (!process.env.DATABASE_URL) {
  console.error(
    "[db] DATABASE_URL ist nicht gesetzt! " +
    "Bitte in Vercel unter Settings → Environment Variables eintragen. " +
    "Alle Datenbankabfragen werden leer zurückgeben."
  );
}

type Sql = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as { db: Sql | null };

const db: Sql | null =
  globalForDb.db ??
  (process.env.DATABASE_URL
    ? postgres(process.env.DATABASE_URL, {
        ssl: process.env.NODE_ENV === "production" ? "require" : false,
        max: 1,           // Serverless: 1 Verbindung pro Function-Instanz
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false,   // Wichtig für PgBouncer Transaction Mode (Neon Pooled)
      })
    : null);

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvvEintrag = {
  id: number;
  schluessel: string;
  schluessel_id: string;
  kapitel_nr: string;
  kapitel_name: string;
  gruppe_nr: string;
  gruppe_name: string;
  bezeichnung: string;
  ist_gefaehrlich: boolean;
  ist_spiegeleintrag: boolean;
  spiegel_partner_id: string | null;
  hp_eigenschaften: string[];
  synonyme: string[];
  erklaerung: string | null;
  querverweise: string[];
  u_faktor: string | null;
};

export type AvvEintragMitPartner = AvvEintrag & {
  partner?: Pick<
    AvvEintrag,
    "schluessel" | "schluessel_id" | "bezeichnung" | "ist_gefaehrlich"
  > | null;
};

export type SearchResult = Pick<
  AvvEintrag,
  "schluessel" | "schluessel_id" | "bezeichnung" | "ist_gefaehrlich" | "kapitel_nr" | "kapitel_name" | "gruppe_nr"
> & { rang?: number };

// ─── Input-Validierung ────────────────────────────────────────────────────────

/** Prüft ob ein String eine valide AVV-Schlüssel-ID ist (exakt 6 Ziffern) */
export function isValidSchluesselId(s: string): boolean {
  return /^\d{6}$/.test(s);
}

/** Prüft ob ein String eine valide Kapitel-Nummer ist (2 Ziffern, 01-20) */
export function isValidKapitelNr(s: string): boolean {
  if (!/^\d{2}$/.test(s)) return false;
  const n = parseInt(s, 10);
  return n >= 1 && n <= 20;
}

/** Prüft ob ein String eine valide Gruppe-Nummer ist ("17 01") */
export function isValidGruppeNr(s: string): boolean {
  return /^\d{2}\s\d{2}$/.test(s);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Volltext + Trigram-Suche.
 * Nutzt websearch_to_tsquery, das beliebige Nutzereingaben toleriert
 * (verhindert DoS durch invalide tsquery-Syntax).
 */
export async function searchAvv(
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  if (!db || !query || query.trim().length < 2) return [];

  const q = query.trim().slice(0, 100); // Länge begrenzen (DoS-Schutz)
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const isSchluessel = /^[\d\s]+$/.test(q);

  // Schlüssel-Suche (Präfix-Match)
  if (isSchluessel) {
    const normalized = q.replace(/\s/g, "");
    if (!/^\d{1,6}$/.test(normalized)) return [];

    return db<SearchResult[]>`
      SELECT schluessel, schluessel_id, bezeichnung,
             ist_gefaehrlich, kapitel_nr, kapitel_name, gruppe_nr
      FROM avv_eintraege
      WHERE schluessel_id LIKE ${normalized + "%"}
      ORDER BY schluessel_id
      LIMIT ${safeLimit}
    `;
  }

  // Volltext-Suche — websearch_to_tsquery akzeptiert beliebigen User-Input
  return db<SearchResult[]>`
    SELECT
      schluessel, schluessel_id, bezeichnung,
      ist_gefaehrlich, kapitel_nr, kapitel_name, gruppe_nr,
      ts_rank(fts_vector, websearch_to_tsquery('german', ${q})) AS rang
    FROM avv_eintraege
    WHERE
      fts_vector @@ websearch_to_tsquery('german', ${q})
      OR bezeichnung ILIKE ${"%" + q + "%"}
    ORDER BY rang DESC NULLS LAST, schluessel_id
    LIMIT ${safeLimit}
  `;
}

/** Einzelnen Eintrag mit Spiegelpartner laden */
export async function getEintrag(
  schluesselId: string
): Promise<AvvEintragMitPartner | null> {
  if (!db || !isValidSchluesselId(schluesselId)) return null;

  const rows = await db<AvvEintrag[]>`
    SELECT * FROM avv_eintraege
    WHERE schluessel_id = ${schluesselId}
    LIMIT 1
  `;
  if (!rows[0]) return null;

  const eintrag = rows[0];

  let partner: Pick<AvvEintrag, "schluessel" | "schluessel_id" | "bezeichnung" | "ist_gefaehrlich"> | null = null;
  if (eintrag.spiegel_partner_id && isValidSchluesselId(eintrag.spiegel_partner_id)) {
    const partnerRows = await db<Pick<AvvEintrag, "schluessel" | "schluessel_id" | "bezeichnung" | "ist_gefaehrlich">[]>`
      SELECT schluessel, schluessel_id, bezeichnung, ist_gefaehrlich
      FROM avv_eintraege
      WHERE schluessel_id = ${eintrag.spiegel_partner_id}
      LIMIT 1
    `;
    partner = partnerRows[0] ?? null;
  }

  return { ...eintrag, partner };
}

/** Alle Einträge eines Kapitels */
export async function getKapitel(kapitelNr: string): Promise<AvvEintrag[]> {
  if (!db || !isValidKapitelNr(kapitelNr)) return [];

  return db<AvvEintrag[]>`
    SELECT * FROM avv_eintraege
    WHERE kapitel_nr = ${kapitelNr}
    ORDER BY schluessel_id
  `;
}

/** Verwandte Einträge (gleiche Gruppe) */
export async function getVerwandte(
  gruppeNr: string,
  excludeId: string,
  limit = 6
): Promise<SearchResult[]> {
  if (!db || !isValidGruppeNr(gruppeNr)) return [];

  const safeLimit = Math.max(1, Math.min(limit, 20));

  return db<SearchResult[]>`
    SELECT schluessel, schluessel_id, bezeichnung,
           ist_gefaehrlich, kapitel_nr, kapitel_name, gruppe_nr
    FROM avv_eintraege
    WHERE gruppe_nr = ${gruppeNr}
      AND schluessel_id != ${excludeId}
    ORDER BY schluessel_id
    LIMIT ${safeLimit}
  `;
}

/** Alle Schlüssel für sitemap + generateStaticParams */
export async function getAlleSchluessels(): Promise<string[]> {
  if (!db) return [];

  const rows = await db<{ schluessel_id: string }[]>`
    SELECT schluessel_id FROM avv_eintraege ORDER BY schluessel_id
  `;
  return rows.map((r) => r.schluessel_id);
}

/** Kapitel-Übersicht mit Zählern */
export async function getKapitelUebersicht() {
  if (!db) return [];

  return db<{
    kapitel_nr: string;
    kapitel_name: string;
    eintraege_gesamt: number;
    eintraege_gefaehrlich: number;
  }[]>`
    SELECT
      kapitel_nr,
      kapitel_name,
      COUNT(*)::int AS eintraege_gesamt,
      SUM(CASE WHEN ist_gefaehrlich THEN 1 ELSE 0 END)::int AS eintraege_gefaehrlich
    FROM avv_eintraege
    GROUP BY kapitel_nr, kapitel_name
    ORDER BY kapitel_nr
  `;
}
