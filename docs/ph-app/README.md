# Predictive History · War Room (GitHub Pages)

Aplicação estática em `docs/ph-app/` conectada ao simulador real (`assets/sim/engine.js`) usando o dataset oficial (`assets/sim/seed.json`).

## Arquitetura (sem mock)

UI (`assets/js`) agora funciona em cima de um adapter de simulação:

- `assets/sim/seed.json`: baseline de players, groups, relations, macro e eventos agendados.
- `assets/sim/engine.js`: motor PHSim (step-by-step, KPIs, explainability, choques/eventos).
- `assets/js/sim-adapter.js`: ponte limpa entre engine e estado da UI.
- `assets/js/state.js`: estado de tela (filtros, tab, playback, tema, presets).
- `assets/js/ui.js`: renderização e interações (KPIs, timeline, network explorer, drivers).
- `assets/js/main.js`: bootstrap assíncrono (carrega seed + inicializa adapter/UI).

## Fluxo de dados real

1. `index.html` carrega `assets/sim/engine.js` (global `window.PHSim`).
2. `main.js` chama `createPHAdapter({ seedUrl })`.
3. O adapter faz `fetch(seed.json)` e cria `PHSim.createSimulator(seed, { rngSeed })`.
4. Cada frame da timeline é gerado por `sim.step()` (não há arrays hardcoded).
5. Para cada frame, o adapter expõe:
   - KPIs derivados do engine (`riskConflict`, `institutionalStability`, `polarization`, `economicResilience`)
   - eventos aplicados no step
   - explainability (`topDrivers`)
   - snapshot completo do estado naquele step
6. A UI renderiza:
   - **Overview**: KPIs do frame atual + contagem de eventos na janela
   - **Timeline**: playback baseado em frames reais do simulador
   - **Network Explorer**: dados reais de groups/players/relations do snapshot atual
   - **Drivers de Risco**: contribuições reais de explainability do engine

## Notas de modelagem da UI

- Níveis do explorer mantidos como `people -> supernodes -> blocks`, mapeados para:
  - `people` = `groups`
  - `supernodes` = `players`
  - `blocks` = `relations`
- Scores exibidos nos nós são calculados a partir dos atributos reais do seed/state (sem catálogo demo).
- Playback é incremental e em tempo real: ao avançar slider/play, novos steps são simulados sob demanda.

## Como rodar

1. Abra `docs/ph-app/index.html` no browser.
2. Ajuste filtros e clique em **Aplicar**.
3. Use **Play/Pause** na timeline para avançar os steps do engine.
4. Explore nós por nível no Network Explorer.
5. Salve/carregue presets localmente (`localStorage`).

## Critério de integridade aplicado

✅ UI sem arrays demo/hardcoded para timeline, network, KPIs e drivers.

✅ Fonte única de verdade: `seed.json` + `engine.js`.
