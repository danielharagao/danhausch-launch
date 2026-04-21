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
2. No bloco **Scenario Builder**, clique em **Novo cenário guiado**
3. Selecione preset-base:
   - `War`
   - `Energy Shock`
   - `Tech Sanctions`
   - `Election Crisis`
4. Ajuste **intensidade** (0–100) e **escopo** regional
5. Salve/aplique o cenário e use **Timeline & Playback** para avançar no tempo
6. Aplique filtros por tipo/região e quick views
7. Leia:
   - **Overview** (KPI)
   - **Network** (estrutura e conectividade)
   - **Drivers** (fatores causais dominantes)

## Persistência local
- Cenários criados no wizard são salvos em `localStorage` (`phAppScenariosV1`)
- Presets de filtros continuam em `localStorage` (`phAppPresetsV1`)
- É possível reaplicar, limpar ou excluir cenários sem alterar a seed original

## Filtros e visões
- Tipos: `country`, `leader`, `person`, `company`, `institution`
- Quick views:
  - Só países
  - Só líderes
  - Só empresas
  - Top influenciadores

## Explainability Panel v2 (novo)
Na aba **Drivers de Risco**, o painel agora responde claramente **“Why risk moved”** com três blocos:

1. **Cadeia causal por frame**
   - `Evento -> Macro -> Relações -> KPI`
   - Mostra o gatilho principal, variação macro relevante, estado das relações e efeito no `riskConflict`.

2. **Top drivers com evidência contextual**
   - Ranking de contribuição por driver no frame atual.
   - Cada driver traz evidência concreta do frame (ex.: variação macro, volatilidade média de relações, mobilização/confiança de grupos).

3. **Mini timeline causa-efeito**
   - Últimos frames (janela curta) com delta de risco, evento dominante e causa dominante.
   - Útil para leitura rápida de aceleração/desaceleração do risco.

### Linguagem para usuário não técnico
- O texto foi simplificado para leitura operacional.
- Evita jargão matemático e explica o impacto em termos de “puxou para cima/baixo”, “fortaleceu/enfraqueceu”.

## Boas práticas
- Sempre comparar no mínimo 2 cenários
- Registrar hipóteses e gatilhos de confirmação/negação
- Evitar leitura determinística de um único frame

## Referências de documentação
- Manual operacional: `/ph-graph/MANUAL.md`
- Manual web: `/ph-graph/manual-futuristas-historiadores.html`
