import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "API-Dokumentation — AVV Abfallschlüssel API",
  description:
    "Offene REST-API für alle 842 AVV-Abfallschlüssel. Kostenlos bis 100 Anfragen/Tag. Endpunkte für Suche, Einzelabfrage und Kapitel-Filter.",
};

/* ─── Shared inline styles ─────────────────────────────────────────────── */

const codeBlockStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  lineHeight: 1.65,
  background: "var(--navy)",
  color: "#d4d8f0",
  padding: "20px 24px",
  borderRadius: "var(--radius)",
  overflowX: "auto",
  whiteSpace: "pre",
  margin: 0,
};

const pathStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.82rem",
  fontWeight: 500,
  background: "var(--navy-pale)",
  color: "var(--navy)",
  padding: "3px 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--navy-muted)",
};

const methodStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  background: "var(--safe-pale)",
  color: "var(--safe)",
  padding: "3px 8px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--safe-muted)",
};

const paramTableHeader: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid var(--border)",
};

const paramTableCell: React.CSSProperties = {
  fontSize: "0.82rem",
  padding: "10px 12px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

/* ─── Endpoint data ────────────────────────────────────────────────────── */

interface Endpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  params: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  curl: string;
  js: string;
  python: string;
}

const endpoints: Endpoint[] = [
  {
    id: "avv-by-id",
    method: "GET",
    path: "/api/v1/avv/{id}",
    description:
      "Liefert einen einzelnen AVV-Eintrag anhand seiner Schlüssel-ID. Die ID ist der Schlüssel ohne Leerzeichen (z.B. 170101 fuer 17 01 01).",
    params: [
      {
        name: "id",
        type: "string",
        required: true,
        description:
          "AVV-Schluessel ohne Leerzeichen, z.B. 170101",
      },
    ],
    response: `{
  "schluessel": "17 01 01",
  "schluessel_id": "170101",
  "bezeichnung": "Beton",
  "kapitel_nr": "17",
  "gruppe_nr": "17 01",
  "ist_gefaehrlich": false,
  "ist_spiegeleintrag": false
}`,
    curl: `curl https://avv.valeoro.net/api/v1/avv/170101`,
    js: `const res = await fetch("https://avv.valeoro.net/api/v1/avv/170101");
const data = await res.json();
console.log(data.bezeichnung); // "Beton"`,
    python: `import requests

r = requests.get("https://avv.valeoro.net/api/v1/avv/170101")
data = r.json()
print(data["bezeichnung"])  # "Beton"`,
  },
  {
    id: "search",
    method: "GET",
    path: "/api/v1/search?q=...",
    description:
      "Volltextsuche ueber alle AVV-Eintraege. Durchsucht Schluessel, Bezeichnung und Synonyme mit Tippfehlertoleranz.",
    params: [
      {
        name: "q",
        type: "string",
        required: true,
        description:
          'Suchbegriff, z.B. "Beton", "1701", "Siedlungsabfall"',
      },
    ],
    response: `{
  "results": [
    {
      "schluessel": "17 01 01",
      "schluessel_id": "170101",
      "bezeichnung": "Beton",
      "kapitel_nr": "17",
      "gruppe_nr": "17 01",
      "ist_gefaehrlich": false,
      "ist_spiegeleintrag": false
    }
  ],
  "query": "Beton",
  "count": 5
}`,
    curl: `curl "https://avv.valeoro.net/api/v1/search?q=Beton"`,
    js: `const query = "Beton";
const res = await fetch(
  \`https://avv.valeoro.net/api/v1/search?q=\${encodeURIComponent(query)}\`
);
const data = await res.json();
console.log(data.count); // 5`,
    python: `import requests

params = {"q": "Beton"}
r = requests.get(
    "https://avv.valeoro.net/api/v1/search",
    params=params
)
data = r.json()
print(data["count"])  # 5`,
  },
  {
    id: "kapitel",
    method: "GET",
    path: "/api/v1/kapitel/{nr}",
    description:
      "Liefert alle AVV-Eintraege eines Kapitels. Kapitelnummern entsprechen den Herkunftsbereichen (01 bis 20).",
    params: [
      {
        name: "nr",
        type: "string",
        required: true,
        description:
          "Kapitelnummer, z.B. 17 fuer Bau- und Abbruchabfaelle",
      },
    ],
    response: `[
  {
    "schluessel": "17 01 01",
    "schluessel_id": "170101",
    "bezeichnung": "Beton",
    "kapitel_nr": "17",
    "gruppe_nr": "17 01",
    "ist_gefaehrlich": false,
    "ist_spiegeleintrag": false
  },
  {
    "schluessel": "17 01 02",
    "schluessel_id": "170102",
    "bezeichnung": "Ziegel",
    "kapitel_nr": "17",
    "gruppe_nr": "17 01",
    "ist_gefaehrlich": false,
    "ist_spiegeleintrag": false
  }
]`,
    curl: `curl https://avv.valeoro.net/api/v1/kapitel/17`,
    js: `const res = await fetch(
  "https://avv.valeoro.net/api/v1/kapitel/17"
);
const entries = await res.json();
console.log(entries.length); // Anzahl Eintraege in Kap. 17`,
    python: `import requests

r = requests.get("https://avv.valeoro.net/api/v1/kapitel/17")
entries = r.json()
print(len(entries))  # Anzahl Eintraege`,
  },
];

/* ─── Endpoint section component ───────────────────────────────────────── */

function EndpointSection({ ep }: { ep: Endpoint }) {
  return (
    <section
      id={ep.id}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 28px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={methodStyle}>{ep.method}</span>
        <span style={pathStyle}>{ep.path}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "28px" }}>
        {/* Description */}
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-mid)",
            lineHeight: 1.7,
            marginBottom: "28px",
            fontWeight: 300,
          }}
        >
          {ep.description}
        </p>

        {/* Parameters */}
        <div style={{ marginBottom: "32px" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              marginBottom: "14px",
            }}
          >
            Parameter
          </h3>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...paramTableHeader, width: "120px" }}>Name</th>
                  <th style={{ ...paramTableHeader, width: "80px" }}>Typ</th>
                  <th style={{ ...paramTableHeader, width: "80px" }}>
                    Pflicht
                  </th>
                  <th style={paramTableHeader}>Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                {ep.params.map((p) => (
                  <tr key={p.name}>
                    <td
                      style={{
                        ...paramTableCell,
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--navy)",
                      }}
                    >
                      {p.name}
                    </td>
                    <td
                      style={{
                        ...paramTableCell,
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {p.type}
                    </td>
                    <td
                      style={{
                        ...paramTableCell,
                        fontSize: "0.78rem",
                      }}
                    >
                      {p.required ? (
                        <span style={{ color: "var(--danger)" }}>Ja</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Nein</span>
                      )}
                    </td>
                    <td style={paramTableCell}>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Example response */}
        <div style={{ marginBottom: "32px" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              marginBottom: "14px",
            }}
          >
            Beispiel-Antwort
          </h3>
          <pre style={codeBlockStyle}>{ep.response}</pre>
        </div>

        {/* Code examples */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              marginBottom: "14px",
            }}
          >
            Code-Beispiele
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* curl */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginBottom: "8px",
                }}
              >
                curl
              </div>
              <pre style={codeBlockStyle}>{ep.curl}</pre>
            </div>

            {/* JavaScript */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginBottom: "8px",
                }}
              >
                JavaScript (fetch)
              </div>
              <pre style={codeBlockStyle}>{ep.js}</pre>
            </div>

            {/* Python */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginBottom: "8px",
                }}
              >
                Python (requests)
              </div>
              <pre style={codeBlockStyle}>{ep.python}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function ApiDocsPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "64px 0 48px",
        }}
      >
        <div className="px" style={{ maxWidth: "900px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              marginBottom: "24px",
              border: "1px solid var(--navy-muted)",
              borderRadius: "4px",
              background: "var(--navy-pale)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--navy)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--navy)",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
              }}
            >
              v1 &middot; REST
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              marginBottom: "16px",
            }}
          >
            API-Dokumentation
          </h1>

          <p
            style={{
              fontSize: "0.94rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: "600px",
              fontWeight: 300,
            }}
          >
            Maschinenlesbarer Zugang auf alle 842 AVV-Abfallschluessel.
            JSON-Responses, keine Authentifizierung noetig.
          </p>

          {/* Base URL */}
          <div
            style={{
              marginTop: "28px",
              padding: "14px 20px",
              background: "var(--navy)",
              borderRadius: "var(--radius)",
              display: "inline-flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              Base URL
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                color: "#d4d8f0",
              }}
            >
              https://avv.valeoro.net/api/v1
            </span>
          </div>
        </div>
      </section>

      {/* ── Notices ─────────────────────────────────────────────────────── */}
      <section
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "32px 0",
        }}
      >
        <div className="px" style={{ maxWidth: "900px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Rate limit */}
            <div
              style={{
                padding: "20px 24px",
                background: "var(--navy-pale)",
                border: "1px solid var(--navy-muted)",
                borderRadius: "var(--radius)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: "var(--navy)",
                  marginBottom: "8px",
                }}
              >
                Rate Limit
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-mid)",
                  lineHeight: 1.6,
                }}
              >
                Kostenlos bis 100 Anfragen/Tag, Pro-Tier folgt.
              </div>
            </div>

            {/* Authentication */}
            <div
              style={{
                padding: "20px 24px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                Authentifizierung
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-mid)",
                  lineHeight: 1.6,
                }}
              >
                Aktuell keine erforderlich. Ein API-Key ist fuer die
                Zukunft geplant.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Endpoints ───────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 0 72px" }}>
        <div
          className="px"
          style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }}
        >
          <div style={{ marginBottom: "8px" }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                fontWeight: 400,
                letterSpacing: "-0.015em",
              }}
            >
              Endpunkte
            </h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              Alle Responses sind JSON. Content-Type: application/json.
            </p>
          </div>

          {endpoints.map((ep) => (
            <EndpointSection key={ep.id} ep={ep} />
          ))}
        </div>
      </section>
    </>
  );
}
