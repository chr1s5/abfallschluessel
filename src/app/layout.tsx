import type { Metadata } from "next";
import { DM_Serif_Display, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nav } from "@/components/Nav";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | avv.valeoro.net",
    default: "AVV Abfallverzeichnis — Vollständige Suche & Lexikon | avv.valeoro.net",
  },
  description:
    "Alle 842 AVV-Schlüssel nach Europäischem Abfallkatalog. Volltextsuche, Bundesland-Regelungen, Klassifizierungs-Wizard und offene API. Kostenlos und werbefrei.",
  keywords: [
    "AVV", "Abfallverzeichnis", "Abfallschlüssel", "Europäischer Abfallkatalog",
    "EAK", "Abfallkatalog", "gefährliche Abfälle", "Entsorgung",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "avv.valeoro.net",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${dmSerif.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
        <footer className="footer">
          <div className="footer-inner px">
            <div>
              <div className="footer-logo">avv.valeoro.net</div>
              <p className="footer-disclaimer">
                Alle Angaben ohne Gewähr. Verbindlich ist ausschließlich die
                amtliche Fassung der Abfallverzeichnis-Verordnung (BGBl. I
                S. 3379, zuletzt geändert BGBl. I S. 1533).
              </p>
            </div>
            <nav className="footer-links">
              {[
                ["Katalog", "/katalog"],
                ["API", "/api-docs"],
                ["Impressum", "/impressum"],
                ["Datenschutz", "/datenschutz"],
                ["GitHub", "https://github.com/dein-user/avv-lexikon"],
              ].map(([label, href]) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
