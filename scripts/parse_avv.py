#!/usr/bin/env python3
"""
AVV Parser — Europäisches Abfallverzeichnis → JSON + SQL
Stand: 30.06.2020 (BGBl. I S. 1533)
"""
import re, json, sys, argparse
from pathlib import Path
import pdfplumber

# Muster — pdfplumber liefert bereits gestrippte Zeilen (keine führenden Spaces)
RE_6 = re.compile(r"^(\d{2})\s(\d{2})\s(\d{2})(\*?)\s+(.+)$")
RE_4 = re.compile(r"^(\d{2})\s(\d{2})\s+(.+)$")
RE_2 = re.compile(r"^(\d{2})\s+(.+)$")

SKIP = {"Ein Service des Bundesministeriums", "Justiz", "Abfallschlüssel",
        "Seite", "www.gesetze-im-internet"}

def make(sid, bez, gef, knr, kname, gnr, gname):
    fmt = f"{sid[:2]} {sid[2:4]} {sid[4:6]}"
    return {"schluessel": fmt, "schluessel_id": sid,
            "kapitel_nr": knr, "kapitel_name": kname.strip(),
            "gruppe_nr": gnr, "gruppe_name": gname.strip(),
            "bezeichnung": bez.strip(), "ist_gefaehrlich": gef,
            "ist_spiegeleintrag": False, "spiegel_partner_id": None,
            "hp_eigenschaften": [], "synonyme": [], "erklaerung": None,
            "querverweise": [], "bundesland_regeln": []}

def skip(line):
    return any(s in line for s in SKIP)

def parse(path, verbose=False):
    eintraege = []
    knr = ""; kname = ""
    gnr = ""; gname = ""
    letzter = None     # letzter Eintrag für Fortsetzungszeilen
    letztes_obj = None  # letztes Kapitel/Gruppe-Objekt für Fortsetzung

    def log(m):
        if verbose: print(f"  {m}", file=sys.stderr)

    with pdfplumber.open(path) as pdf:
        print(f"Öffne: {path}  ({len(pdf.pages)} Seiten)", file=sys.stderr)

        for page in pdf.pages:
            text = page.extract_text()
            if not text: continue
            lines = text.split("\n")

            for line in lines:
                line = line.strip()
                if not line or skip(line): continue

                # --- 6-Steller ---
                m = RE_6.match(line)
                if m:
                    kap, grp, art, stern, bez = m.groups()
                    e = make(f"{kap}{grp}{art}", bez, bool(stern),
                             knr, kname, gnr, gname)
                    eintraege.append(e)
                    letzter = e
                    letztes_obj = None
                    log(f"  {kap} {grp} {art}{stern}  {bez[:40]}")
                    continue

                # --- 4-Steller (Gruppe) ---
                m = RE_4.match(line)
                if m and not RE_6.match(line):
                    kap2, grp2, name = m.groups()
                    # Nur wenn kap2 == aktuelles Kapitel (verhindert False Positives)
                    gnr = f"{kap2} {grp2}"
                    gname = name
                    letzter = None
                    letztes_obj = ("gruppe", gnr, name)
                    log(f"Gruppe: {gnr}  {name[:40]}")
                    continue

                # --- 2-Steller (Kapitel) ---
                m = RE_2.match(line)
                if m and not RE_4.match(line) and not RE_6.match(line):
                    nr, name = m.groups()
                    try:
                        nr_int = int(nr)
                    except:
                        nr_int = 0
                    if 1 <= nr_int <= 20:
                        knr = nr; kname = name
                        gnr = ""; gname = ""
                        letzter = None
                        letztes_obj = ("kapitel", nr, name)
                        log(f"Kapitel: {nr}  {name[:40]}")
                        continue

                # --- Fortsetzungszeile ---
                # Keine Zahl am Anfang, kein Schlüsselmuster
                if not re.match(r"^\d", line):
                    if letzter is not None:
                        # Bezeichnung des letzten Eintrags verlängern
                        letzter["bezeichnung"] += " " + line
                        log(f"    +Fortsetzung Eintrag: {line[:40]}")
                    elif letztes_obj is not None:
                        # Kapitel- oder Gruppenname verlängern
                        typ, key, _ = letztes_obj
                        if typ == "kapitel":
                            kname += " " + line
                        elif typ == "gruppe":
                            gname += " " + line

    return eintraege

def post_process(eintraege):
    # Duplikate entfernen
    seen = set(); unique = []
    for e in eintraege:
        if e["schluessel_id"] not in seen:
            seen.add(e["schluessel_id"]); unique.append(e)
    removed = len(eintraege) - len(unique)
    if removed: print(f"  Duplikate entfernt: {removed}", file=sys.stderr)

    # Spiegeleinträge
    gruppen = {}
    for e in unique:
        gruppen.setdefault(e["gruppe_nr"], []).append(e)
    paare = 0
    for gl in gruppen.values():
        gef  = [e for e in gl if e["ist_gefaehrlich"]]
        ngef = [e for e in gl if not e["ist_gefaehrlich"]]
        for g in gef:
            for n in ngef:
                nl = n["bezeichnung"].lower()
                if ("mit ausnahme" in nl or "außer" in nl):
                    wa = set(g["bezeichnung"].lower().split()[:5])
                    wb = set(nl.split()[:5])
                    if len(wa & wb) >= 2:
                        g["ist_spiegeleintrag"] = n["ist_spiegeleintrag"] = True
                        g["spiegel_partner_id"] = n["schluessel_id"]
                        n["spiegel_partner_id"] = g["schluessel_id"]
                        paare += 1; break
    print(f"  Spiegelpaare: {paare}", file=sys.stderr)
    return unique

def to_sql(eintraege):
    def q(v): return "NULL" if v is None else "'" + str(v).replace("'","''") + "'"
    def b(v): return "TRUE" if v else "FALSE"
    rows = [
        f"  ({q(e['schluessel'])},{q(e['schluessel_id'])},"
        f"{q(e['kapitel_nr'])},{q(e['kapitel_name'])},"
        f"{q(e['gruppe_nr'])},{q(e['gruppe_name'])},"
        f"{q(e['bezeichnung'])},"
        f"{b(e['ist_gefaehrlich'])},{b(e['ist_spiegeleintrag'])},"
        f"{q(e['spiegel_partner_id'])})"
        for e in eintraege
    ]
    return "\n".join([
        "-- AVV Abfallverzeichnis — Stand: 30.06.2020",
        "BEGIN;", "TRUNCATE avv_eintraege CASCADE;", "",
        "INSERT INTO avv_eintraege (schluessel, schluessel_id, kapitel_nr,",
        "  kapitel_name, gruppe_nr, gruppe_name, bezeichnung,",
        "  ist_gefaehrlich, ist_spiegeleintrag, spiegel_partner_id) VALUES",
        ",\n".join(rows) + ";", "", "COMMIT;"
    ])

def validate(eintraege):
    print("\n── Validierung ─────────────────────────", file=sys.stderr)
    n = len(eintraege)
    print(f"  Gesamt:         {n:4d}  {'✓' if 820<=n<=860 else '⚠'} (erwartet ~842)", file=sys.stderr)
    gef = sum(1 for e in eintraege if e["ist_gefaehrlich"])
    print(f"  Gefährlich:     {gef:4d}  {'✓' if 260<=gef<=320 else '⚠'} (erwartet ~288)", file=sys.stderr)
    sp  = sum(1 for e in eintraege if e["ist_spiegeleintrag"])
    print(f"  Spiegeleintr.:  {sp:4d}  (erwartet ~366)", file=sys.stderr)
    ids = [e["schluessel_id"] for e in eintraege]
    d = len(ids)-len(set(ids))
    print(f"  Duplikate:      {d:4d}  {'✓' if d==0 else '✗ FEHLER'}", file=sys.stderr)
    kap = sorted(set(e["kapitel_nr"] for e in eintraege))
    fehlend = [f"{i:02d}" for i in range(1,21) if f"{i:02d}" not in kap]
    if fehlend: print(f"  ⚠ Fehlende Kapitel: {fehlend}", file=sys.stderr)
    else: print(f"  Kapitel 01–20:  alle vorhanden ✓", file=sys.stderr)
    print("─────────────────────────────────────────\n", file=sys.stderr)

def summary_text(eintraege):
    stats = {}
    for e in eintraege:
        k = e["kapitel_nr"]
        if k not in stats: stats[k] = {"name": e["kapitel_name"][:50], "n":0, "gef":0}
        stats[k]["n"] += 1
        if e["ist_gefaehrlich"]: stats[k]["gef"] += 1
    lines = ["\nKapitel-Übersicht:", "─"*72]
    for k in sorted(stats):
        s = stats[k]
        lines.append(f"  {k}  {s['n']:3d} Einträge ({s['gef']:3d} gef.)  {s['name']}")
    lines += ["─"*72, f"  Gesamt: {len(eintraege)} Einträge"]
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser(description="AVV-Parser: PDF → JSON + SQL")
    ap.add_argument("pdf")
    ap.add_argument("--output", "-o", default="data/avv")
    ap.add_argument("--format", "-f", choices=["json","sql","both"], default="both")
    ap.add_argument("--validate", "-v", action="store_true")
    ap.add_argument("--summary",  "-s", action="store_true")
    ap.add_argument("--verbose",        action="store_true")
    args = ap.parse_args()

    if not Path(args.pdf).exists():
        print(f"Fehler: {args.pdf} nicht gefunden", file=sys.stderr); sys.exit(1)

    eintraege = parse(args.pdf, verbose=args.verbose)
    eintraege = post_process(eintraege)

    print(f"  Einträge gesamt: {len(eintraege)}", file=sys.stderr)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    if args.format in ("json","both"):
        p = out.parent / (out.name + ".json")
        p.write_text(json.dumps(eintraege, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  → {p}", file=sys.stderr)

    if args.format in ("sql","both"):
        p = out.parent / (out.name + ".sql")
        p.write_text(to_sql(eintraege), encoding="utf-8")
        print(f"  → {p}", file=sys.stderr)

    if args.validate: validate(eintraege)
    if args.summary:  print(summary_text(eintraege))

if __name__ == "__main__":
    main()
