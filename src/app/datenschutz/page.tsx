import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Datenschutzerklärung | avv.valeoro.net",
  description:
    "Datenschutzerklärung — Informationen zum Umgang mit personenbezogenen Daten auf avv.valeoro.net",
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net"
    }/datenschutz`,
  },
};

// ── Shared styles ──────────────────────────────────────────────────────────────

const sectionGap = { marginTop: "40px" } as const;

const h2 = {
  fontFamily: "var(--font-serif)" as const,
  fontSize: "1.3rem",
  fontWeight: 400,
  letterSpacing: "-0.01em",
  marginBottom: "12px",
  lineHeight: 1.3,
} as const;

const body = {
  fontSize: "0.88rem",
  lineHeight: 1.75,
  color: "var(--text)",
} as const;

const muted = {
  ...body,
  color: "var(--text-muted)",
} as const;

const placeholder = {
  ...body,
  background: "var(--navy-pale)",
  border: "1px solid var(--navy-muted)",
  borderRadius: "var(--radius-sm)",
  padding: "12px 16px",
  fontFamily: "var(--font-mono)" as const,
  fontSize: "0.82rem",
  color: "var(--navy)",
  whiteSpace: "pre-wrap" as const,
} as const;

const bulletList = {
  ...muted,
  paddingLeft: "20px",
  listStyle: "disc",
} as const;

const liSpacer = { marginTop: "6px" } as const;

// ── Page Component ─────────────────────────────────────────────────────────────

export default function DatenschutzPage() {
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
        <div className="px" style={{ maxWidth: "760px", margin: "0 auto" }}>
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
              className="legal-breadcrumb"
              style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
            >
              Startseite
            </Link>
            <span style={{ color: "var(--border-mid)" }}>›</span>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>
              Datenschutz
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
            Datenschutzerkl&auml;rung
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            Informationen zum Umgang mit personenbezogenen Daten
          </p>
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "40px 0 80px",
        }}
      >
        <div className="px" style={{ maxWidth: "760px", margin: "0 auto" }}>
          {/* Verantwortliche Stelle */}
          <div style={sectionGap}>
            <h2 style={h2}>1. Verantwortliche Stelle</h2>
            <p style={muted}>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            {/* TODO: Betreiberdaten eintragen */}
            <div style={{ ...placeholder, marginTop: "12px" }}>
{`TODO: [Vorname Nachname / Firmenname]
TODO: [Straße und Hausnummer]
TODO: [PLZ Ort]
TODO: E-Mail: name@example.com`}
            </div>
            <p style={{ ...muted, marginTop: "12px" }}>
              Verantwortliche Stelle ist die natürliche oder juristische Person,
              die allein oder gemeinsam mit anderen über die Zwecke und Mittel
              der Verarbeitung von personenbezogenen Daten entscheidet.
            </p>
          </div>

          {/* Überblick: Welche Daten werden verarbeitet? */}
          <div style={sectionGap}>
            <h2 style={h2}>2. Überblick: Welche Daten werden verarbeitet?</h2>
            <p style={muted}>
              Beim Aufrufen dieser Website werden durch den Browser automatisch
              Informationen an den Server gesendet. Diese temporären
              Server-Logfiles enthalten:
            </p>
            <ul style={{ ...bulletList, marginTop: "12px" }}>
              <li>IP-Adresse (anonymisiert, siehe Abschnitt 3)</li>
              <li style={liSpacer}>
                Datum und Uhrzeit der Anfrage
              </li>
              <li style={liSpacer}>
                Angforderte Ressource (URL, HTTP-Methode)
              </li>
              <li style={liSpacer}>
                Referrer-URL (die Seite, von der aus aufgerufen wurde)
              </li>
              <li style={liSpacer}>
                Browser-Kennung (User-Agent)
              </li>
              <li style={liSpacer}>
                HTTP-Statuscode der Antwort
              </li>
            </ul>
            <p style={{ ...muted, marginTop: "12px" }}>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird
              nicht vorgenommen. Die Logfiles werden nach 7 Tagen automatisch
              gelöscht.
            </p>
          </div>

          {/* Keine Cookies, kein Tracking */}
          <div style={sectionGap}>
            <h2 style={h2}>3. Keine Cookies, kein Tracking</h2>
            <p style={muted}>
              Diese Website verwendet <strong>keine Cookies</strong> — weder
              technische noch Analyse-Cookies. Es wird kein Tracking, keine
              Nutzerprofilerstellung und keine Retargeting-Technologie
              eingesetzt.
            </p>
            <p style={{ ...muted, marginTop: "12px" }}>
              Insbesondere setzen wir <strong>kein Google Analytics</strong>, kein
              Facebook Pixel, keine Hotjar- oder Matomo-Instanz und keine
              vergleichbaren Dienste ein. Die Website funktioniert vollständig
              ohne clientseitige Datenerhebung.
            </p>
          </div>

          {/* Schriften */}
          <div style={sectionGap}>
            <h2 style={h2}>4. Schriftarten: Selbst gehostet</h2>
            <p style={muted}>
              Die auf dieser Website verwendeten Schriftarten (DM Serif Display,
              DM Mono, DM Sans) werden über den Next.js-Mechanismus{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.84rem",
                  background: "var(--navy-pale)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                next/font
              </code>{" "}
              selbst gehostet und direkt vom eigenen Server ausgeliefert. Es
              findet <strong>kein Aufruf externer CDN-Server</strong> (z.B.
              Google Fonts) statt, sodass keine Verbindung zu Drittanbietern
              beim Laden der Seite aufgebaut wird.
            </p>
          </div>

          {/* API-Logging */}
          <div style={sectionGap}>
            <h2 style={h2}>5. API-Logging</h2>
            <p style={muted}>
              Die öffentliche API dieser Website (
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.84rem",
                  background: "var(--navy-pale)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                /api/v1/*
              </code>
              ) protokolliert Zugriffe in anonymisierter Form. Die IP-Adressen
              werden dabei gekürzt (z.B. die letzten 8 Bit auf 0 gesetzt), sodass
              keine Zuordnung zu einzelnen Nutzern möglich ist.
            </p>
            <p style={{ ...muted, marginTop: "12px" }}>
              Es werden <strong>keine personenbezogenen Daten</strong> über die
              API gespeichert. Die Logdaten dienen ausschließlich der
              Erkennung von Missbrauch (Rate-Limiting) und der
              Gewährleistung der technischen Stabilität.
            </p>
          </div>

          {/* Nutzerrechte (DSGVO) */}
          <div style={sectionGap}>
            <h2 style={h2}>6. Ihre Rechte (DSGVO)</h2>
            <p style={muted}>
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie
              betreffenden personenbezogenen Daten:
            </p>
            <ul style={{ ...bulletList, marginTop: "12px" }}>
              <li>
                <strong>Auskunftsrecht</strong> (Art. 15 DSGVO) — Sie haben das
                Recht zu erfahren, welche personenbezogenen Daten wir über Sie
                verarbeiten.
              </li>
              <li style={liSpacer}>
                <strong>Berichtigungsrecht</strong> (Art. 16 DSGVO) — Sie haben
                das Recht, die Berichtigung falscher Daten zu verlangen.
              </li>
              <li style={liSpacer}>
                <strong>Löschungsrecht</strong> (Art. 17 DSGVO) — Sie haben das
                Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen.
              </li>
              <li style={liSpacer}>
                <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO) —
                Sie können die Einschränkung der Verarbeitung verlangen.
              </li>
              <li style={liSpacer}>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Sie haben
                das Recht, Ihre Daten in einem strukturierten Format zu erhalten.
              </li>
              <li style={liSpacer}>
                <strong>Beschwerderecht</strong> (Art. 77 DSGVO) — Sie haben das
                Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
              </li>
            </ul>
          </div>

          {/* Kontakt für Datenschutz-Anfragen */}
          <div style={sectionGap}>
            <h2 style={h2}>7. Kontakt für Datenschutz-Anfragen</h2>
            <p style={muted}>
              Für Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte
              wenden Sie sich bitte an:
            </p>
            {/* TODO: Kontakt für Datenschutz-Anfragen eintragen */}
            <div style={{ ...placeholder, marginTop: "12px" }}>
{`TODO: E-Mail: datenschutz@example.com
TODO: Telefon: +49 ... (optional)
TODO: Postalisch: [Straße, PLZ Ort]`}
            </div>
          </div>
        </div>
      </section>
    
      {/* CSS hover effects */}
      <style>{`
        .legal-breadcrumb:hover { color: var(--navy) !important; }
      `}</style>
</>
  );
}
