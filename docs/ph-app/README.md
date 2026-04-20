# Predictive History · War Room

App operacional de simulação e leitura de risco geopolítico.

## Fonte de dados padrão
- Seed ativa: `assets/sim/seed.v5.json`
- Engine: `assets/sim/engine.js`
- Adapter: `assets/js/sim-adapter.js`

## KPIs (o que significa “risco”)
1. `riskConflict` → risco relativo de escalada de conflito
2. `institutionalStability` → robustez de governança institucional
3. `polarization` → fragmentação/atrito social-político
4. `economicResilience` → capacidade macro de absorver choques

> Escala exibida é relativa ao modelo (0–100), útil para comparar cenários.

## Como simular
1. Abra `/ph-app/`
2. Use **Timeline & Playback** para avançar no tempo
3. Aplique filtros por tipo/região e quick views
4. Leia:
   - **Overview** (KPI)
   - **Network** (estrutura e conectividade)
   - **Drivers** (fatores causais dominantes)

## Filtros e visões
- Tipos: `country`, `leader`, `person`, `company`, `institution`
- Quick views:
  - Só países
  - Só líderes
  - Só empresas
  - Top influenciadores

## Boas práticas
- Sempre comparar no mínimo 2 cenários
- Registrar hipóteses e gatilhos de confirmação/negação
- Evitar leitura determinística de um único frame

## Referências de documentação
- Manual operacional: `/ph-graph/MANUAL.md`
- Manual web: `/ph-graph/manual-futuristas-historiadores.html`
