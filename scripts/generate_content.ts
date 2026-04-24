#!/usr/bin/env tsx
/**
 * AVV Content Generator
 * =====================
 * Generiert für jeden der 842 AVV-Einträge redaktionellen Content:
 * - Erklärung (2-3 Sätze, sachlich, SEO-freundlich)
 * - Synonyme (3-8 alternative Begriffe für Volltextsuche)
 * - Praxisbeispiele (wo entsteht dieser Abfall?)
 * - FAQ (3 häufige Fragen + Antworten)
 * - Entsorgungshinweis (allgemein, ohne rechtsverbindlich zu wirken)
 *
 * Features:
 * - Parallelisierung (5 gleichzeitige API-Calls)
 * - Resumable: kann nach Abbruch weitermachen (überspringt bereits befüllte)
 * - Dry-Run Modus
 * - Cost-Tracking
 * - Rate-Limiting (Anthropic Tier 1: 50 RPM)
 *
 * Voraussetzungen:
 *   npm install @anthropic-ai/sdk postgres tsx dotenv
 *
 * Verwendung:
 *   # Erst dry-run zum Testen (nur 5 Einträge)
 *   tsx scripts/generate_content.ts --limit 5 --dry-run
 *
 *   # Live-Lauf alle Einträge
 *   tsx scripts/generate_content.ts
 *
 *   # Nur Kapitel 17 (Bau & Abbruch)
 *   tsx scripts/generate_content.ts --kapitel 17
 *
 *   # Bestimmten Schlüssel neu generieren (überschreibt vorhandenen Content)
 *   tsx scripts/generate_content.ts --schluessel 170101 --force
 *
 * Kostenschätzung:
 *   Claude Haiku 4.5: ~$0.80-1.20 USD für alle 842 Einträge
 *   Claude Sonnet 4.5: ~$8-12 USD für alle 842 Einträge (höhere Qualität)
 */

import Anthropic from "@anthropic-ai/sdk";
import postgres from "postgres";
import { parseArgs } from "node:util";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ─── Konfiguration ────────────────────────────────────────────────────────────

const MODEL_HAIKU = "claude-haiku-4-5-20251001";
const MODEL_SONNET = "claude-sonnet-4-6";
// Preis pro 1M Token (Stand 2025/2026 — vor Nutzung prüfen!)
const PRICING = {
  [MODEL_HAIKU]:  { input: 1.00, output: 5.00  },
  [MODEL_SONNET]: { input: 3.00, output: 15.00 },
};

const CONCURRENCY = 5;           // Parallele API-Calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const PROGRESS_FILE = ".content-generator-progress.json";
const COST_LOG_FILE = ".content-generator-costs.jsonl";

// ─── CLI Args ─────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    "dry-run":    { type: "boolean", default: false },
    limit:        { type: "string" },
    kapitel:      { type: "string" },
    schluessel:   { type: "string" },
    force:        { type: "boolean", default: false },
    model:        { type: "string", default: "haiku" }, // haiku | sonnet
    concurrency:  { type: "string", default: String(CONCURRENCY) },
  },
});

const MODEL = args.model === "sonnet" ? MODEL_SONNET : MODEL_HAIKU;
const CONCURRENCY_RESOLVED = parseInt(args.concurrency ?? String(CONCURRENCY), 10);

// ─── Types ────────────────────────────────────────────────────────────────────

type EintragInput = {
  id: number;
  schluessel: string;
  schluessel_id: string;
  bezeichnung: string;
  kapitel_nr: string;
  kapitel_name: string;
  gruppe_nr: string;
  gruppe_name: string;
  ist_gefaehrlich: boolean;
  ist_spiegeleintrag: boolean;
  erklaerung: string | null;
};

type GeneratedContent = {
  erklaerung: string;
  synonyme: string[];
  praxisbeispiel: string;
  faq: { frage: string; antwort: string }[];
  entsorgungshinweis: string;
};

type ProgressState = {
  startedAt: string;
  completed: string[];       // schluessel_ids
  failed: { id: string; error: string }[];
  totalCostUSD: number;
  inputTokens: number;
  outputTokens: number;
};

// ─── Setup ────────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL fehlt in .env");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY fehlt in .env");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  max: 2,
  prepare: false,
});

const anthropic = new Anthropic();

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist ein Experte für deutsches Abfallrecht und das
Europäische Abfallverzeichnis (AVV / Abfallverzeichnis-Verordnung).

Deine Aufgabe: Für einen gegebenen AVV-Schlüssel erstellst du präzise,
faktische, SEO-freundliche redaktionelle Inhalte.

Regeln:
- Schreibe in einfachem, klarem Deutsch
- Keine Spekulation — nur gesicherte Fachkenntnis
- Keine rechtsverbindlichen Aussagen (keine "müssen", "dürfen nicht"-Formulierungen)
- Verwende "häufig", "typisch", "in der Regel" bei Beschreibungen
- Bei gefährlichen Abfällen (*) weise auf die besonderen Anforderungen hin, ohne zu konkret zu werden
- KEINE Werbung für Entsorgungsunternehmen
- Erklärungen sollen Laien und Fachleute gleichermaßen verstehen können
- Antworte IMMER NUR mit validem JSON, keine Kommentare davor oder danach, keine Markdown-Codeblöcke`;

function buildUserPrompt(e: EintragInput): string {
  return `AVV-Eintrag:
- Schlüssel: ${e.schluessel}${e.ist_gefaehrlich ? " (gefährlich *)" : ""}
- Bezeichnung: ${e.bezeichnung}
- Kapitel ${e.kapitel_nr}: ${e.kapitel_name}
- Gruppe ${e.gruppe_nr}: ${e.gruppe_name}
- Spiegeleintrag: ${e.ist_spiegeleintrag ? "ja" : "nein"}

Erstelle folgende redaktionelle Inhalte als JSON:

{
  "erklaerung": "2-3 Sätze, max. 350 Zeichen. Erklärt: Was ist dieser Abfall? Wo entsteht er typisch? Warum ist er so klassifiziert?",
  "synonyme": ["alternatives Wort 1", "alternatives Wort 2", "..."],
  "praxisbeispiel": "1 konkretes Beispiel in 1-2 Sätzen wo dieser Abfall in der Praxis entsteht (max. 200 Zeichen)",
  "faq": [
    {"frage": "Kurze Frage (max. 80 Zeichen)", "antwort": "Antwort in 1-3 Sätzen (max. 300 Zeichen)"},
    {"frage": "...", "antwort": "..."},
    {"frage": "...", "antwort": "..."}
  ],
  "entsorgungshinweis": "1-2 Sätze allgemeiner Hinweis zur korrekten Entsorgung, ohne rechtsverbindlich zu werden (max. 250 Zeichen)"
}

Wichtig:
- synonyme: 3-8 Einträge, alle klein geschrieben, keine Duplikate, relevant für Suchanfragen
- faq: Genau 3 Fragen, die Nutzer tatsächlich stellen würden
- Bei gefährlichen Abfällen: erwähne die besondere Kennzeichnungspflicht
- Bei Spiegeleinträgen: erwähne dass es eine nicht-gefährliche/gefährliche Variante gibt

Antworte NUR mit dem JSON, nichts anderes.`;
}

// ─── Progress State ───────────────────────────────────────────────────────────

function loadProgress(): ProgressState {
  if (!existsSync(PROGRESS_FILE)) {
    return {
      startedAt: new Date().toISOString(),
      completed: [],
      failed: [],
      totalCostUSD: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
  }
  return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
}

function saveProgress(p: ProgressState) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ─── Content Generation ──────────────────────────────────────────────────────

async function generateOne(
  eintrag: EintragInput,
  retries = MAX_RETRIES
): Promise<{ content: GeneratedContent; usage: { input: number; output: number } }> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(eintrag) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Keine Text-Antwort von Claude erhalten");
    }

    // JSON extrahieren — Claude gibt manchmal ```json Blöcke aus
    let jsonText = textBlock.text.trim();
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    const parsed = JSON.parse(jsonText) as GeneratedContent;

    // Validierung
    if (!parsed.erklaerung || typeof parsed.erklaerung !== "string") {
      throw new Error("erklaerung fehlt oder ist kein String");
    }
    if (!Array.isArray(parsed.synonyme) || parsed.synonyme.length < 2) {
      throw new Error("synonyme muss ein Array mit mindestens 2 Einträgen sein");
    }
    if (!Array.isArray(parsed.faq) || parsed.faq.length !== 3) {
      throw new Error("faq muss genau 3 Einträge haben");
    }
    for (const f of parsed.faq) {
      if (!f.frage || !f.antwort) throw new Error("faq-Eintrag unvollständig");
    }

    // Längenprüfungen
    if (parsed.erklaerung.length > 400) {
      parsed.erklaerung = parsed.erklaerung.slice(0, 397) + "...";
    }

    return {
      content: parsed,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (retries > 0) {
      console.warn(`  ⚠ Retry (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) für ${eintrag.schluessel_id}: ${msg}`);
      await sleep(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
      return generateOne(eintrag, retries - 1);
    }
    throw err;
  }
}

// ─── DB Operations ────────────────────────────────────────────────────────────

async function loadEintraege(): Promise<EintragInput[]> {
  const where: string[] = [];
  const params: (string | number)[] = [];

  // Filter-Bedingungen als tagged template brauchen wir dynamisch — hier Workaround
  if (args.schluessel) {
    if (!/^\d{6}$/.test(args.schluessel)) {
      throw new Error("--schluessel muss 6-stellig sein, z.B. 170101");
    }
    return sql<EintragInput[]>`
      SELECT id, schluessel, schluessel_id, bezeichnung,
             kapitel_nr, kapitel_name, gruppe_nr, gruppe_name,
             ist_gefaehrlich, ist_spiegeleintrag, erklaerung
      FROM avv_eintraege
      WHERE schluessel_id = ${args.schluessel}
    `;
  }

  if (args.kapitel) {
    if (!/^\d{1,2}$/.test(args.kapitel)) {
      throw new Error("--kapitel muss 1-2-stellig sein, z.B. 17");
    }
    const kap = args.kapitel.padStart(2, "0");
    return sql<EintragInput[]>`
      SELECT id, schluessel, schluessel_id, bezeichnung,
             kapitel_nr, kapitel_name, gruppe_nr, gruppe_name,
             ist_gefaehrlich, ist_spiegeleintrag, erklaerung
      FROM avv_eintraege
      WHERE kapitel_nr = ${kap}
      ORDER BY schluessel_id
    `;
  }

  // Alle Einträge
  const limit = args.limit ? parseInt(args.limit, 10) : null;
  if (limit) {
    return sql<EintragInput[]>`
      SELECT id, schluessel, schluessel_id, bezeichnung,
             kapitel_nr, kapitel_name, gruppe_nr, gruppe_name,
             ist_gefaehrlich, ist_spiegeleintrag, erklaerung
      FROM avv_eintraege
      ORDER BY schluessel_id
      LIMIT ${limit}
    `;
  }

  return sql<EintragInput[]>`
    SELECT id, schluessel, schluessel_id, bezeichnung,
           kapitel_nr, kapitel_name, gruppe_nr, gruppe_name,
           ist_gefaehrlich, ist_spiegeleintrag, erklaerung
    FROM avv_eintraege
    ORDER BY schluessel_id
  `;
}

async function saveContent(
  schluesselId: string,
  content: GeneratedContent
): Promise<void> {
  await sql`
    UPDATE avv_eintraege
    SET
      erklaerung = ${content.erklaerung},
      synonyme   = ${sql.array(content.synonyme, "text")},
      content_json = ${sql.json({
        praxisbeispiel: content.praxisbeispiel,
        faq: content.faq,
        entsorgungshinweis: content.entsorgungshinweis,
        generated_at: new Date().toISOString(),
        model: MODEL,
      })},
      aktualisiert_am = NOW()
    WHERE schluessel_id = ${schluesselId}
  `;
}

// ─── Parallel Processing ──────────────────────────────────────────────────────

async function processBatch(
  eintraege: EintragInput[],
  progress: ProgressState
): Promise<void> {
  const queue = [...eintraege];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < CONCURRENCY_RESOLVED; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const e = queue.shift();
        if (!e) break;

        const startTime = Date.now();

        try {
          const { content, usage } = await generateOne(e);

          if (!args["dry-run"]) {
            await saveContent(e.schluessel_id, content);
          }

          // Kosten tracken
          const pricing = PRICING[MODEL];
          const cost =
            (usage.input / 1_000_000) * pricing.input +
            (usage.output / 1_000_000) * pricing.output;

          progress.completed.push(e.schluessel_id);
          progress.inputTokens += usage.input;
          progress.outputTokens += usage.output;
          progress.totalCostUSD += cost;

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(
            `  ✓ ${e.schluessel_id} ${e.schluessel}${e.ist_gefaehrlich ? "*" : " "} ` +
            `(${elapsed}s, ${usage.input}+${usage.output} tok, $${cost.toFixed(4)}) ` +
            `— ${e.bezeichnung.slice(0, 40)}`
          );

          // Inkrementell speichern (alle 10 Einträge)
          if (progress.completed.length % 10 === 0) {
            saveProgress(progress);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`  ✗ ${e.schluessel_id}: ${msg}`);
          progress.failed.push({ id: e.schluessel_id, error: msg });
          saveProgress(progress);
        }
      }
    })());
  }

  await Promise.all(workers);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 AVV Content Generator");
  console.log("─".repeat(60));
  console.log(`Model:       ${MODEL}`);
  console.log(`Concurrency: ${CONCURRENCY_RESOLVED}`);
  console.log(`Dry-Run:     ${args["dry-run"] ? "JA" : "nein"}`);
  if (args.schluessel) console.log(`Schlüssel:   ${args.schluessel}`);
  if (args.kapitel) console.log(`Kapitel:     ${args.kapitel}`);
  if (args.limit) console.log(`Limit:       ${args.limit}`);
  console.log("─".repeat(60));

  // Einträge laden
  const alle = await loadEintraege();
  console.log(`Gefundene Einträge: ${alle.length}`);

  // Progress laden
  const progress = loadProgress();

  // Bereits befüllte filtern (außer --force)
  const zuBearbeiten = args.force
    ? alle
    : alle.filter((e) => {
        const alreadyDone =
          progress.completed.includes(e.schluessel_id) ||
          (e.erklaerung && e.erklaerung.length > 50);
        return !alreadyDone;
      });

  console.log(`Zu bearbeiten:      ${zuBearbeiten.length}`);
  console.log(`Bereits erledigt:   ${alle.length - zuBearbeiten.length}`);

  if (zuBearbeiten.length === 0) {
    console.log("\n✨ Nichts zu tun — alles bereits generiert!");
    await sql.end();
    return;
  }

  // Kostenschätzung
  const pricing = PRICING[MODEL];
  const estCost = (zuBearbeiten.length * 1200 / 1_000_000) * pricing.output +
                  (zuBearbeiten.length * 400 / 1_000_000) * pricing.input;
  console.log(`Geschätzte Kosten:  $${estCost.toFixed(2)}`);

  if (!args["dry-run"] && zuBearbeiten.length > 20) {
    console.log("\n⏳ Starte in 5 Sekunden... (Ctrl+C zum Abbrechen)");
    await sleep(5000);
  }

  console.log("\n─".repeat(60));

  const startTime = Date.now();
  await processBatch(zuBearbeiten, progress);
  const duration = Date.now() - startTime;

  saveProgress(progress);

  // Summary
  console.log("\n" + "─".repeat(60));
  console.log("📊 Zusammenfassung");
  console.log("─".repeat(60));
  console.log(`Dauer:              ${formatDuration(duration)}`);
  console.log(`Erfolgreich:        ${progress.completed.length}`);
  console.log(`Fehlgeschlagen:     ${progress.failed.length}`);
  console.log(`Input-Tokens:       ${progress.inputTokens.toLocaleString()}`);
  console.log(`Output-Tokens:      ${progress.outputTokens.toLocaleString()}`);
  console.log(`Gesamtkosten:       $${progress.totalCostUSD.toFixed(4)}`);

  if (progress.failed.length > 0) {
    console.log("\n⚠ Fehlgeschlagene Einträge:");
    for (const f of progress.failed.slice(0, 10)) {
      console.log(`  ${f.id}: ${f.error.slice(0, 80)}`);
    }
    console.log(`\nFehler-Details in: ${PROGRESS_FILE}`);
    console.log("Wiederholen mit: tsx scripts/generate_content.ts --force --schluessel <id>");
  }

  await sql.end();
}

main().catch((err) => {
  console.error("\n💥 Fataler Fehler:", err);
  process.exit(1);
});
