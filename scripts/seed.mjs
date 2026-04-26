#!/usr/bin/env node
/**
 * Datenbankinitialisierung für Neon (Vercel-Deployment) und lokales Docker.
 * Führt Schema-Migration und Datenimport idempotent aus.
 *
 * Verwendung:
 *   DATABASE_URL="postgresql://..." node scripts/seed.mjs
 *   npm run db:push
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

if (!process.env.DATABASE_URL) {
  console.error("Fehler: DATABASE_URL ist nicht gesetzt.");
  console.error(
    "Beispiel: DATABASE_URL=postgresql://user:pass@host/db node scripts/seed.mjs"
  );
  process.exit(1);
}

const url = process.env.DATABASE_URL;
const isLocal =
  url.includes("localhost") || url.includes("127.0.0.1");

const sql = postgres(url, {
  ssl: isLocal ? false : "require",
  max: 1,
  idle_timeout: 30,
  connect_timeout: 15,
});

// Schema nur anlegen wenn Haupttabelle noch nicht vorhanden ist
const [{ exists }] = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'avv_eintraege'
  ) AS exists
`;

if (!exists) {
  console.log("Schema wird erstellt...");
  const schema = readFileSync(join(root, "src/lib/schema.sql"), "utf8");
  await sql.unsafe(schema);
  console.log("Schema erstellt.");
} else {
  console.log("Schema existiert bereits, wird uebersprungen.");
}

console.log("AVV-Daten werden importiert (kann einen Moment dauern)...");
const data = readFileSync(join(root, "data/avv.sql"), "utf8");
await sql.unsafe(data);

const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM avv_eintraege`;
console.log(`Fertig: ${n} Eintraege in der Datenbank.`);

await sql.end();
