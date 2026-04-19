-- V2 - Predictive History Advanced Data Layer
-- File: docs/sql/migrations/V2__predictive_history_advanced.sql
-- Depends on v1 baseline: predictive_history_schema.sql + predictive_history_indexes.sql

BEGIN;

-- Required for temporal EXCLUDE constraints with UUID/text + range
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- 1) Temporal robustness: prevent overlapping intervals by business key
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ex_group_memberships_no_overlap'
  ) THEN
    ALTER TABLE group_memberships
      ADD CONSTRAINT ex_group_memberships_no_overlap
      EXCLUDE USING gist (
        group_id WITH =,
        player_id WITH =,
        tstzrange(valid_from, COALESCE(valid_to, 'infinity'::timestamptz), '[)') WITH &&
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ex_player_relations_no_overlap'
  ) THEN
    ALTER TABLE player_relations
      ADD CONSTRAINT ex_player_relations_no_overlap
      EXCLUDE USING gist (
        source_player_id WITH =,
        target_player_id WITH =,
        relation_type WITH =,
        tstzrange(valid_from, COALESCE(valid_to, 'infinity'::timestamptz), '[)') WITH &&
      );
  END IF;
END $$;

-- ============================================================================
-- 2) Auxiliary dimensions: ethnicity + narrative taxonomy
-- ============================================================================

CREATE TABLE IF NOT EXISTS ethnicity_catalog (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ethnicity_code    TEXT NOT NULL UNIQUE,
  ethnicity_name    TEXT NOT NULL,
  region_hint       TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_ethnicity_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  ethnicity_id      UUID NOT NULL REFERENCES ethnicity_catalog(id),
  source_event_id   UUID REFERENCES events(id),
  confidence        DOUBLE PRECISION,
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_to          TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_player_ethnicity_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CONSTRAINT ck_player_ethnicity_validity CHECK (valid_to IS NULL OR valid_to > valid_from)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ex_player_ethnicity_no_overlap'
  ) THEN
    ALTER TABLE player_ethnicity_history
      ADD CONSTRAINT ex_player_ethnicity_no_overlap
      EXCLUDE USING gist (
        player_id WITH =,
        ethnicity_id WITH =,
        tstzrange(valid_from, COALESCE(valid_to, 'infinity'::timestamptz), '[)') WITH &&
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS narrative_themes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_code        TEXT NOT NULL UNIQUE,
  theme_name        TEXT NOT NULL,
  description       TEXT,
  polarity_hint     SMALLINT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_narrative_themes_polarity CHECK (polarity_hint IS NULL OR polarity_hint IN (-1, 0, 1))
);

CREATE TABLE IF NOT EXISTS narrative_theme_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id      UUID NOT NULL REFERENCES narratives(id) ON DELETE CASCADE,
  theme_id          UUID NOT NULL REFERENCES narrative_themes(id),
  weight            DOUBLE PRECISION,
  source_event_id   UUID REFERENCES events(id),
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_narrative_theme UNIQUE (narrative_id, theme_id),
  CONSTRAINT ck_narrative_theme_weight CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1))
);

-- ============================================================================
-- 3) Lineage & audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_lineage_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key           TEXT NOT NULL UNIQUE,
  pipeline_name     TEXT NOT NULL,
  pipeline_version  TEXT,
  run_started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_finished_at   TIMESTAMPTZ,
  source_system     TEXT,
  source_snapshot   TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_data_lineage_jobs_time CHECK (run_finished_at IS NULL OR run_finished_at >= run_started_at)
);

CREATE TABLE IF NOT EXISTS data_lineage_entities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID NOT NULL REFERENCES data_lineage_jobs(id) ON DELETE CASCADE,
  entity_table      TEXT NOT NULL,
  entity_pk         UUID NOT NULL,
  operation_type    TEXT NOT NULL,
  source_record_id  TEXT,
  confidence        DOUBLE PRECISION,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_data_lineage_op CHECK (operation_type IN ('insert', 'update', 'delete', 'upsert')),
  CONSTRAINT ck_data_lineage_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

CREATE INDEX IF NOT EXISTS idx_lineage_entities_job_table ON data_lineage_entities (job_id, entity_table, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lineage_entities_pk ON data_lineage_entities (entity_table, entity_pk);

CREATE TABLE IF NOT EXISTS audit_entity_changes (
  id                BIGSERIAL PRIMARY KEY,
  table_name        TEXT NOT NULL,
  entity_id         UUID,
  operation         TEXT NOT NULL,
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by        TEXT NOT NULL DEFAULT CURRENT_USER,
  txid              BIGINT NOT NULL DEFAULT txid_current(),
  row_before        JSONB,
  row_after         JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_entity_changes_table_time ON audit_entity_changes (table_name, changed_at DESC);

CREATE OR REPLACE FUNCTION audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_id UUID;
BEGIN
  v_entity_id := COALESCE((to_jsonb(NEW)->>'id')::uuid, (to_jsonb(OLD)->>'id')::uuid);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_entity_changes(table_name, entity_id, operation, row_after)
    VALUES (TG_TABLE_NAME, v_entity_id, TG_OP, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_entity_changes(table_name, entity_id, operation, row_before, row_after)
    VALUES (TG_TABLE_NAME, v_entity_id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_entity_changes(table_name, entity_id, operation, row_before)
    VALUES (TG_TABLE_NAME, v_entity_id, TG_OP, to_jsonb(OLD));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_players_audit_row_change ON players;
CREATE TRIGGER trg_players_audit_row_change
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW EXECUTE FUNCTION audit_row_change();

DROP TRIGGER IF EXISTS trg_events_audit_row_change ON events;
CREATE TRIGGER trg_events_audit_row_change
AFTER INSERT OR UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION audit_row_change();

DROP TRIGGER IF EXISTS trg_indicators_audit_row_change ON indicators;
CREATE TRIGGER trg_indicators_audit_row_change
AFTER INSERT OR UPDATE OR DELETE ON indicators
FOR EACH ROW EXECUTE FUNCTION audit_row_change();

DROP TRIGGER IF EXISTS trg_narratives_audit_row_change ON narratives;
CREATE TRIGGER trg_narratives_audit_row_change
AFTER INSERT OR UPDATE OR DELETE ON narratives
FOR EACH ROW EXECUTE FUNCTION audit_row_change();

-- updated_at triggers for new mutable tables
DROP TRIGGER IF EXISTS trg_ethnicity_catalog_updated_at ON ethnicity_catalog;
CREATE TRIGGER trg_ethnicity_catalog_updated_at
BEFORE UPDATE ON ethnicity_catalog
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_player_ethnicity_history_updated_at ON player_ethnicity_history;
CREATE TRIGGER trg_player_ethnicity_history_updated_at
BEFORE UPDATE ON player_ethnicity_history
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_narrative_themes_updated_at ON narrative_themes;
CREATE TRIGGER trg_narrative_themes_updated_at
BEFORE UPDATE ON narrative_themes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_narrative_theme_links_updated_at ON narrative_theme_links;
CREATE TRIGGER trg_narrative_theme_links_updated_at
BEFORE UPDATE ON narrative_theme_links
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_data_lineage_jobs_updated_at ON data_lineage_jobs;
CREATE TRIGGER trg_data_lineage_jobs_updated_at
BEFORE UPDATE ON data_lineage_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 4) Feature views for analytics/modeling
-- ============================================================================

CREATE OR REPLACE VIEW vw_player_influence_features AS
SELECT
  p.id AS player_id,
  p.name AS player_name,
  COUNT(DISTINCT ep.event_id) FILTER (WHERE e.event_time >= NOW() - INTERVAL '90 days') AS events_90d,
  COUNT(DISTINCT pr.id) FILTER (
    WHERE pr.valid_to IS NULL OR pr.valid_to >= NOW() - INTERVAL '90 days'
  ) AS active_relations_90d,
  COALESCE(AVG(i.value_numeric) FILTER (
    WHERE i.indicator_type = 'influence_score'
      AND i.indicator_time >= NOW() - INTERVAL '90 days'
  ), 0) AS avg_influence_90d,
  COALESCE(AVG(i.value_numeric) FILTER (
    WHERE i.indicator_type = 'reputation_score'
      AND i.indicator_time >= NOW() - INTERVAL '90 days'
  ), 0) AS avg_reputation_90d
FROM players p
LEFT JOIN event_participants ep ON ep.player_id = p.id
LEFT JOIN events e ON e.id = ep.event_id
LEFT JOIN player_relations pr ON pr.source_player_id = p.id OR pr.target_player_id = p.id
LEFT JOIN indicators i ON i.entity_kind = 'player' AND i.entity_id = p.id
GROUP BY p.id, p.name;

CREATE OR REPLACE VIEW vw_region_risk_features AS
SELECT
  COALESCE(e.payload->>'region', 'unknown') AS region,
  date_trunc('day', e.event_time) AS day,
  COUNT(*) FILTER (WHERE e.event_type IN ('protest', 'conflict', 'coalition_break')) AS destabilizing_events,
  AVG(i.value_numeric) FILTER (WHERE i.indicator_type = 'risk_index') AS avg_risk_index,
  AVG(e.confidence) AS avg_event_confidence
FROM events e
LEFT JOIN indicators i
  ON i.source_event_id = e.id
 AND i.indicator_type = 'risk_index'
GROUP BY COALESCE(e.payload->>'region', 'unknown'), date_trunc('day', e.event_time);

CREATE OR REPLACE VIEW vw_coalition_stability_features AS
SELECT
  g.id AS coalition_id,
  g.name AS coalition_name,
  COUNT(DISTINCT gm.player_id) FILTER (WHERE gm.valid_to IS NULL) AS active_members,
  COUNT(DISTINCT e.id) FILTER (
    WHERE e.event_type = 'coalition_break'
      AND e.event_time >= NOW() - INTERVAL '180 days'
  ) AS ruptures_180d,
  COALESCE(AVG(i.value_numeric) FILTER (
    WHERE i.indicator_type = 'coalition_stability'
      AND i.indicator_time >= NOW() - INTERVAL '180 days'
  ), 0) AS avg_stability_180d
FROM groups g
LEFT JOIN group_memberships gm ON gm.group_id = g.id
LEFT JOIN event_participants ep ON ep.group_id = g.id
LEFT JOIN events e ON e.id = ep.event_id
LEFT JOIN indicators i ON i.entity_kind = 'group' AND i.entity_id = g.id
GROUP BY g.id, g.name;

COMMIT;
