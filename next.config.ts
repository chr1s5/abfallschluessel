import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking-Schutz
          { key: "X-Frame-Options", value: "DENY" },
          // MIME-Sniffing unterbinden
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer nur teilweise übermitteln
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Browser-APIs abschalten die wir nicht brauchen
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS (wichtig: nur auf Production!)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js braucht eval in Dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // API-Routes zusätzlich: CORS öffnen für Entwickler
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
