# Changelog

## [0.2.0] — 2026-04-24

### Added

#### Seiten
- **`/kapitel/[nr]`** — Kapitel-Übersichtsseite mit allen Einträgen gruppiert nach Gruppe, `generateStaticParams` für alle 20 Kapitel, SEO-Metadaten, Breadcrumb-Navigation
- **`/katalog`** — Vollständiger Katalog aller 842 Abfallschlüssel als Tabelle mit filterbaren Spalten (Kapitel, Gefährlichkeit, Spiegeleintrag), URL-State für teilbare Links
- **`/suche`** — Volltextsuche-Ergebnisseite mit Paginierung (20 pro Seite, max. 50), Breadcrumb, noindex-Metadaten
- **`/bundesland`** — Übersicht aller 16 Bundesländer mit Karten-Grid
- **`/bundesland/[kz]`** — Detailseite pro Bundesland mit Platzhalter-Regelungen, `generateStaticParams` für alle 16 Bundesländer
- **`/api-docs`** — API-Dokumentation mit Endpoints, Parametern, Beispiel-Responses und Code-Beispielen (curl, JavaScript, Python)
- **`/impressum`** — Impressum mit TODO-Platzhaltern für Betreiber-Daten
- **`/datenschutz`** — Datenschutzerklärung mit DSGVO-Hinweisen und TODO-Platzhaltern
- **`not-found.tsx`** — Custom 404-Seite im Design-System
- **`error.tsx`** — Custom Error-Boundary (500) im Design-System

#### API Routes (v1)
- **`GET /api/v1/avv/[id]`** — Einzelner AVV-Eintrag als JSON, mit ETag, CORS, Rate-Limit-Vorbereitung
- **`GET /api/v1/kapitel/[nr]`** — Alle Einträge eines Kapitels als JSON
- **`GET /api/v1/search?q=...`** — Volltextsuche via API, validiert Query-Länge

#### Infrastruktur
- **Loading States** — `loading.tsx` für Root und `/avv/[id]` mit Skeleton-UI
- **Sitemap** — Aktualisiert mit allen neuen Seiten, Bundesland-Unterseiten, priorisiert nach Gefährlichkeit
- **Projektstruktur** — Alle Dateien in korrekte Next.js App Router-Struktur unter `src/app/` verschoben

### Changed
- Footer-Link korrigiert: `/api` → `/api-docs`
- TypeScript: `useRef()` benötigt Initialisierungswert in React 19
- Server Components: `onMouseEnter`/`onMouseLeave` durch CSS `:hover` ersetzt (nicht erlaubt in Server Components)
- TypeScript-Konfiguration: Root-Level `.tsx`/`.ts` Dateien aus `tsconfig` exclude, da sie nicht zum Build gehören
- `tsconfig.json`: `resolveJsonModules` → `resolveJsonModule` (korrigierter Option-Name)

### Technical
- Alle Seiten nutzen das etablierte Design-System (DM Serif/Mono/Sans, CSS-Variablen, `.px`-Klasse)
- Server Components wo möglich, Client Components nur wo nötig (Katalog-Filter, SearchBox, Error-Boundary)
- Alle API-Routes mit CORS-Headern, Cache-Control, ETag und Rate-Limit-Kommentaren
- Responsive Design (Breakpoint 768px) auf allen neuen Seiten
