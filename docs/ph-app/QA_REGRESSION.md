# QA/Regressão — PH App + PH Graph

Data: 2026-04-21 (UTC)
Escopo: `docs/ph-app` e `docs/ph-graph`

## 1) Plano de regressão (foco funcional)

Checklist planejado:
1. Boot da aplicação sem erro crítico.
2. Fluxo principal (`Overview`, `Timeline`, `Network`, `Drivers`).
3. Tutorial guiado (abertura, navegação, fechamento).
4. Filtros (tipo, região, quick views, risco, busca, reset).
5. Network Explorer (render, detalhe, drill-down/up).
6. Macrotrends e Explainability (drivers + cadeia causal).
7. Compare mode (quando disponível na UI).
8. Scenario builder (quando disponível na UI).
9. Smoke checks automatizados (engine + adapter + explainability + cenário).
10. PH Graph: sanity check de entrada e integração com seed.

## 2) Execução e resultado

## PH App

### 2.1 Boot / fluxo principal
- `main.js` inicializa tema, adapter, tabs, filtros, timeline, network, presets, tutorial e render global.
- Seed padrão em uso: `assets/sim/seed.v5.json`.
- Resultado: ✅ sem erro de sintaxe em módulos principais (`node --check`).

### 2.2 Timeline / playback
- Slider e playback atualizam frame e repintam timeline, rede, KPIs e drivers.
- Resultado: ✅ comportamento implementado e consistente no código.

### 2.3 Tutorial
- Overlay com 5 passos, highlight por seletor, fechar por botão/overlay/Esc.
- Resultado: ✅ implementado.

### 2.4 Filtros
- Aplicação de filtros por submit, quick views e reset.
- Resultado: ✅ implementado.

### 2.5 Network Explorer
- Render de nós por nível (`people/supernodes/blocks`), detalhe de nó, conexões críticas e drill-up/down.
- Resultado: ✅ implementado.

### 2.6 Macrotrends + Explainability
- Macrotrends: disponível via `getMacroTrends` e sparkline por série.
- Explainability: drivers já existiam; faltava preencher os blocos `whyRiskMoved` e `causalTimeline` no UI.
- Resultado: ✅ corrigido (ver seção de correções).

### 2.7 Compare mode
- `initCompareMode` existe, porém controles (`#compareModeToggle`, `#compareScenario`) não estão presentes no HTML atual.
- Resultado: ℹ️ indisponível na UI atual (graceful no código; sem quebra).

### 2.8 Scenario builder
- API de cenário existe no adapter (`buildScenario`, `getFrameForScenario`).
- Não há painel dedicado de Scenario Builder no HTML atual.
- Resultado: ℹ️ indisponível na UI atual.

## PH Graph
- `docs/ph-graph/index.html` redireciona para `/ph-app/?tab=network`.
- `docs/ph-graph/assets/js/app.js` continua válido para modo gráfico standalone (fetch da seed v5 e filtros por camada/tipo/região/quick view).
- Resultado: ✅ sanity check de integração concluído.

## 3) Bugs críticos encontrados e correções

## Bug crítico corrigido — Explainability incompleta no painel Drivers
**Sintoma**: blocos `#whyRiskMoved` e `#causalTimeline` existiam em `index.html`, mas não eram preenchidos (UX de explainability parcial).

**Causa**: `renderDrivers()` só renderizava lista de drivers.

**Correção aplicada**: `docs/ph-app/assets/js/ui.js`
- `renderDrivers()` passou a:
  - usar frame atual + frame anterior;
  - renderizar evidência contextual por driver (`d.evidence`);
  - preencher painel `whyRiskMoved` com resumo e cadeia causal;
  - preencher `causalTimeline` com mini timeline causa→efeito.

**Status**: ✅ corrigido.

## 4) Smoke checks adicionados/atualizados

Arquivo atualizado: `docs/ph-app/assets/sim/tests.html`

Novas validações adicionadas:
- Explainability do adapter:
  - `getWhyRiskMoved(...)` retorna summary + chain válidos;
  - `getCausalTimeline(...)` retorna série não vazia.
- Cenário/compare engine-adapter:
  - `getFrameForScenario(...)` retorna frame válido;
  - KPIs continuam em faixa `[0,1]`;
  - cenário adiciona/complementa eventos no frame.

Checks pré-existentes mantidos (simulador, KPIs, Monte Carlo, V3 compatibilidade, network/drivers).

## 5) Evidências de execução (local)

Comando executado:
- `node tmp/qa-regression-check.mjs`

Saída resumida:
- frame `T+12`, score calculado, eventos > 0
- KPI cards válidos
- drivers > 0
- macro trends > 0
- network supernodes com dados
- `whyRiskMoved` com resumo
- `causalTimeline` com pontos

## 6) Pendências / observações

- Compare mode e Scenario Builder estão marcados como “quando disponível”: atualmente não expostos na UI (HTML), embora parte da lógica exista no adapter/state.
- Browser control service estava indisponível no ambiente durante esta execução; validação foi feita via inspeção de código + smoke checks executáveis locais.

## 7) Arquivos alterados nesta regressão
- `docs/ph-app/assets/js/ui.js`
- `docs/ph-app/assets/sim/tests.html`
- `docs/ph-app/QA_REGRESSION.md`
- `tmp/qa-regression-check.mjs` (suporte local de validação)
