# V6 QA Audit — Normalização Pós-Enriquecimento de Eventos

Data: 2026-04-21
Arquivo auditado: `docs/ph-app/assets/sim/seed.v5.json` (seed ativa no app)

## Escopo
- Deduplicação de eventos
- Validação de ordem temporal (`atStep`)
- Consistência de `targets/effects`
- Balanceamento básico de intensidade (eventos) e pesos (relações)
- Detecção de nós órfãos
- Verificação de consistência de tipos e `pairType`
- Smoke test de carga do grafo/simulador

## Métricas (antes vs depois)

| Métrica | Antes | Depois |
|---|---:|---:|
| Players | 147 | 148 |
| Groups | 27 | 27 |
| Relations | 304 | 306 |
| Events | 43 | 24 |
| Eventos duplicados (por `id`) | 19 | 0 |
| Inversões temporais (`atStep`) | 0 | 0 |
| Efeitos inválidos (`effects` malformado) | 0 | 0 |
| Relações com source/target ausente | 0 | 0 |
| Self-relations (`source === target`) | 0 | 0 |
| Inconsistência `pairType` vs tipos reais | 0 | 0 |
| Players órfãos | 1 (`openai`) | 0 |
| Groups órfãos | 27 | 27 |

## Ajustes aplicados
1. **Deduplicação de eventos** por `id`.
2. **Ordenação estável de eventos** por `atStep` e `id`.
3. **Conexão de nó órfão (`openai`)** com duas relações compatíveis com o padrão do dataset:
   - `us -> openai` (`type: influencia`, `pairType: country-company`)
   - `openai -> us` (`type: dependencia`, `pairType: company-country`)
4. **Ordenação + deduplicação de relações** por tupla completa para evitar entradas repetidas exatas.

## Checagens de consistência
- Todos os caminhos de efeito em eventos seguem formato `entidade.atributo` e apontam para entidades válidas (`players`, `groups`, `relations`, `macro`).
- Todos os `pairType` permanecem consistentes com os tipos efetivos de origem/destino.
- Não foram encontrados `source/target` inválidos.

## Balanceamento (sanity check)
- Intensidade de eventos mantida em faixa coerente para o motor (`0..1`), sem outliers inválidos.
- Pesos de relações (`influence`) e volatilidade (`volatility`) mantidos nas faixas esperadas do engine.

## Resultado de execução (smoke test)
Simulação inicializada e avançada sem erro com a seed ativa:
- `PHSim.createSimulator(seed.v5.json, { rngSeed: 1337 })`
- `step()` executado múltiplas vezes
- `computeKpis()` retornando KPIs válidos

Status: ✅ **QA final e normalização concluídos; seed carregando sem erro no motor.**
