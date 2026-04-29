# avv.valeoro.net

> Vollständiges Lexikon des Europäischen Abfallverzeichnisses (AVV) mit Volltextsuche,
> Bundesland-Regelungen, Klassifizierungs-Wizard und offener API.

## Lokale Entwicklung

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen setzen
cp .env.example .env.local
# → DATABASE_URL in .env.local eintragen (Neon oder lokales Docker)

# 3. Datenbank aufsetzen (einmalig)
npm run db:push

# 4. Dev-Server starten
npm run dev
# → http://localhost:3000
```

## Deployment (Vercel + Neon)

```bash
# Vercel CLI
npm i -g vercel
vercel login
vercel env add DATABASE_URL     # Neon POOLED Connection String eintragen
                                # Format: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Datenbank einmalig befüllen (Neon hat noch keine Daten!)
DATABASE_URL="<dein-neon-url>" npm run db:push

vercel --prod                   # Production Deploy
```

## Projektstruktur

```
src/
├── app/
│   ├── page.tsx                # Startseite
│   ├── avv/[id]/page.tsx       # Detailseite (842 statische Seiten)
│   ├── kapitel/[nr]/page.tsx   # Kapitelseiten
│   ├── api/search/route.ts     # Suche API
│   └── sitemap.ts              # Automatische Sitemap
├── components/
│   ├── Nav.tsx
│   └── SearchBox.tsx
└── lib/
    └── db.ts                   # PostgreSQL + Query-Helpers
```

## Datenquellen

- **AVV offizell:** https://www.gesetze-im-internet.de/avv/
- **Bayern + U-Faktoren:** https://www.statistik.bayern.de/
- **LUBW BW:** https://www.lubw.baden-wuerttemberg.de/
- **IPA bundesweit:** https://www.abfallbewertung.org/

## Rechtliches

Alle Angaben ohne Gewähr. Verbindlich ist die amtliche Fassung der AVV
(BGBl. I S. 3379, zuletzt geändert BGBl. I S. 1533).

AVV-Daten: gemeinfrei (§ 5 UrhG) · Eigener Code: MIT
