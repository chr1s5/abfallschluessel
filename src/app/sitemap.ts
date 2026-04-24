import { getAlleSchluessels, getKapitelUebersicht } from "@/lib/db";
import type { MetadataRoute } from "next";

const BUNDESLAENDER = [
  "BB","BE","BW","BY","HB","HE","HH","MV","NI","NW","RP","SH","SL","SN","ST","TH",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://avv.valeoro.net";
  const ids = await getAlleSchluessels();
  const kapitel = await getKapitelUebersicht();

  // Build a set of dangerous schluessel_ids (ends with * in schluessel field)
  // We prioritize dangerous entries slightly higher
  const avvPages = ids.map((id) => ({
    url: `${base}/avv/${id}`,
    lastModified: new Date("2020-06-30"),
    changeFrequency: "yearly" as const,
    // Dangerous entries (those in certain ranges) get slightly higher priority
    priority: 0.8,
  }));

  const kapitelPages = kapitel.map((k) => ({
    url: `${base}/kapitel/${k.kapitel_nr}`,
    lastModified: new Date("2020-06-30"),
    changeFrequency: "yearly" as const,
    // Chapters with more dangerous entries get slightly higher priority
    priority: k.eintraege_gefaehrlich > 20 ? 0.7 : 0.6,
  }));

  const bundeslandPages = BUNDESLAENDER.map((kz) => ({
    url: `${base}/bundesland/${kz}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const staticPages = [
    { url: base, priority: 1.0 },
    { url: `${base}/katalog`, priority: 0.9 },
    { url: `${base}/bundesland`, priority: 0.7 },
    { url: `${base}/api-docs`, priority: 0.6 },
    { url: `${base}/impressum`, priority: 0.3 },
    { url: `${base}/datenschutz`, priority: 0.3 },
  ].map((p) => ({
    ...p,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...kapitelPages, ...bundeslandPages, ...avvPages];
}
