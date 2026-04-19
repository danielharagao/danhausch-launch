-- Predictive History - Initial Schema (PostgreSQL + TimescaleDB + pgvector)
-- File: docs/sql/predictive_history_schema.sql

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Shared update trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== Core entities =====

CREATE TABLE IF NOT EXISTS players (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_key      TEXT,
  name              TEXT NOT NULL,
  player_type       TEXT NOT NULL DEFAULT 'individual',
  status            TEXT NOT NULL DEFAULT 'active',
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_key      TEXT,
  name              TEXT NOT NULL,
  group_type        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES groups(id),
  player_id         UUID NOT NULL REFERENCES players(id),
  role              TEXT,
  weight            DOUBLE PRECISION,
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_to          TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_relations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_player_id  UUID NOT NULL REFERENCES players(id),
  target_player_id  UUID NOT NULL REFERENCES players(id),
  relation_type     TEXT NOT NULL,
  strength          DOUBLE PRECISION,
  polarity          SMALLINT,
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_to          TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key         TEXT,
  event_type        TEXT NOT NULL,
  event_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ,
  source_system     TEXT,
  confidence        DOUBLE PRECISION,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding         VECTOR(1536),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id         UUID REFERENCES players(id),
  group_id          UUID REFERENCES groups(id),
  participant_role  TEXT,
  weight            DOUBLE PRECISION,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicators (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_kind       TEXT NOT NULL,
  entity_id         UUID NOT NULL,
  indicator_type    TEXT NOT NULL,
  indicator_time    TIMESTAMPTZ NOT NULL,
  value_numeric     DOUBLE PRECISION,
  value_text        TEXT,
  value_json        JSONB,
  unit              TEXT,
  confidence        DOUBLE PRECISION,
  source_event_id   UUID REFERENCES events(id),
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS narratives (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_kind       TEXT,
  entity_id         UUID,
  narrative_type    TEXT NOT NULL,
  title             TEXT,
  body              TEXT NOT NULL,
  language          TEXT NOT NULL DEFAULT 'pt-BR',
  source            TEXT,
  source_url        TEXT,
  confidence        DOUBLE PRECISION,
  embedding         VECTOR(1536),
  narrative_time    TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_key           TEXT,
  model_name        TEXT NOT NULL,
  model_version     TEXT,
  scenario_name     TEXT,
  status            TEXT NOT NULL DEFAULT 'queued',
  started_at        TIMESTAMPTZ,
  finished_at       TIMESTAMPTZ,
  seed              BIGINT,
  parameters        JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary    JSONB,
  created_by        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_steps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            UUID NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
  step_index        INTEGER NOT NULL,
  simulated_time    TIMESTAMPTZ,
  state_snapshot    JSONB,
  emitted_event_id  UUID REFERENCES events(id),
  metrics           JSONB,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convert high-volume temporal tables to hypertables
-- NOTE: kept as regular tables by default to preserve UUID PK-only model in v1.
-- If enabling hypertables later, adjust unique constraints/PK to include partitioning column.
-- SELECT create_hypertable('events', 'event_time', if_not_exists => TRUE);
-- SELECT create_hypertable('indicators', 'indicator_time', if_not_exists => TRUE);

-- updated_at triggers
CREATE TRIGGER trg_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_group_memberships_updated_at
BEFORE UPDATE ON group_memberships
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_player_relations_updated_at
BEFORE UPDATE ON player_relations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_event_participants_updated_at
BEFORE UPDATE ON event_participants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_indicators_updated_at
BEFORE UPDATE ON indicators
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_narratives_updated_at
BEFORE UPDATE ON narratives
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_simulation_runs_updated_at
BEFORE UPDATE ON simulation_runs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_simulation_steps_updated_at
BEFORE UPDATE ON simulation_steps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
