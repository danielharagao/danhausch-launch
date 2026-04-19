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

1. **Versionamento por migrações**
   - Tratar estes arquivos como baseline v1.
   - Próximas mudanças em migrations incrementais (`V2__...`, `V3__...`) para preservar rastreabilidade.

2. **Particionamento e retenção por domínio**
   - Ajustar políticas de compressão/retenção por criticidade (ex.: eventos brutos curtos, indicadores agregados longos).

3. **Integridade temporal avançada**
   - Futuro: adicionar `EXCLUDE USING gist` para evitar sobreposição de intervalos por chave de negócio.

4. **Performance progressiva**
   - Revisar `lists` dos índices `ivfflat` conforme volume real.
   - Criar materialized views para métricas e features de treinamento recorrentes.

5. **Governança de dados**
   - Incluir trilha de lineage (origem, job_id, versão do parser/modelo) e regras de qualidade automatizadas (dbt/tests ou checks SQL).
