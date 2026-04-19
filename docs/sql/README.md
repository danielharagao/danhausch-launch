# Predictive History - Data Layer (PostgreSQL + TimescaleDB + pgvector)

## Arquivos

- `predictive_history_schema.sql`: DDL base do domínio (tabelas e hypertables).
- `predictive_history_indexes.sql`: índices, constraints, regras de qualidade e políticas Timescale.

## Decisões de modelagem

1. **Separação entre estrutura e otimização**
   - O schema inicial fica isolado de índices/constraints avançadas para facilitar bootstrap, testes e migrações incrementais.

2. **Modelo orientado a tempo + grafo leve**
   - `events` e `indicators` são séries temporais (hypertables).
   - `player_relations` e `group_memberships` mantêm histórico por intervalos (`valid_from` / `valid_to`) para análises históricas e simulação.

3. **Flexibilidade controlada com JSONB**
   - Campos `metadata`/`payload` permitem evolução sem bloquear ingestão.
   - Constraints cobrem invariantes críticos (intervalos de tempo, faixas de confiança, cardinalidade de participante etc.).

4. **Busca semântica com embeddings**
   - `events.embedding` e `narratives.embedding` usam `vector(1536)` com índices `ivfflat` para recuperação aproximada por similaridade.

5. **Simulação como trilha auditável**
   - `simulation_runs` guarda configuração/estado do experimento.
   - `simulation_steps` registra evolução passo a passo e ligação opcional com eventos emitidos.

## Estratégia de evolução

### Roadmap V2 (implementado)

1. **Migração avançada**
   - `migrations/V2__predictive_history_advanced.sql` adiciona integridade temporal forte com `EXCLUDE USING gist`.

2. **Camadas auxiliares de domínio**
   - Novas dimensões para etnia (`ethnicity_catalog`, `player_ethnicity_history`) e taxonomia narrativa (`narrative_themes`, `narrative_theme_links`).

3. **Lineage e auditoria**
   - `data_lineage_jobs` + `data_lineage_entities` para rastrear origem operacional.
   - `audit_entity_changes` + triggers para trilha de mudanças em entidades críticas.

4. **Feature views analíticas**
   - Views prontas para modelagem e monitoramento:
     - `vw_player_influence_features`
     - `vw_region_risk_features`
     - `vw_coalition_stability_features`

5. **Seed e queries de referência**
   - `seed/predictive_history_seed.sql` com dados coerentes para cenários analíticos.
   - `QUERIES.md` com consultas-chave de influência, risco regional, ruptura e tendência temporal.

### Roadmap V3 (próximos passos)

1. **Qualidade de dados automatizada**
   - Testes SQL/dbt (unicidade, não sobreposição, anomalias de distribuição e nullability crítica).

2. **Serving layer para ML/BI**
   - Materialized views incrementais + refresh policies para features de baixa latência.

3. **Observabilidade de pipelines**
   - Métricas de freshness, volume, atraso e taxa de erro por fonte.

4. **Evolução de busca vetorial**
   - Ajuste dinâmico de ANN (`ivfflat`/`hnsw`) e estratégia de reindex por crescimento de corpus.

5. **Governança e segurança**
   - Row-level security por tenant/equipe, mascaramento de atributos sensíveis e políticas de retenção por classe de dado.
