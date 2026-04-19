#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set. Example: postgresql://postgres:postgres@localhost:5432/predictive_history"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$(cd "$ROOT_DIR/.." && pwd)"

run_sql() {
  local file="$1"
  echo "==> Applying ${file}"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
}

run_sql "$PROJECT_DIR/docs/sql/predictive_history_schema.sql"
run_sql "$PROJECT_DIR/docs/sql/predictive_history_indexes.sql"
run_sql "$PROJECT_DIR/docs/sql/migrations/V2__predictive_history_advanced.sql"
run_sql "$PROJECT_DIR/docs/sql/seed/predictive_history_seed.sql"
run_sql "$ROOT_DIR/sql/001_api_presets.sql"

echo "✅ Bootstrap complete"
