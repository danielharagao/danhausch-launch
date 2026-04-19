-- Predictive History - Indexes, Constraints, and Data Quality Rules
-- File: docs/sql/predictive_history_indexes.sql

BEGIN;

-- ========== Uniqueness / business keys ==========

ALTER TABLE players
  ADD CONSTRAINT uq_players_external_key UNIQUE (external_key);

ALTER TABLE groups
  ADD CONSTRAINT uq_groups_external_key UNIQUE (external_key);

ALTER TABLE events
  ADD CONSTRAINT uq_events_event_key UNIQUE (event_key);

ALTER TABLE simulation_runs
  ADD CONSTRAINT uq_simulation_runs_run_key UNIQUE (run_key);

ALTER TABLE group_memberships
  ADD CONSTRAINT uq_group_membership_interval UNIQUE (group_id, player_id, valid_from);

ALTER TABLE player_relations
  ADD CONSTRAINT uq_player_relation_interval UNIQUE (source_player_id, target_player_id, relation_type, valid_from);

ALTER TABLE event_participants
  ADD CONSTRAINT uq_event_participant UNIQUE (event_id, player_id, group_id, participant_role);

ALTER TABLE simulation_steps
  ADD CONSTRAINT uq_simulation_steps_run_step UNIQUE (run_id, step_index);

-- ========== Check constraints ==========

ALTER TABLE players
  ADD CONSTRAINT ck_players_type CHECK (player_type IN ('individual', 'organization', 'bot', 'collective')),
  ADD CONSTRAINT ck_players_status CHECK (status IN ('active', 'inactive', 'archived'));

ALTER TABLE groups
  ADD CONSTRAINT ck_groups_status CHECK (status IN ('active', 'inactive', 'archived'));

ALTER TABLE group_memberships
  ADD CONSTRAINT ck_group_memberships_weight CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1)),
  ADD CONSTRAINT ck_group_memberships_validity CHECK (valid_to IS NULL OR valid_to > valid_from);

ALTER TABLE player_relations
  ADD CONSTRAINT ck_player_relations_strength CHECK (strength IS NULL OR (strength >= 0 AND strength <= 1)),
  ADD CONSTRAINT ck_player_relations_polarity CHECK (polarity IS NULL OR polarity IN (-1, 0, 1)),
  ADD CONSTRAINT ck_player_relations_no_self CHECK (source_player_id <> target_player_id),
  ADD CONSTRAINT ck_player_relations_validity CHECK (valid_to IS NULL OR valid_to > valid_from);

ALTER TABLE events
  ADD CONSTRAINT ck_events_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  ADD CONSTRAINT ck_events_end_time CHECK (end_time IS NULL OR end_time >= event_time);

ALTER TABLE event_participants
  ADD CONSTRAINT ck_event_participants_actor CHECK (
    (player_id IS NOT NULL AND group_id IS NULL) OR
    (player_id IS NULL AND group_id IS NOT NULL)
  ),
  ADD CONSTRAINT ck_event_participants_weight CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1));

ALTER TABLE indicators
  ADD CONSTRAINT ck_indicators_entity_kind CHECK (entity_kind IN ('player', 'group', 'relation', 'system')),
  ADD CONSTRAINT ck_indicators_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1));

ALTER TABLE narratives
  ADD CONSTRAINT ck_narratives_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1));

ALTER TABLE simulation_runs
  ADD CONSTRAINT ck_simulation_runs_status CHECK (status IN ('queued', 'running', 'finished', 'failed', 'cancelled')),
  ADD CONSTRAINT ck_simulation_runs_time CHECK (finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at);

-- ========== B-Tree indexes ==========

CREATE INDEX IF NOT EXISTS idx_players_name ON players (name);
CREATE INDEX IF NOT EXISTS idx_groups_type_name ON groups (group_type, name);

CREATE INDEX IF NOT EXISTS idx_group_memberships_group_time ON group_memberships (group_id, valid_from DESC);
CREATE INDEX IF NOT EXISTS idx_group_memberships_player_time ON group_memberships (player_id, valid_from DESC);

CREATE INDEX IF NOT EXISTS idx_player_relations_source_type ON player_relations (source_player_id, relation_type, valid_from DESC);
CREATE INDEX IF NOT EXISTS idx_player_relations_target_type ON player_relations (target_player_id, relation_type, valid_from DESC);

CREATE INDEX IF NOT EXISTS idx_events_type_time ON events (event_type, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_source_time ON events (source_system, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants (event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_player ON event_participants (player_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_group ON event_participants (group_id);

CREATE INDEX IF NOT EXISTS idx_indicators_entity_type_time ON indicators (entity_kind, entity_id, indicator_type, indicator_time DESC);
CREATE INDEX IF NOT EXISTS idx_indicators_source_event ON indicators (source_event_id);

CREATE INDEX IF NOT EXISTS idx_narratives_entity_time ON narratives (entity_kind, entity_id, narrative_time DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_status_created ON simulation_runs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_steps_run_idx ON simulation_steps (run_id, step_index);

-- ========== GIN / JSONB indexes ==========

CREATE INDEX IF NOT EXISTS gin_players_metadata ON players USING GIN (metadata);
CREATE INDEX IF NOT EXISTS gin_groups_metadata ON groups USING GIN (metadata);
CREATE INDEX IF NOT EXISTS gin_group_memberships_metadata ON group_memberships USING GIN (metadata);
CREATE INDEX IF NOT EXISTS gin_player_relations_metadata ON player_relations USING GIN (metadata);
CREATE INDEX IF NOT EXISTS gin_events_payload ON events USING GIN (payload);
CREATE INDEX IF NOT EXISTS gin_indicators_value_json ON indicators USING GIN (value_json);
CREATE INDEX IF NOT EXISTS gin_narratives_metadata ON narratives USING GIN (metadata);
CREATE INDEX IF NOT EXISTS gin_simulation_runs_parameters ON simulation_runs USING GIN (parameters);
CREATE INDEX IF NOT EXISTS gin_simulation_steps_state_snapshot ON simulation_steps USING GIN (state_snapshot);

-- ========== pgvector ANN indexes ==========

CREATE INDEX IF NOT EXISTS ivfflat_events_embedding_cosine
ON events USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS ivfflat_narratives_embedding_cosine
ON narratives USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ========== Hypertable tuning (TimescaleDB) ==========
-- NOTE: disabled by default because schema v1 keeps regular tables (non-hypertable).
-- Enable when events/indicators are migrated to hypertables.
-- ALTER TABLE events SET (
--   timescaledb.compress,
--   timescaledb.compress_segmentby = 'event_type,source_system',
--   timescaledb.compress_orderby = 'event_time DESC'
-- );
-- SELECT add_compression_policy('events', INTERVAL '30 days', if_not_exists => TRUE);
-- SELECT add_retention_policy('events', INTERVAL '2 years', if_not_exists => TRUE);
--
-- ALTER TABLE indicators SET (
--   timescaledb.compress,
--   timescaledb.compress_segmentby = 'entity_kind,indicator_type',
--   timescaledb.compress_orderby = 'indicator_time DESC'
-- );
-- SELECT add_compression_policy('indicators', INTERVAL '30 days', if_not_exists => TRUE);
-- SELECT add_retention_policy('indicators', INTERVAL '2 years', if_not_exists => TRUE);

COMMIT;
