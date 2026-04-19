# Predictive History Backend (FastAPI + PostgreSQL)

Backend REST com persistência real para o projeto Predictive History.

## Entregáveis implementados

- FastAPI app em `backend/app`
- Rotas:
  - `GET /health`
  - `POST /api/scenario/run`
  - `GET /api/network/snapshot`
  - `GET /api/explain/top-drivers`
  - `CRUD /api/presets`
- Integração com schema SQL existente em `docs/sql`
- Script de bootstrap para aplicar schema, índices, migração V2, seed e tabela de presets da API
- CORS habilitado para frontend local e GitHub Pages (`*.github.io`)

## Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2
- PostgreSQL (recomendado com TimescaleDB + pgvector)

## Subir banco local

> O schema em `docs/sql` usa extensões `timescaledb`, `vector`, `pgcrypto` e `btree_gist`.

```bash
cd backend
docker compose up -d
```

## Configuração

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Bootstrap do banco

Defina uma URL para `psql` (sem `+psycopg`):

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/predictive_history"
./scripts/bootstrap_db.sh
```

O script aplica, nesta ordem:
1. `docs/sql/predictive_history_schema.sql`
2. `docs/sql/predictive_history_indexes.sql`
3. `docs/sql/migrations/V2__predictive_history_advanced.sql`
4. `docs/sql/seed/predictive_history_seed.sql`
5. `backend/sql/001_api_presets.sql`

## Rodar API

No `.env`, use URL SQLAlchemy:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/predictive_history
```

Depois:

```bash
cd backend
source .venv/bin/activate
./scripts/dev.sh
```

Servidor em `http://localhost:8000`.
Documentação interativa em `http://localhost:8000/docs`.

## Exemplos rápidos

### Health

```bash
curl http://localhost:8000/health
```

### Criar run

```bash
curl -X POST http://localhost:8000/api/scenario/run \
  -H "Content-Type: application/json" \
  -d '{
    "run_key": "run-demo-001",
    "model_name": "predictive-history-core",
    "scenario_name": "baseline",
    "parameters": {"horizon_days": 30},
    "result_summary": {"risk_score": 0.42}
  }'
```

### Presets

```bash
curl -X POST http://localhost:8000/api/presets \
  -H "Content-Type: application/json" \
  -d '{"name":"default-baseline","payload":{"horizon_days":30},"tags":["baseline"]}'

curl http://localhost:8000/api/presets
```
