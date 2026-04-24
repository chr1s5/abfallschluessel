-- ============================================================
-- AVV Lexikon - PostgreSQL Schema
-- ============================================================
-- Benötigt: PostgreSQL 14+, Erweiterung pg_trgm für Fuzzy-Suche
-- ============================================================

-- Erweiterungen
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================
-- 1. Kerntabelle: AVV-Einträge
-- ============================================================

CREATE TABLE avv_eintraege (
    id                  SERIAL PRIMARY KEY,
    schluessel          CHAR(8)     NOT NULL UNIQUE,  -- "17 01 01"
    schluessel_id       CHAR(6)     NOT NULL UNIQUE,  -- "170101"  ← URL-Key

    -- Hierarchie
    kapitel_nr          CHAR(2)     NOT NULL,          -- "17"
    kapitel_name        TEXT        NOT NULL,
    gruppe_nr           CHAR(5)     NOT NULL,          -- "17 01"
    gruppe_name         TEXT        NOT NULL,

    -- Inhalt
    bezeichnung         TEXT        NOT NULL,
    erklaerung          TEXT,                          -- Markdown, redaktionell
    synonyme            TEXT[]      DEFAULT '{}',      -- für Volltextsuche

    -- Klassifikation
    ist_gefaehrlich     BOOLEAN     NOT NULL DEFAULT FALSE,
    ist_spiegeleintrag  BOOLEAN     NOT NULL DEFAULT FALSE,
    spiegel_partner_id  CHAR(6)     REFERENCES avv_eintraege(schluessel_id),
    hp_eigenschaften    TEXT[]      DEFAULT '{}',      -- ["HP3", "HP14"]

    -- Bayern-Erweiterung
    u_faktor            TEXT,                          -- "1.40" oder "1.40-1.80"

    -- Querverweise zu anderen Einträgen
    querverweise        CHAR(6)[]   DEFAULT '{}',

    -- Volltextsuche (automatisch befüllt via Trigger)
    -- Gewichtung: A=Schlüssel, B=Bezeichnung, C=Synonyme, D=Erklärung
    fts_vector          TSVECTOR,

    -- Metadaten
    erstellt_am         TIMESTAMPTZ DEFAULT NOW(),
    aktualisiert_am     TIMESTAMPTZ DEFAULT NOW(),
    avv_version         TEXT        DEFAULT '2020-06-30'  -- Datum letzte AVV-Änderung
);

-- ============================================================
-- 2. Bundesland-Regeln
-- ============================================================

CREATE TABLE bundesland_regeln (
    id              SERIAL PRIMARY KEY,
    schluessel_id   CHAR(6)     NOT NULL REFERENCES avv_eintraege(schluessel_id),
    bundesland      CHAR(2)     NOT NULL,  -- "BY", "BW", "NW" etc.

    typ             TEXT        NOT NULL   -- "erlass", "vollzugshilfe",
                    CHECK (typ IN (        --  "steckbrief", "hinweis"
                        'erlass',
                        'vollzugshilfe',
                        'steckbrief',
                        'hinweis',
                        'umrechnungsfaktor'
                    )),

    titel           TEXT        NOT NULL,
    inhalt          TEXT,                  -- Markdown
    quelle_url      TEXT,
    quelle_datum    DATE,
    ist_bindend     BOOLEAN     DEFAULT FALSE,

    erstellt_am     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bundesland_regeln_schluessel ON bundesland_regeln(schluessel_id);
CREATE INDEX idx_bundesland_regeln_bundesland ON bundesland_regeln(bundesland);

-- ============================================================
-- 3. AVV-Änderungslog (für Agent-Monitoring)
-- ============================================================

CREATE TABLE avv_aenderungen (
    id              SERIAL PRIMARY KEY,
    schluessel_id   CHAR(6),
    typ             TEXT NOT NULL  -- "neu", "geaendert", "geloescht"
                    CHECK (typ IN ('neu', 'geaendert', 'geloescht')),
    feld            TEXT,          -- welches Feld wurde geändert
    alter_wert      TEXT,
    neuer_wert      TEXT,
    bgbl_referenz   TEXT,          -- z.B. "BGBl. I S. 1533"
    datum           DATE,
    freigegeben     BOOLEAN DEFAULT FALSE,  -- menschliche Freigabe
    freigegeben_am  TIMESTAMPTZ,
    erstellt_am     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. API-Keys (für bezahlten API-Zugang)
-- ============================================================

CREATE TABLE api_keys (
    id              SERIAL PRIMARY KEY,
    key_hash        TEXT        NOT NULL UNIQUE,  -- SHA256 des Keys
    name            TEXT        NOT NULL,
    tier            TEXT        NOT NULL DEFAULT 'free'
                    CHECK (tier IN ('free', 'pro', 'enterprise')),
    anfragen_limit  INTEGER     DEFAULT 100,       -- pro Tag
    anfragen_heute  INTEGER     DEFAULT 0,
    aktiv           BOOLEAN     DEFAULT TRUE,
    erstellt_am     TIMESTAMPTZ DEFAULT NOW(),
    letzter_zugriff TIMESTAMPTZ
);

-- ============================================================
-- 5. FTS-Index und Trigger
-- ============================================================

-- Funktion: FTS-Vektor aktualisieren
CREATE OR REPLACE FUNCTION avv_fts_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector :=
        -- Schlüssel: höchstes Gewicht (exakte Suche nach "17 01 01")
        setweight(to_tsvector('german', coalesce(NEW.schluessel, '')), 'A') ||
        setweight(to_tsvector('german', coalesce(NEW.schluessel_id, '')), 'A') ||
        -- Bezeichnung: hohes Gewicht
        setweight(to_tsvector('german', coalesce(NEW.bezeichnung, '')), 'B') ||
        -- Synonyme: mittleres Gewicht
        setweight(to_tsvector('german',
            coalesce(array_to_string(NEW.synonyme, ' '), '')), 'C') ||
        -- Erklärung: niedrigstes Gewicht
        setweight(to_tsvector('german', coalesce(NEW.erklaerung, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: nur bei Änderung relevanter Felder (nicht bei jedem Update)
CREATE TRIGGER avv_fts_trigger
    BEFORE INSERT OR UPDATE OF schluessel, schluessel_id, bezeichnung, synonyme, erklaerung
    ON avv_eintraege
    FOR EACH ROW EXECUTE FUNCTION avv_fts_update();

-- ============================================================
-- 6. Indizes
-- ============================================================

-- Hauptsuche
CREATE INDEX idx_avv_fts       ON avv_eintraege USING GIN(fts_vector);
CREATE INDEX idx_avv_trgm      ON avv_eintraege USING GIN(bezeichnung gin_trgm_ops);
CREATE INDEX idx_avv_kapitel   ON avv_eintraege(kapitel_nr);
CREATE INDEX idx_avv_gruppe    ON avv_eintraege(gruppe_nr);
CREATE INDEX idx_avv_gefahr    ON avv_eintraege(ist_gefaehrlich);
CREATE INDEX idx_avv_spiegel   ON avv_eintraege(ist_spiegeleintrag);
CREATE INDEX idx_avv_spiegel_partner ON avv_eintraege(spiegel_partner_id);

-- ============================================================
-- 7. Hilfreiche Views
-- ============================================================

-- Vollständige Suchanfrage (Beispiel)
-- SELECT schluessel, bezeichnung, ist_gefaehrlich,
--        ts_rank(fts_vector, query) AS rang
-- FROM avv_eintraege, to_tsquery('german', 'Beton') query
-- WHERE fts_vector @@ query
-- ORDER BY rang DESC;

-- View: Spiegeleintrags-Paare
CREATE VIEW v_spiegeleintraege AS
SELECT
    g.schluessel        AS schluessel_gefaehrlich,
    g.bezeichnung       AS bezeichnung_gefaehrlich,
    u.schluessel        AS schluessel_ungefaehrlich,
    u.bezeichnung       AS bezeichnung_ungefaehrlich,
    g.gruppe_nr,
    g.gruppe_name
FROM avv_eintraege g
JOIN avv_eintraege u ON g.spiegel_partner_id = u.schluessel_id
WHERE g.ist_gefaehrlich = TRUE
  AND g.ist_spiegeleintrag = TRUE;

-- View: Kapitel-Statistik
CREATE VIEW v_kapitel_statistik AS
SELECT
    kapitel_nr,
    kapitel_name,
    COUNT(*)                                    AS eintraege_gesamt,
    SUM(CASE WHEN ist_gefaehrlich THEN 1 END)   AS eintraege_gefaehrlich,
    SUM(CASE WHEN ist_spiegeleintrag THEN 1 END) AS spiegeleintraege
FROM avv_eintraege
GROUP BY kapitel_nr, kapitel_name
ORDER BY kapitel_nr;

-- ============================================================
-- 8. Bundesland-Codes (Referenz)
-- ============================================================

CREATE TABLE bundeslaender (
    kuerzel     CHAR(2) PRIMARY KEY,
    name        TEXT NOT NULL,
    behoerde    TEXT,       -- zuständige Landesbehörde
    behoerde_url TEXT
);

INSERT INTO bundeslaender (kuerzel, name, behoerde, behoerde_url) VALUES
('BB', 'Brandenburg',           'LfU Brandenburg',   'https://lfu.brandenburg.de'),
('BE', 'Berlin',                'SenUVK Berlin',     'https://www.berlin.de/sen/uvk'),
('BW', 'Baden-Württemberg',     'LUBW',              'https://www.lubw.baden-wuerttemberg.de'),
('BY', 'Bayern',                'LfU Bayern',        'https://www.lfu.bayern.de'),
('HB', 'Bremen',                'Senator für Umwelt','https://www.umwelt.bremen.de'),
('HE', 'Hessen',                'HLNUG',             'https://www.hlnug.de'),
('HH', 'Hamburg',               'BUKEA',             'https://www.hamburg.de/bukea'),
('MV', 'Mecklenburg-Vorpommern','LUNG MV',           'https://www.lung.mv-regierung.de'),
('NI', 'Niedersachsen',         'NLWKN',             'https://www.nlwkn.niedersachsen.de'),
('NW', 'Nordrhein-Westfalen',   'LANUV NRW',         'https://www.lanuv.nrw.de'),
('RP', 'Rheinland-Pfalz',       'LfU RLP',           'https://lfu.rlp.de'),
('SH', 'Schleswig-Holstein',    'LLUR SH',           'https://www.llur.schleswig-holstein.de'),
('SL', 'Saarland',              'LUA Saarland',      'https://www.saarland.de/lua'),
('SN', 'Sachsen',               'LfULG Sachsen',     'https://www.lfulg.sachsen.de'),
('ST', 'Sachsen-Anhalt',        'LAU Sachsen-Anhalt','https://lau.sachsen-anhalt.de'),
('TH', 'Thüringen',             'TLUG Thüringen',    'https://www.tlug.de');
