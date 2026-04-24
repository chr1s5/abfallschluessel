import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Impressum | avv.valeoro.net",
  description: "Impressum — Angaben gemäß § 5 TMG",
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net"
    }/impressum`,
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

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ImpressumPage() {
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
              Impressum
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
            Impressum
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            Angaben gemäß § 5 TMG
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
          {/* Angaben gemäß § 5 TMG */}
          <div style={sectionGap}>
            <h2 style={h2}>Angaben gemäß § 5 TMG</h2>
            {/* TODO: Betreiberdaten eintragen */}
            <div style={placeholder}>
{`TODO: [Vorname Nachname / Firmenname]
TODO: [Straße und Hausnummer]
TODO: [PLZ Ort]`}
            </div>
          </div>

          {/* Vertreten durch */}
          <div style={sectionGap}>
            <h2 style={h2}>Vertreten durch</h2>
            {/* TODO: gesetzlicher Vertreter */}
            <div style={placeholder}>
{`TODO: [Vorname Nachname]
TODO: [ggf. Funktion, z.B. Geschäftsführer]`}
            </div>
          </div>

          {/* Kontakt */}
          <div style={sectionGap}>
            <h2 style={h2}>Kontakt</h2>
            {/* TODO: Kontaktdaten eintragen */}
            <div style={placeholder}>
{`TODO: E-Mail: name@example.com
TODO: Telefon: +49 ... (optional)`}
            </div>
          </div>

          {/* Umsatzsteuer-ID */}
          <div style={sectionGap}>
            <h2 style={h2}>Umsatzsteuer-Identifikationsnummer</h2>
            {/* TODO: USt-IdNr. eintragen */}
            <div style={placeholder}>
              {`TODO: Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\nTODO: DE XXX XXX XXX`}
            </div>
          </div>

          {/* Verantwortlich für Inhalt */}
          <div style={sectionGap}>
            <h2 style={h2}>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            {/* TODO: Verantwortliche Person eintragen */}
            <div style={placeholder}>
{`TODO: [Vorname Nachname]
TODO: [Straße und Hausnummer]
TODO: [PLZ Ort]`}
            </div>
          </div>

          {/* Haftungsausschluss */}
          <div style={sectionGap}>
            <h2 style={h2}>Haftungsausschluss</h2>

            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Haftung für Inhalte
            </h3>
            <p style={muted}>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
              sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
              10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen
              oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung
              der Nutzung von Informationen nach den allgemeinen Gesetzen
              bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten
              Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 600,
                marginBottom: "8px",
                marginTop: "24px",
              }}
            >
              Haftung für Links
            </h3>
            <p style={muted}>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle
              der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
              einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </div>

          {/* Urheberrecht */}
          <div style={sectionGap}>
            <h2 style={h2}>Hinweis zum Urheberrecht</h2>
            <p style={muted}>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
              Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
              Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Sollten Sie trotzdem auf eine
              Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
              entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
            <p style={{ ...muted, marginTop: "12px" }}>
              Die AVV-Abfallschlüssel basieren auf der Abfallverzeichnis-Verordnung
              (AVV) vom 10. Dezember 2001 (BGBl. I S. 3379), die als amtliches
              Werk frei verfügbar ist.
            </p>
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
