-- Predictive History - Seed Data (compatible with V1 + V2)
-- File: docs/sql/seed/predictive_history_seed.sql

BEGIN;

-- 1) Players
INSERT INTO players (external_key, name, player_type, status, metadata)
VALUES
  ('plr-maria-santos', 'Maria Santos', 'individual', 'active', '{"region":"nordeste","sector":"politics"}'),
  ('plr-lucas-almeida', 'Lucas Almeida', 'individual', 'active', '{"region":"sudeste","sector":"media"}'),
  ('plr-rede-civica', 'Rede Cívica Nacional', 'organization', 'active', '{"region":"nacional","sector":"civil_society"}'),
  ('plr-observatorio-dados', 'Observatório de Dados Públicos', 'organization', 'active', '{"region":"nacional","sector":"research"}')
ON CONFLICT (external_key) DO NOTHING;

-- 2) Groups
INSERT INTO groups (external_key, name, group_type, status, metadata)
VALUES
  ('grp-frente-popular', 'Frente Popular Digital', 'coalition', 'active', '{"region":"nacional"}'),
  ('grp-forum-governanca', 'Fórum de Governança Aberta', 'forum', 'active', '{"region":"nacional"}')
ON CONFLICT (external_key) DO NOTHING;

-- 3) Temporal memberships
WITH g AS (
  SELECT id, external_key FROM groups WHERE external_key IN ('grp-frente-popular', 'grp-forum-governanca')
), p AS (
  SELECT id, external_key FROM players WHERE external_key IN ('plr-maria-santos', 'plr-lucas-almeida', 'plr-rede-civica')
)
INSERT INTO group_memberships (group_id, player_id, role, weight, valid_from, valid_to, metadata)
SELECT g.id, p.id, x.role, x.weight, x.valid_from, x.valid_to, x.metadata::jsonb
FROM (
  VALUES
    ('grp-frente-popular', 'plr-maria-santos', 'coordinator', 0.92::double precision, '2025-01-01T00:00:00Z'::timestamptz, NULL::timestamptz, '{"source":"manual_curator"}'),
    ('grp-frente-popular', 'plr-rede-civica', 'institutional_support', 0.88::double precision, '2025-02-10T00:00:00Z'::timestamptz, NULL::timestamptz, '{"source":"manual_curator"}'),
    ('grp-forum-governanca', 'plr-lucas-almeida', 'spokesperson', 0.81::double precision, '2025-03-05T00:00:00Z'::timestamptz, NULL::timestamptz, '{"source":"manual_curator"}')
) AS x(group_key, player_key, role, weight, valid_from, valid_to, metadata)
JOIN g ON g.external_key = x.group_key
JOIN p ON p.external_key = x.player_key
ON CONFLICT DO NOTHING;

-- 4) Relations
WITH p AS (
  SELECT id, external_key FROM players
)
INSERT INTO player_relations (source_player_id, target_player_id, relation_type, strength, polarity, valid_from, valid_to, metadata)
SELECT s.id, t.id, x.relation_type, x.strength, x.polarity, x.valid_from, x.valid_to, x.metadata::jsonb
FROM (
  VALUES
    ('plr-maria-santos', 'plr-lucas-almeida', 'alliance', 0.76::double precision, 1::smallint, '2025-03-01T00:00:00Z'::timestamptz, NULL::timestamptz, '{"channel":"public_events"}'),
    ('plr-lucas-almeida', 'plr-observatorio-dados', 'information_flow', 0.69::double precision, 1::smallint, '2025-03-12T00:00:00Z'::timestamptz, NULL::timestamptz, '{"channel":"media_mentions"}')
) AS x(source_key, target_key, relation_type, strength, polarity, valid_from, valid_to, metadata)
JOIN p s ON s.external_key = x.source_key
JOIN p t ON t.external_key = x.target_key
ON CONFLICT DO NOTHING;

-- 5) Events
INSERT INTO events (event_key, event_type, event_time, end_time, source_system, confidence, payload)
VALUES
  ('evt-2025-04-11-coalition-press', 'media_appearance', '2025-04-11T14:00:00Z', '2025-04-11T15:30:00Z', 'news_collector', 0.91,
   '{"region":"sudeste","headline":"Coalizão anuncia agenda conjunta","sentiment":"positive"}'),
  ('evt-2025-04-22-regional-protest', 'protest', '2025-04-22T18:00:00Z', '2025-04-22T21:30:00Z', 'social_listener', 0.84,
   '{"region":"nordeste","intensity":"medium","hashtags":["#governanca", "#reforma"]}'),
  ('evt-2025-05-03-coalition-break', 'coalition_break', '2025-05-03T10:30:00Z', NULL, 'analyst_report', 0.79,
   '{"region":"nacional","reason":"policy_disagreement","impact":"high"}')
ON CONFLICT (event_key) DO NOTHING;

-- 6) Event participants
WITH e AS (SELECT id, event_key FROM events),
     p AS (SELECT id, external_key FROM players),
     g AS (SELECT id, external_key FROM groups)
INSERT INTO event_participants (event_id, player_id, group_id, participant_role, weight, metadata)
SELECT e.id,
       CASE WHEN x.player_key IS NULL THEN NULL ELSE p.id END,
       CASE WHEN x.group_key IS NULL THEN NULL ELSE g.id END,
       x.participant_role,
       x.weight,
       x.metadata::jsonb
FROM (
  VALUES
    ('evt-2025-04-11-coalition-press', 'plr-maria-santos', NULL, 'speaker', 0.95::double precision, '{"stance":"supportive"}'),
    ('evt-2025-04-11-coalition-press', NULL, 'grp-frente-popular', 'organizer', 0.90::double precision, '{"coverage":"national"}'),
    ('evt-2025-04-22-regional-protest', 'plr-rede-civica', NULL, 'mobilizer', 0.87::double precision, '{"reach":"regional"}'),
    ('evt-2025-05-03-coalition-break', NULL, 'grp-frente-popular', 'affected_coalition', 0.99::double precision, '{"severity":"high"}')
) AS x(event_key, player_key, group_key, participant_role, weight, metadata)
JOIN e ON e.event_key = x.event_key
LEFT JOIN p ON p.external_key = x.player_key
LEFT JOIN g ON g.external_key = x.group_key
ON CONFLICT DO NOTHING;

-- 7) Indicators
WITH p AS (SELECT id, external_key FROM players),
     g AS (SELECT id, external_key FROM groups),
     e AS (SELECT id, event_key FROM events)
INSERT INTO indicators (entity_kind, entity_id, indicator_type, indicator_time, value_numeric, unit, confidence, source_event_id, metadata)
SELECT x.entity_kind,
       CASE
         WHEN x.entity_kind = 'player' THEN p.id
         WHEN x.entity_kind = 'group' THEN g.id
         ELSE NULL
       END,
       x.indicator_type,
       x.indicator_time,
       x.value_numeric,
       x.unit,
       x.confidence,
       e.id,
       x.metadata::jsonb
FROM (
  VALUES
    ('player', 'plr-maria-santos', NULL, 'influence_score', '2025-04-12T00:00:00Z'::timestamptz, 0.82::double precision, 'score', 0.90::double precision, 'evt-2025-04-11-coalition-press', '{"window":"30d"}'),
    ('player', 'plr-lucas-almeida', NULL, 'reputation_score', '2025-04-12T00:00:00Z'::timestamptz, 0.74::double precision, 'score', 0.86::double precision, 'evt-2025-04-11-coalition-press', '{"window":"30d"}'),
    ('group', NULL, 'grp-frente-popular', 'coalition_stability', '2025-05-04T00:00:00Z'::timestamptz, 0.41::double precision, 'score', 0.82::double precision, 'evt-2025-05-03-coalition-break', '{"window":"7d"}'),
    ('group', NULL, 'grp-frente-popular', 'risk_index', '2025-05-04T00:00:00Z'::timestamptz, 0.67::double precision, 'score', 0.80::double precision, 'evt-2025-05-03-coalition-break', '{"window":"7d"}')
) AS x(entity_kind, player_key, group_key, indicator_type, indicator_time, value_numeric, unit, confidence, event_key, metadata)
LEFT JOIN p ON p.external_key = x.player_key
LEFT JOIN g ON g.external_key = x.group_key
LEFT JOIN e ON e.event_key = x.event_key
WHERE (x.entity_kind = 'player' AND p.id IS NOT NULL)
   OR (x.entity_kind = 'group' AND g.id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- 8) Narratives
INSERT INTO narratives (entity_kind, entity_id, narrative_type, title, body, language, source, source_url, confidence, narrative_time, metadata)
SELECT
  'group',
  g.id,
  'public_discourse',
  'Frente Popular enfrenta tensão interna',
  'Após divergências sobre reforma institucional, lideranças da coalizão emitiram posições conflitantes em canais públicos.',
  'pt-BR',
  'analyst_brief',
  'https://example.org/briefs/coalition-break-2025-05',
  0.83,
  '2025-05-03T11:30:00Z',
  '{"region":"nacional","stance":"warning"}'::jsonb
FROM groups g
WHERE g.external_key = 'grp-frente-popular'
ON CONFLICT DO NOTHING;

-- 9) V2 auxiliary data: ethnicity + themes + lineage
INSERT INTO ethnicity_catalog (ethnicity_code, ethnicity_name, region_hint, metadata)
VALUES
  ('branco', 'Branco', 'nacional', '{"classification":"ibge"}'),
  ('pardo', 'Pardo', 'nacional', '{"classification":"ibge"}'),
  ('preto', 'Preto', 'nacional', '{"classification":"ibge"}')
ON CONFLICT (ethnicity_code) DO NOTHING;

WITH p AS (SELECT id, external_key FROM players),
     ec AS (SELECT id, ethnicity_code FROM ethnicity_catalog)
INSERT INTO player_ethnicity_history (player_id, ethnicity_id, confidence, valid_from, valid_to, metadata)
SELECT p.id, ec.id, x.confidence, x.valid_from, x.valid_to, x.metadata::jsonb
FROM (
  VALUES
    ('plr-maria-santos', 'pardo', 0.77::double precision, '2024-01-01T00:00:00Z'::timestamptz, NULL::timestamptz, '{"source":"survey_2024"}'),
    ('plr-lucas-almeida', 'branco', 0.72::double precision, '2024-01-01T00:00:00Z'::timestamptz, NULL::timestamptz, '{"source":"survey_2024"}')
) AS x(player_key, ethnicity_code, confidence, valid_from, valid_to, metadata)
JOIN p ON p.external_key = x.player_key
JOIN ec ON ec.ethnicity_code = x.ethnicity_code
ON CONFLICT DO NOTHING;

INSERT INTO narrative_themes (theme_code, theme_name, description, polarity_hint, metadata)
VALUES
  ('institutional_reform', 'Reforma Institucional', 'Debates sobre mudança de regras de governança.', 0, '{}'),
  ('coalition_fragmentation', 'Fragmentação de Coalizão', 'Sinais de ruptura ou perda de alinhamento político.', -1, '{}'),
  ('civic_mobilization', 'Mobilização Cívica', 'Engajamento social e pressão popular.', 1, '{}')
ON CONFLICT (theme_code) DO NOTHING;

WITH n AS (
  SELECT id FROM narratives WHERE title = 'Frente Popular enfrenta tensão interna' LIMIT 1
), t AS (
  SELECT id, theme_code FROM narrative_themes
)
INSERT INTO narrative_theme_links (narrative_id, theme_id, weight, metadata)
SELECT n.id, t.id, x.weight, x.metadata::jsonb
FROM n
JOIN (
  VALUES
    ('coalition_fragmentation', 0.93::double precision, '{"source":"nlp_classifier_v2"}'),
    ('institutional_reform', 0.68::double precision, '{"source":"nlp_classifier_v2"}')
) AS x(theme_code, weight, metadata)
ON TRUE
JOIN t ON t.theme_code = x.theme_code
ON CONFLICT (narrative_id, theme_id) DO NOTHING;

INSERT INTO data_lineage_jobs (job_key, pipeline_name, pipeline_version, run_started_at, run_finished_at, source_system, source_snapshot, metadata)
VALUES
  ('job-seed-2025-05-04', 'predictive_history_seed_loader', '2.0.0', '2025-05-04T01:00:00Z', '2025-05-04T01:05:00Z', 'seed_script', 'seed_v2', '{"environment":"dev"}')
ON CONFLICT (job_key) DO NOTHING;

WITH j AS (
  SELECT id FROM data_lineage_jobs WHERE job_key = 'job-seed-2025-05-04'
), p AS (
  SELECT id FROM players WHERE external_key = 'plr-maria-santos'
), g AS (
  SELECT id FROM groups WHERE external_key = 'grp-frente-popular'
)
INSERT INTO data_lineage_entities (job_id, entity_table, entity_pk, operation_type, source_record_id, confidence, metadata)
SELECT j.id, 'players', p.id, 'upsert', 'seed.players.plr-maria-santos', 1.0, '{"batch":"initial_v2"}'::jsonb FROM j, p
UNION ALL
SELECT j.id, 'groups', g.id, 'upsert', 'seed.groups.grp-frente-popular', 1.0, '{"batch":"initial_v2"}'::jsonb FROM j, g
ON CONFLICT DO NOTHING;

COMMIT;
